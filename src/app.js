import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import tuitionsRoutes from "./routes/tuitions.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ✅ middleware first
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("eTuitionBd API running");
});
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tuitions", tuitionsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ error handlers last
app.use(notFound);
app.use(errorHandler);

export default app;
