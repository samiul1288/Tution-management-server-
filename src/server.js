import http from "http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import app from "./app.js";
import connectDB from "./config/db.js";
import seedDemoUsers from "./utils/seedDemoUsers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ always load root .env (project root)
dotenv.config({ path: path.join(__dirname, "../.env") });

// optional debug
console.log("CWD:", process.cwd());
console.log("STRIPE KEY LOADED?", !!process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const shutdown = (signal) => {
  console.log(`🛑 ${signal} received. Shutting down...`);
  server.close(() => {
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });
};

const start = async () => {
  try {
    // ✅ 1) connect DB
    await connectDB();
    console.log("✅ MongoDB connected");

    // ✅ 2) seed demo users (student/admin) after DB connect
    await seedDemoUsers();

    // ✅ 3) start server
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // ✅ graceful shutdown
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();
