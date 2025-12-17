import User from "../models/User.model.js";
import Tuition from "../models/Tuition.model.js";
import Payment from "../models/Payment.model.js";

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTutors = await User.countDocuments({ role: "tutor" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const totalTuitions = await Tuition.countDocuments();
    const pendingTuitions = await Tuition.countDocuments({ status: "PENDING" });
    const approvedTuitions = await Tuition.countDocuments({
      status: "APPROVED",
    });
    const rejectedTuitions = await Tuition.countDocuments({
      status: "REJECTED",
    });

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

    // last 6 months revenue
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

    // top tutors by revenue
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

    res.json({
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
