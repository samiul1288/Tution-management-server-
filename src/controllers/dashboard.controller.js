// src/controllers/dashboard.controller.js
import User from "../models/User.model.js";
import Tuition from "../models/Tuition.model.js";
import Application from "../models/Application.model.js";
import Payment from "../models/Payment.model.js";

// ✅ Public stats (no auth needed)
export const getPublicStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTuitions, totalApplications] = await Promise.all([
      User.countDocuments(),
      Tuition.countDocuments(),
      Application.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: { totalUsers, totalTuitions, totalApplications },
    });
  } catch (e) {
    next(e);
  }
};

// ✅ Admin analytics
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTutors,
      totalAdmins,

      totalTuitions,
      pendingTuitions,
      approvedTuitions,
      rejectedTuitions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "tutor" }),
      User.countDocuments({ role: "admin" }),

      Tuition.countDocuments(),
      Tuition.countDocuments({ status: "PENDING" }),
      Tuition.countDocuments({ status: "APPROVED" }),
      Tuition.countDocuments({ status: "REJECTED" }),
    ]);

    const revenueAgg = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueAgg?.[0]?.totalRevenue || 0;
    const totalPayments = revenueAgg?.[0]?.totalPayments || 0;

    // ✅ last 6 months revenue
    const monthly = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": -1, "_id.m": -1 } },
      { $limit: 6 },
    ]);

    // ✅ top tutors by revenue
    const topTutors = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      {
        $group: {
          _id: "$tutorId",
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    return res.status(200).json({
      success: true,
      users: { totalUsers, totalStudents, totalTutors, totalAdmins },
      tuitions: {
        totalTuitions,
        pendingTuitions,
        approvedTuitions,
        rejectedTuitions,
      },
      payments: { totalRevenue, totalPayments },
      monthly,
      topTutors,
    });
  } catch (e) {
    next(e);
  }
};
