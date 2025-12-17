import express from "express";
import {
  createOrLoginUser,
  logoutUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

// POST /api/auth/jwt
router.post("/jwt", createOrLoginUser);

// POST /api/auth/logout
router.post("/logout", logoutUser);

export default router;
