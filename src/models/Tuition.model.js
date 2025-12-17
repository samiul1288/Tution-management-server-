import { Schema, model } from "mongoose";

const tuitionSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    subject: String,
    className: String,
    location: String,
    budget: Number,
    schedule: String,
    description: String,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Tuition = model("Tuition", tuitionSchema);
export default Tuition;
