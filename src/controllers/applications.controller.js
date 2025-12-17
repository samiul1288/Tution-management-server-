import Application from "../models/Application.model.js";

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

// GET /api/applications/my (tutor)
export const getMyApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ tutorId: req.user.id }).populate(
      "tuitionId"
    );
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/tuition/:tuitionId (student)
export const getApplicationsForTuition = async (req, res, next) => {
  try {
    const { tuitionId } = req.params;
    const apps = await Application.find({ tuitionId }).populate("tutorId");
    res.json(apps);
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
