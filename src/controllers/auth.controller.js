import User from "../models/User.model.js";
import { generateJWT } from "../utils/generateJWT.js";

// Firebase / form login theke asha user ke DB te rakhbo + JWT dibo
export const createOrLoginUser = async (req, res, next) => {
  try {
    const { name, email, photoURL, role, phone } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        photoURL,
        phone,
        role: role || "student",
      });
    } else {
      // optional small update
      user.name = name || user.name;
      user.photoURL = photoURL || user.photoURL;
      user.phone = phone || user.phone;
      if (role && user.role !== "admin") {
        user.role = role; // student/tutor change allowed
      }
      await user.save();
    }

    const token = generateJWT(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
      })
      .json({
        success: true,
        token,
        user,
      });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res, next) => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
      })
      .json({ success: true });
  } catch (error) {
    next(error);
  }
};
