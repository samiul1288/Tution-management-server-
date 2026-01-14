// src/middleware/verifyRole.js
export default function verifyRole(...allowed) {
  // supports:
  // verifyRole("admin")
  // verifyRole("student", "tutor")
  // verifyRole(["student", "tutor"])
  const roles = Array.isArray(allowed[0]) ? allowed[0] : allowed;

  const allowedRoles = roles
    .filter(Boolean)
    .map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toLowerCase();

    if (!userRole) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
