import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import verifyRole from "../middleware/verifyRole.js";
import { getAdminAnalytics } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
  "/admin-analytics",
  verifyJWT,
  verifyRole("admin"),
  getAdminAnalytics
);

export default router;
