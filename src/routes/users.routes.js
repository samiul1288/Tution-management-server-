import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import verifyRole from "../middleware/verifyRole.js";

import {
  getTutors,
  getAllTutors,
  getAllUsersAdmin,
  getUserById,
  getMe,
  updateMe,
  updateUserRole,
  updateUserStatus,
  deleteUserAdmin,
} from "../controllers/users.controller.js";

const router = express.Router();

// public
router.get("/tutors", getTutors);
router.get("/tutors/all", getAllTutors);
router.get("/:id", getUserById);

// logged-in any role
router.get("/me", verifyJWT, getMe);
router.patch("/me", verifyJWT, updateMe);

// admin
router.get("/", verifyJWT, verifyRole("admin"), getAllUsersAdmin);
router.patch("/:id/role", verifyJWT, verifyRole("admin"), updateUserRole);
router.patch("/:id/status", verifyJWT, verifyRole("admin"), updateUserStatus);
router.delete("/:id", verifyJWT, verifyRole("admin"), deleteUserAdmin);

export default router;
