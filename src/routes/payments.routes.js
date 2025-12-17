
import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  getMyPayments,
  getTutorPayments,
} from "../controllers/payments.controller.js";
import verifyJWT  from "../middleware/verifyJWT.js";
import verifyRole  from "../middleware/verifyRole.js";

const router = express.Router();

// student
router.post(
  "/create-intent",
  verifyJWT,
  verifyRole("student","tutor"),
  createPaymentIntent
);


router.post("/confirm", verifyJWT, verifyRole("student"), confirmPayment);

router.get("/my", verifyJWT, verifyRole("tutor", "student"), getMyPayments);
// tutor
router.get("/tutor/my", verifyJWT, verifyRole("tutor"), getTutorPayments);

export default router;
