import jwt from "jsonwebtoken";

export default function verifyJWT(req, res, next) {
  try {
    // header read (works for different casing)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({ message: "Unauthorized: no token" });
    }

    // Expect: "Bearer <token>"
    const parts = authHeader.split(" ");
    const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized: token expired" });
      }

      // attach user payload
      req.user = {
        id: decoded.id || decoded._id || decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    });
  } catch (error) {
    console.error("verifyJWT error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
