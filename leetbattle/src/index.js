import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import matchRoutes from "./routes/matches.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import matchmakingRoutes from "./routes/matchmaking.js";
import { initSocket } from "./socket.js";
import { queueSize } from "./services/matchmaking.js";

const app = express();
const server = http.createServer(app);

// ── Global middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "64kb" }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: "Too many auth attempts" } });

app.use("/api", limiter);
app.use("/api/auth", authLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/matchmaking", matchmakingRoutes);

// Health / status
app.get("/api/status", (req, res) => {
  res.json({ ok: true, queueSize: queueSize(), ts: Date.now() });
});

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Socket.IO ──────────────────────────────────────────────────────────────
initSocket(server);

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`LeetBattle server running on :${PORT}`));
