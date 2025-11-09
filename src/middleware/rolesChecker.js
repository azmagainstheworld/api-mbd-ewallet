import jwt from "jsonwebtoken"; 
 
export const verifyRole = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Token tidak ditemukan" });

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Token tidak valid" });

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({
          message: `Akses ditolak: hanya ${roles.join(" / ")} yang diperbolehkan`,
        });
      }

      req.user = decoded; // simpan info user di request untuk digunakan di controller
      next();
    });
  };
};
