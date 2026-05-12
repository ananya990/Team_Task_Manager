import "dotenv/config";
import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { errorHandler, notFound } from "./middlewares/index";

// ─── Routes ───────────────────────────────────────────────
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import userRoutes from "./routes/user.routes";

const app = express();
const httpServer = http.createServer(app);

/* ─────────────────────────────────────────────
   🔥 CORS CONFIG (MUST BE FIRST)
───────────────────────────────────────────── */

const corsOptions = {
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

/* IMPORTANT: Handle preflight globally */
app.options("*", cors(corsOptions));

/* ─────────────────────────────────────────────
   🔥 SECURITY HEADERS
───────────────────────────────────────────── */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* ─────────────────────────────────────────────
   🔥 SOCKET.IO
───────────────────────────────────────────── */

export const io = new SocketServer(httpServer, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join:project", (projectId: string) => {
    socket.join(`project:${projectId}`);
  });

  socket.on("leave:project", (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

/* ─────────────────────────────────────────────
   🔥 GENERAL MIDDLEWARES
───────────────────────────────────────────── */

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

/* ─────────────────────────────────────────────
   🔥 RATE LIMITING
───────────────────────────────────────────── */

const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  max: parseInt(env.RATE_LIMIT_MAX, 10),
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many auth attempts, please try again later",
  },
});

app.use("/api/auth", authLimiter);

/* ─────────────────────────────────────────────
   🔥 HEALTH CHECK
───────────────────────────────────────────── */

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

/* ─────────────────────────────────────────────
   🔥 ROUTES
───────────────────────────────────────────── */

app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

/* ─────────────────────────────────────────────
   🔥 ERROR HANDLERS
───────────────────────────────────────────── */

app.use(notFound);
app.use(errorHandler);

/* ─────────────────────────────────────────────
   🔥 START SERVER
───────────────────────────────────────────── */

const PORT = parseInt(env.PORT, 10);

async function main() {
  await connectDatabase();

  httpServer.listen(PORT, () => {
    console.log(`🚀 TaskManager API running on port ${PORT} [${env.NODE_ENV}]`);
    console.log("📡 Socket.IO ready");
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

export { app, httpServer };