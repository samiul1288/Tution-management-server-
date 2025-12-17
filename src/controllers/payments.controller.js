import  stripe  from "../utils/stripeClient.js";
import Payment from "../models/Payment.model.js";
import Application from "../models/Application.model.js";


/**
 * POST /api/payments/create-intent  (student)
 * body: { amount }
 */
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount } = req.body; // e.g. 500 (BDT)

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      res.status(400);
      throw new Error("Invalid amount");
    }

    // Stripe সাধারণত currency অনুযায়ী smallest unit নেয় (USD => cents)
    // BDT support থাকলে "bdt" দিতে পারো, না হলে assignment/test এর জন্য USD রাখো।
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numericAmount * 100),
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/confirm  (student)
 * body: { transactionId, applicationId, amount, tuitionId, tutorId }
 *
 * Rules:
 * - payment saved
 * - application APPROVED after payment success
 * - (optional but recommended) same tuition's other pending apps auto REJECTED
 * - prevent duplicate confirm for same transactionId
 */
export const confirmPayment = async (req, res, next) => {
  try {
    const { transactionId, applicationId, amount, tuitionId, tutorId } =
      req.body;

    const numericAmount = Number(amount);

    if (
      !transactionId ||
      !applicationId ||
      !numericAmount ||
      !tuitionId ||
      !tutorId
    ) {
      res.status(400);
      throw new Error("Missing payment data");
    }

    // 1) prevent duplicate payment save (transactionId unique use koro)
    const existing = await Payment.findOne({ transactionId });
    if (existing) {
      return res.status(200).json(existing);
    }

    // 2) application check (must exist, must be pending)
    const app = await Application.findById(applicationId);
    if (!app) {
      res.status(404);
      throw new Error("Application not found");
    }

    if (
      String(app.tuitionId) !== String(tuitionId) ||
      String(app.tutorId) !== String(tutorId)
    ) {
      res.status(400);
      throw new Error("Application does not match tuition/tutor");
    }

    if (app.status === "APPROVED") {
      // already approved আগে থেকেই হলে payment confirm হওয়া উচিত না
      res.status(409);
      throw new Error("This application is already approved");
    }

    // 3) Save payment
    const payment = await Payment.create({
      studentId: req.user.id,
      tutorId,
      tuitionId,
      amount: numericAmount,
      transactionId,
      status: "SUCCESS",
    });

    // 4) Approve this application
    await Application.findByIdAndUpdate(applicationId, { status: "APPROVED" });

    // 5) (Optional but pro) reject other pending applications for same tuition
    await Application.updateMany(
      {
        tuitionId,
        _id: { $ne: applicationId },
        status: "PENDING",
      },
      { status: "REJECTED" }
    );

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/my  (student)
 * return student's payment history
 */
export const getMyPayments = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;
    const role = req.user?.role;

    // ✅ Tutor হলে tutorId / tutorEmail দিয়ে filter
    if (role === "tutor") {
      const payments = await Payment.find({
        $or: [{ tutorId: userId }, { tutorEmail: email }],
      }).sort({ createdAt: -1 });

      return res.json(payments);
    }

    // ✅ Student হলে studentId / studentEmail দিয়ে filter
    const payments = await Payment.find({
      $or: [{ studentId: userId }, { studentEmail: email }],
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/tutor/my (tutor)
 * return tutor's revenue history
 */
export const getTutorPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ tutorId: req.user.id })
      .populate("studentId tuitionId")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};
