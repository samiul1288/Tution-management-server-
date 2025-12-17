import mongoose from "mongoose";
import User from "../models/User.model.js";

// GET /api/users (admin)


// PATCH /api/users/role/:id (admin)

export const getTutors = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 6;

    const tutors = await User.find({ role: "tutor" })
      .select("name email phone photoURL qualification experience")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(tutors);
  } catch (e) {
    next(e);
  }
};
// DELETE /api/users/:id (admin)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};



// GET /api/users/me (logged in any role)
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/me
export const updateMe = async (req, res, next) => {
  try {
    const { name, photoURL, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, photoURL, phone },
      { new: true }
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
export const getAllTutors = async (req, res, next) => {
  try {
    const tutors = await User.find({ role: "tutor" }).select("-__v");
    res.json(tutors);
  } catch (err) {
    next(err);
  }
};
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ ObjectId valid check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const { q = "", role = "", status = "" } = req.query;

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status; // "ACTIVE" | "BLOCKED"

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    next(e);
  }
};
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;

    const filter = {};

    if (role && role !== "all") filter.role = role;
    if (status && status !== "all") filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    next(e);
  }
};

// PATCH /api/users/:id/role (admin)
export const updateUserRole = async (req, res, next) => {

  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user id" });

    if (!["student", "tutor", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const updated = await User.findByIdAndUpdate(id, { role }, { new: true });
    res.json(updated);
  } catch (e) {
    next(e);
  }
};
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "BLOCKED"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const updated = await User.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updated);
  } catch (e) {
    next(e);
  }
};


// PATCH /api/users/:id/block (admin)
export const toggleUserBlock = async (req, res, next) => {
  try {
    const { status } = req.body; // "ACTIVE" | "BLOCKED"
    if (!status) return res.status(400).json({ message: "status required" });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (e) {
    next(e);
  }
};

// DELETE /api/users/:id (admin)
export const deleteUserAdmin = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
};
