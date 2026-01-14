import Application from "../models/Application.model.js";
import Tuition from "../models/Tuition.model.js"; // ✅ add this

// POST /api/applications (tutor apply)
export const createApplication = async (req, res, next) => {
  try {
    const { tuitionId, qualifications, experience, expectedSalary } = req.body;

    const application = await Application.create({
      tuitionId,
      tutorId: req.user.id,
      qualifications,
      experience,
      expectedSalary,
      status: "PENDING",
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/my (tutor)  ✅ tutor applied list
export const getMyApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ tutorId: req.user.id })
      .populate("tuitionId")
      .sort({ createdAt: -1 });

    // ✅ always array
    return res.json(Array.isArray(apps) ? apps : []);
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/tuition/:tuitionId (student)
export const getApplicationsForTuition = async (req, res, next) => {
  try {
    const { tuitionId } = req.params;
    const apps = await Application.find({ tuitionId })
      .populate("tutorId")
      .sort({ createdAt: -1 });

    return res.json(Array.isArray(apps) ? apps : []);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/applications/:id/reject (student)
export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const app = await Application.findByIdAndUpdate(
      id,
      { status: "REJECTED" },
      { new: true }
    );
    if (!app) {
      res.status(404);
      throw new Error("Application not found");
    }
    res.json(app);
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ NEW: GET /api/applications/tutor (alias of /my)
 * TutorDashboardHome এ এটা use করলে filter/map crash হবে না
 */
export const getTutorApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ tutorId: req.user.id })
      .populate("tuitionId")
      .sort({ createdAt: -1 });

    return res.json(Array.isArray(apps) ? apps : []);
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ NEW: GET /api/applications/student
 * Student যেসব tuition পোস্ট করেছে, সেই tuition গুলোর applications
 */
export const getStudentApplications = async (req, res, next) => {
  try {
    const myTuitions = await Tuition.find({ studentId: req.user.id }).select(
      "_id"
    );

    const tuitionIds = myTuitions.map((t) => t._id);

    if (tuitionIds.length === 0) return res.json([]);

    const apps = await Application.find({ tuitionId: { $in: tuitionIds } })
      .populate("tuitionId")
      .populate("tutorId")
      .sort({ createdAt: -1 });

    return res.json(Array.isArray(apps) ? apps : []);
  } catch (error) {
    next(error);
  }
};
