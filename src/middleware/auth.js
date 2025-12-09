import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "Silahkan login terlebih dahulu" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Silahkan login terlebih dahulu" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ message: "Token kedaluwarsa, silahkan login ulang" });
        }

        if (err instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ message: "Token tidak valid. Silahkan login ulang" });
        }

        return res.status(500).json({ message: "Kesalahan pada internal server" });
      }

      console.log("DECODED TOKEN:", decoded);

      // ⬇️ SIMPAN SEMUA DATA DARI TOKEN (LEBIH AMAN & FLEXIBLE)
      req.user = {
        id_users: decoded.userId || decoded.id_users || null,  // id_users
        role: decoded.role,
        email: decoded.email || null,

        // role-specific IDs
        id_mahasiswa: decoded.id_mahasiswa || null,
        id_merchant: decoded.id_merchant || null,
        id_admin: decoded.id_admin || null,
      };

      // Jika butuh untuk middleware lain
      res.locals.userId = req.user.id_users;
      res.locals.userRole = req.user.role;

      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Kesalahan pada internal server" });
  }
};
