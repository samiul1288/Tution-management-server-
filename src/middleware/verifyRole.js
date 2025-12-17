// src/middleware/verifyRole.js
export const verifyRole =
  (...allowedRoles) =>
  (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ message: "Unauthorized (no role)" });
    }

    // ✅ allow multiple roles
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };

export default verifyRole;
