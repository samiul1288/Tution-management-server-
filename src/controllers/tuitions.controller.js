import Tuition from "../models/Tuition.model.js";

// ✅ POST /api/tuitions (student create)
export const createTuition = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      studentId: req.user.id,
      status: "PENDING",
    };

    const created = await Tuition.create(payload);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// ✅ GET /api/tuitions (public list)
export const getAllTuitions = async (req, res, next) => {
  try {
    const {
      q = "",
      subject = "",
      location = "",
      sort = "latest",
      page = 1,
      limit = 8,
    } = req.query;

    const filter = {
      status: "APPROVED",
    };

    // basic search (optional)
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ];
    }
    if (subject) filter.subject = subject;
    if (location) filter.location = location;

    const skip = (Number(page) - 1) * Number(limit);

    let sortObj = { createdAt: -1 };
    if (sort === "budget_asc") sortObj = { budget: 1 };
    if (sort === "budget_desc") sortObj = { budget: -1 };

    const [items, total] = await Promise.all([
      Tuition.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
      Tuition.countDocuments(filter),
    ]);

    res.json({ data: items, total });
  } catch (err) {
    next(err);
  }
};

// ✅ GET /api/tuitions/:id (public details)
export const getTuitionById = async (req, res, next) => {
  try {
    const item = await Tuition.findById(req.params.id).populate(
      "studentId",
      "name email"
    );
    if (!item) return res.status(404).json({ message: "Tuition not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /api/tuitions/:id (student update)
export const updateTuition = async (req, res, next) => {
  try {
    const updated = await Tuition.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user.id },
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Tuition not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE /api/tuitions/:id (student delete)
export const deleteTuition = async (req, res, next) => {
  try {
    const deleted = await Tuition.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: "Tuition not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

// ✅ GET /api/tuitions/admin?status=PENDING (admin list)
export const getAllTuitionsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const items = await Tuition.find(filter)
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /api/tuitions/:id/status (admin approve/reject)
export const updateTuitionStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // "APPROVED" | "REJECTED"
    const updated = await Tuition.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Tuition not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ✅ GET /api/tuitions/me (student list)
export const getMyTuitions = async (req, res, next) => {
  try {
    const items = await Tuition.find({ studentId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// ✅ GET /api/tuitions/tutor/ongoing (tutor ongoing list)
export const getTutorOngoingTuitions = async (req, res, next) => {
  try {
    // তোমার logic অনুযায়ী change হতে পারে
    // এখন শুধু approved tuitions রিটার্ন করলাম
    const items = await Tuition.find({ status: "APPROVED" }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};
