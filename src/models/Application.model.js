import { Schema, model } from "mongoose";

const applicationSchema = new Schema(
  {
    tuitionId: { type: Schema.Types.ObjectId, ref: "Tuition" },
    tutorId: { type: Schema.Types.ObjectId, ref: "User" },
    qualifications: String,
    experience: String,
    expectedSalary: Number,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Application = model("Application", applicationSchema);
export default Application;
