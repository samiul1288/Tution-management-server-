import { Router } from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import verifyRole from "../middleware/verifyRole.js";

import {
  getPublicContacts,
  getTutors,
  getAllTutors,
  getMe,
  updateMe,
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

/* ======================================
   ✅ PUBLIC ROUTES (NO AUTH)
   Base: /api/users
====================================== */

// ✅ Contact page uses this
// GET /api/users/public/contacts?role=tutor|student|admin
router.get("/public/contacts", getPublicContacts);

// ✅ Public tutor lists
router.get("/tutors", getTutors);
router.get("/all-tutors", getAllTutors);

/* ======================================
   ✅ LOGGED IN ROUTES (ANY ROLE)
====================================== */

// GET /api/users/me
router.get("/me", verifyJWT, getMe);

// PATCH /api/users/me
router.patch("/me", verifyJWT, updateMe);

/* ======================================
   ✅ ADMIN ROUTES
====================================== */

// GET /api/users?q=&role=&status=
router.get("/", verifyJWT, verifyRole(["admin"]), getAllUsersAdmin);

// GET /api/users/all?role=&status=&search=
router.get("/all", verifyJWT, verifyRole(["admin"]), getAllUsers);

// PATCH /api/users/role/:id
router.patch("/role/:id", verifyJWT, verifyRole(["admin"]), updateUserRole);

// PATCH /api/users/status/:id
router.patch("/status/:id", verifyJWT, verifyRole(["admin"]), updateUserStatus);

// PATCH /api/users/:id/block  (status in body)
router.patch("/:id/block", verifyJWT, verifyRole(["admin"]), toggleUserBlock);

// DELETE /api/users/:id
router.delete("/:id", verifyJWT, verifyRole(["admin"]), deleteUser);

// DELETE /api/users/admin/:id
router.delete("/admin/:id", verifyJWT, verifyRole(["admin"]), deleteUserAdmin);

/* ======================================
   ✅ DYNAMIC ROUTE ALWAYS LAST
====================================== */

// GET /api/users/:id  (public or protected? you kept it public)
router.get("/:id", getUserById);

export default router;
