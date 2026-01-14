import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import verifyRole from "../middleware/verifyRole.js";

import {
  createTuition,
  getAllTuitions,
  getTuitionById,
  updateTuition,
  deleteTuition,
  getAllTuitionsAdmin,
  updateTuitionStatus,
  getMyTuitions,
  getTutorOngoingTuitions,
} from "../controllers/tuitions.controller.js";

const router = express.Router();

/* PUBLIC */
router.get("/", getAllTuitions);

/* STUDENT */
router.get("/me", verifyJWT, verifyRole(["student"]), getMyTuitions);
router.post("/", verifyJWT, verifyRole(["student"]), createTuition);
router.patch("/:id", verifyJWT, verifyRole(["student"]), updateTuition);
router.delete("/:id", verifyJWT, verifyRole(["student"]), deleteTuition);

/* TUTOR */
router.get(
  "/tutor/ongoing",
  verifyJWT,
  verifyRole(["tutor"]),
  getTutorOngoingTuitions
);
router.get(
  "/ongoing",
  verifyJWT,
  verifyRole(["tutor"]),
  getTutorOngoingTuitions
);

/* ADMIN */
router.get("/admin", verifyJWT, verifyRole(["admin"]), getAllTuitionsAdmin);
router.patch(
  "/:id/status",
  verifyJWT,
  verifyRole(["admin"]),
  updateTuitionStatus
);

/* DYNAMIC LAST */
router.get("/:id", getTuitionById);

export default router;
