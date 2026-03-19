import jwt from "jsonwebtoken";
import { supabase } from "../db/supabase.js";

/**
 * Express middleware — validates the Supabase JWT from the
 * Authorization: Bearer <token> header and attaches req.user.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  const token = header.slice(7);

  try {
    // Let Supabase validate the token — this also refreshes user data
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = data.user;
    next();
  } catch {
    return res.status(401).json({ error: "Token verification failed" });
  }
}

/**
 * Lightweight JWT verification for Socket.IO handshakes.
 * Returns the decoded payload or throws.
 * @param {string} token
 */
export function verifySocketToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
