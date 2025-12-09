import jwt from "jsonwebtoken"; 
 
export const verifyRole = (roles = []) => {
  return (req, res, next) => {
    const userRole = res.locals.userRole;  // ← Wajib dari sini

    if (!userRole) {
      return res.status(401).json({
        message: "Role tidak ditemukan dalam token",
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: `Akses ditolak: hanya ${roles.join(" / ")} yang diperbolehkan`,
      });
    }

    next();
  };
};
