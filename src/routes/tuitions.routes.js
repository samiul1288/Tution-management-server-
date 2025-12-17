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

/* =========================
   PUBLIC
========================= */
router.get("/", getAllTuitions); // public list

/* =========================
   STUDENT (STATIC FIRST)
========================= */
router.get("/me", verifyJWT, verifyRole("student"), getMyTuitions);
router.post("/", verifyJWT, verifyRole("student"), createTuition);
router.patch("/:id", verifyJWT, verifyRole("student"), updateTuition);
router.delete("/:id", verifyJWT, verifyRole("student"), deleteTuition);

/* =========================
   TUTOR (STATIC FIRST)
========================= */
router.get(
  "/tutor/ongoing",
  verifyJWT,
  verifyRole("tutor"),
  getTutorOngoingTuitions
);
router.get("/ongoing", verifyJWT, verifyRole("tutor"), getTutorOngoingTuitions);
/* =========================
   ADMIN (STATIC FIRST)
========================= */
router.get("/admin", verifyJWT, verifyRole("admin"), getAllTuitionsAdmin);

// ✅ match frontend: /tuitions/${id}/status
router.patch(
  "/:id/status",
  verifyJWT,
  verifyRole("admin"),
  updateTuitionStatus
);

/* =========================
   DYNAMIC ROUTE LAST
========================= */
router.get("/:id", getTuitionById); // public details (must be last)

export default router;
