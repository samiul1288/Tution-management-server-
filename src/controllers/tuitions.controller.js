// src/controllers/tuitions.controller.js
import mongoose from "mongoose";
import Tuition from "../models/Tuition.model.js";
import Application from "../models/Application.model.js";
import { getPagination } from "../utils/pagination.js"; // <-- ESM export থাকতে হবে

// GET /api/tuitions/all?search=&subject=&location=&sort=&page=&limit=
// Only APPROVED tuitions (Public)
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

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));

    const query = { status: "APPROVED" };

    const s = String(search || "").trim();
    if (s) {
      query.$or = [
        { title: new RegExp(s, "i") },
        { subject: new RegExp(s, "i") },
        { location: new RegExp(s, "i") },
        { description: new RegExp(s, "i") },
      ];
    }

    if (subject) query.subject = subject;

    const loc = String(location || "").trim();
    if (loc) query.location = new RegExp(loc, "i");

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "budgetAsc") sortOption = { budget: 1 };
    if (sort === "budgetDesc") sortOption = { budget: -1 };

    const total = await Tuition.countDocuments(query);

    const tuitions = await Tuition.find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
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

// GET /api/tuitions?search=&category=&location=&minPrice=&maxPrice=&sort=&page=&limit=
// (Admin/Student/Tutor use-case) - You can decide if status filter needed
export const getTuitions = async (req, res, next) => {
  try {
    const {
      search = "",
      category,
      location,
      minPrice,
      maxPrice,
      minBudget,
      maxBudget,
      sort = "newest",
      page = 1,
      limit = 8,
    } = req.query;

    const { skip, perPage, currentPage } = getPagination(page, limit);

    const query = {};

    // ✅ Search (title/subject/description)
    const s = String(search || "").trim();
    if (s) {
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { subject: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    // ✅ Filters
    if (category) query.category = category;

    const loc = String(location || "").trim();
    if (loc) query.location = { $regex: loc, $options: "i" };

    // ✅ Budget/Price range (schema তে budget থাকলে budget use করো)
    // support both: minPrice/maxPrice OR minBudget/maxBudget
    const min = Number(minBudget ?? minPrice);
    const max = Number(maxBudget ?? maxPrice);

    if (!Number.isNaN(min) || !Number.isNaN(max)) {
      query.budget = {};
      if (!Number.isNaN(min)) query.budget.$gte = min;
      if (!Number.isNaN(max)) query.budget.$lte = max;
    }

    // ✅ Sorting
    let sortQuery = { createdAt: -1 };
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    if (sort === "budgetAsc" || sort === "price_asc") sortQuery = { budget: 1 };
    if (sort === "budgetDesc" || sort === "price_desc")
      sortQuery = { budget: -1 };

    const [items, total] = await Promise.all([
      Tuition.find(query).sort(sortQuery).skip(skip).limit(perPage).lean(),
      Tuition.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      meta: {
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tuitions/:id
export const getTuitionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tuition id" });
    }

    const tuition = await Tuition.findById(id).lean();

    if (!tuition) {
      return res
        .status(404)
        .json({ success: false, message: "Tuition not found" });
    }

    return res.status(200).json({ success: true, data: tuition });
  } catch (err) {
    next(err);
  }
};

// GET /api/tuitions/me/list (student)
export const getMyTuitions = async (req, res, next) => {
  try {
    const studentId = req.user?.id;
    if (!studentId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const tuitions = await Tuition.find({ studentId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: tuitions });
  } catch (e) {
    next(e);
  }
};

// POST /api/tuitions (student)
export const createTuition = async (req, res, next) => {
  try {
    const studentId = req.user?.id;
    if (!studentId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const tuition = await Tuition.create({
      ...req.body,
      studentId,
      status: "PENDING",
    });

    return res.status(201).json({ success: true, data: tuition });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/tuitions/:id (student)
export const updateTuition = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tuition id" });
    }

    const tuition = await Tuition.findOneAndUpdate(
      { _id: id, studentId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!tuition)
      return res
        .status(404)
        .json({ success: false, message: "Tuition not found" });

    return res.status(200).json({ success: true, data: tuition });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tuitions/:id (student)
export const deleteTuition = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tuition id" });
    }

    const result = await Tuition.findOneAndDelete({
      _id: id,
      studentId: req.user.id,
    });

    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Tuition not found" });

    return res.status(200).json({ success: true, message: "Tuition deleted" });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tuitions/status/:id (admin)
export const updateTuitionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tuition id" });
    }

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const updated = await Tuition.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Tuition not found" });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// GET /api/tuitions/tutor/ongoing (tutor)
// Returns: tuitions where this tutor has an APPROVED application
export const getTutorOngoingTuitions = async (req, res, next) => {
  try {
    const tutorId = req.user?.id;

    if (!tutorId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(tutorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tutor id" });
    }

    const apps = await Application.find({ tutorId, status: "APPROVED" })
      .populate("tuitionId")
      .sort({ createdAt: -1 })
      .lean();

    const ongoingTuitions = apps
      .map((a) => {
        const t = a.tuitionId;
        if (!t) return null;

        return {
          ...t,
          expectedSalary: a.expectedSalary ?? null,
          applicationId: a._id,
        };
      })
      .filter(Boolean);

    return res.status(200).json({ success: true, data: ongoingTuitions });
  } catch (err) {
    next(err);
  }
};

// GET /api/tuitions/admin/all?status= (admin)
export const getAllTuitionsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const tuitions = await Tuition.find(filter)
      .populate("studentId", "name email photoURL role")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: tuitions });
  } catch (err) {
    next(err);
  }
};
