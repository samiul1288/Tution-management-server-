import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User" },
    tutorId: { type: Schema.Types.ObjectId, ref: "User" },
    tuitionId: { type: Schema.Types.ObjectId, ref: "Tuition" },
    amount: Number,
    transactionId: String,
    status: { type: String, default: "SUCCESS" },
  },
  { timestamps: true }
);

const Payment = model("Payment", paymentSchema);
export default Payment;
