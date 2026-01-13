import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import verifyRole from "../middleware/verifyRole.js";
import {
  getPublicStats,
  getAdminAnalytics,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// ✅ Public stats (no auth)
router.get("/public-stats", getPublicStats);

// ✅ Admin analytics (admin only)
router.get(
  "/admin-analytics",
  verifyJWT,
  verifyRole("admin"),
  getAdminAnalytics
);

export default router;
