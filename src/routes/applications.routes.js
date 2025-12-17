import express from "express";
import {
  createApplication,
  getMyApplications,
  getApplicationsForTuition,
  rejectApplication,
} from "../controllers/applications.controller.js";
import  verifyJWT  from "../middleware/verifyJWT.js";
import  verifyRole  from "../middleware/verifyRole.js";

const router = express.Router();

// tutor
router.post("/", verifyJWT, verifyRole("tutor"), createApplication);
router.get("/my", verifyJWT, verifyRole("tutor"), getMyApplications);

// student
router.get(
  "/tuition/:tuitionId",
  verifyJWT,
  verifyRole("student"),
  getApplicationsForTuition
);
router.patch(
  "/:id/reject",
  verifyJWT,
  verifyRole("student"),
  rejectApplication
);

export default router;
