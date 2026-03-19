import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3).max(24).regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * POST /auth/signup
 * Creates a Supabase auth user + a public profile row.
 */
router.post("/signup", async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password, username } = parsed.data;

  // Check username uniqueness
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // Create profile (trigger also handles this, but explicit is safer)
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    username,
    email,
    elo: 1200,
    match_count: 0,
    wins: 0,
    losses: 0,
  });

  if (profileError) {
    // Roll back auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    return res.status(500).json({ error: "Failed to create profile" });
  }

  res.status(201).json({ message: "Account created. Please verify your email." });
});

/**
 * POST /auth/signin
 * Returns Supabase session tokens.
 */
router.post("/signin", async (req, res) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  });
});

/**
 * POST /auth/refresh
 * Exchange a refresh token for a new session.
 */
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "refreshToken required" });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error) return res.status(401).json({ error: "Invalid refresh token" });

  res.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
  });
});

/**
 * POST /auth/signout
 */
router.post("/signout", requireAuth, async (req, res) => {
  await supabase.auth.admin.signOut(req.headers.authorization.slice(7));
  res.json({ message: "Signed out" });
});

export default router;
