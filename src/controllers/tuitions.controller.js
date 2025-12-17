// src/controllers/tuitions.controller.js
import mongoose from "mongoose";
import Tuition from "../models/Tuition.model.js";
import Application from "../models/Application.model.js"; // ✅ FIX: missing import

// GET /api/tuitions?search=&subject=&location=&sort=&page=&limit=
export const getAllTuitions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      subject,
      location,
      sort = "newest",
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const query = { status: "APPROVED" };

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
      ];
    }

    if (subject) query.subject = subject;
    if (location) query.location = location;

    let sortOption = { createdAt: -1 };
    if (sort === "budgetAsc") sortOption = { budget: 1 };
    if (sort === "budgetDesc") sortOption = { budget: -1 };

    const total = await Tuition.countDocuments(query);

    const tuitions = await Tuition.find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.json({
      data: tuitions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tuitions/:id
export const getTuitionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ id valid না হলে crash করবে না
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }

    const tuition = await Tuition.findById(id).lean();

    if (!tuition) {
      return res.status(404).json({ message: "Tuition not found" });
    }

    return res.json(tuition);
  } catch (err) {
    next(err);
  }
};

// GET /api/tuitions/me/list (student)
export const getMyTuitions = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const tuitions = await Tuition.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(tuitions);
  } catch (e) {
    next(e);
  }
};

// POST /api/tuitions (student)
export const createTuition = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const tuition = await Tuition.create({
      ...req.body,
      studentId: req.user.id, // token থেকে student id
      status: "PENDING",
    });

    res.status(201).json(tuition);
  } catch (e) {
    next(e);
  }
};

// PATCH /api/tuitions/:id (student)
export const updateTuition = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }

    const tuition = await Tuition.findOneAndUpdate(
      { _id: id, studentId: req.user.id },
      req.body,
      { new: true }
    ).lean();

    if (!tuition) return res.status(404).json({ message: "Tuition not found" });

    res.json(tuition);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tuitions/:id (student)
export const deleteTuition = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }

    const result = await Tuition.findOneAndDelete({
      _id: id,
      studentId: req.user.id,
    });

    if (!result) return res.status(404).json({ message: "Tuition not found" });

    res.json({ success: true, message: "Tuition deleted" });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tuitions/status/:id (admin)
export const updateTuitionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED / REJECTED

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Tuition.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Tuition not found" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ✅ GET /api/tuitions/tutor/ongoing (tutor)
// Returns: tuitions where this tutor has an APPROVED application
export const getTutorOngoingTuitions = async (req, res, next) => {
  try {
    const tutorId = req.user?.id;

    if (!tutorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({ message: "Invalid tutor id" });
    }

    // approved applications for this tutor
    const apps = await Application.find({
      tutorId,
      status: "APPROVED",
    })
      .populate("tuitionId") // tuition document আনবে
      .sort({ createdAt: -1 });

    // map to tuition docs
    const ongoingTuitions = apps
      .map((a) => {
        const t = a.tuitionId;
        if (!t) return null;

        // optional: include expectedSalary from application
        return {
          ...t.toObject?.(),
          expectedSalary: a.expectedSalary ?? null,
          applicationId: a._id,
        };
      })
      .filter(Boolean);

    res.json(ongoingTuitions);
  } catch (err) {
    next(err);
  }
};

// GET /api/tuitions/admin/all?status= (admin)
export const getAllTuitionsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status; // PENDING/APPROVED/REJECTED

    const tuitions = await Tuition.find(filter)
      .populate("studentId", "name email photoURL role")
      .sort({ createdAt: -1 })
      .lean();

    res.json(tuitions);
  } catch (err) {
    next(err);
  }
};
