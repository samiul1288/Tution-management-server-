import http from "http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ always load root .env
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("CWD:", process.cwd());
console.log("STRIPE KEY LOADED?", !!process.env.STRIPE_SECRET_KEY);

import app from "./app.js";
import connectDB from "./config/db.js";

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const start = async () => {
  try {
    await connectDB();
    server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
