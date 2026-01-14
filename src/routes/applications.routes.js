import { Router } from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import verifyRole from "../middleware/verifyRole.js";

import {
  createApplication,
  getMyApplications,
  getApplicationsForTuition,
  rejectApplication,
  getTutorApplications,
  getStudentApplications,
} from "../controllers/applications.controller.js";

const router = Router();

// tutor apply
router.post("/", verifyJWT, verifyRole(["tutor"]), createApplication);

// tutor own applications
router.get("/my", verifyJWT, verifyRole(["tutor"]), getMyApplications);

// ✅ tutor dashboard safe endpoint
router.get("/tutor", verifyJWT, verifyRole(["tutor"]), getTutorApplications);

// ✅ student dashboard safe endpoint
router.get(
  "/student",
  verifyJWT,
  verifyRole(["student"]),
  getStudentApplications
);

// student view applications for a tuition
router.get(
  "/tuition/:tuitionId",
  verifyJWT,
  verifyRole(["student"]),
  getApplicationsForTuition
);

// student reject
router.patch(
  "/:id/reject",
  verifyJWT,
  verifyRole(["student"]),
  rejectApplication
);

export default router;
