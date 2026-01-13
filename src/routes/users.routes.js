import { Router } from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import verifyRole from "../middleware/verifyRole.js";

import {
  getPublicContacts,
  getTutors,
  getMe,
  updateMe,
  getAllTutors,
  getUserById,
  getAllUsersAdmin,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  toggleUserBlock,
  deleteUser,
  deleteUserAdmin,
} from "../controllers/users.controller.js";

const router = Router();

/**
 * ✅ PUBLIC ROUTES (no auth)
 * GET /api/users/public/contacts?role=tutor|student|admin
 */
router.get("/public/contacts", getPublicContacts);

// (optional) public tutors list
router.get("/tutors", getTutors);
router.get("/all-tutors", getAllTutors);
router.get("/:id", getUserById);

/**
 * ✅ LOGGED IN ROUTES
 * GET /api/users/me
 * PATCH /api/users/me
 */
router.get("/me", verifyJWT, getMe);
router.patch("/me", verifyJWT, updateMe);

/**
 * ✅ ADMIN ROUTES
 */
router.get("/", verifyJWT, verifyRole(["admin"]), getAllUsersAdmin);
router.get("/all", verifyJWT, verifyRole(["admin"]), getAllUsers);

router.patch("/role/:id", verifyJWT, verifyRole(["admin"]), updateUserRole);
router.patch("/status/:id", verifyJWT, verifyRole(["admin"]), updateUserStatus);
router.patch("/:id/block", verifyJWT, verifyRole(["admin"]), toggleUserBlock);

router.delete("/:id", verifyJWT, verifyRole(["admin"]), deleteUser);
router.delete("/admin/:id", verifyJWT, verifyRole(["admin"]), deleteUserAdmin);

export default router;
