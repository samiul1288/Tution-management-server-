import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, trim: true },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "student",
    },

    // ✅ NEW: user status for admin control (block/unblock)
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },

    phone: { type: String, trim: true },
    photoURL: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
