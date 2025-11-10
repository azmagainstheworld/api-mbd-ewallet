import pool from '../../config/db.js';
import jwt from "jsonwebtoken";

export const createAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [result] = await pool.query(
            'CALL sp_insert_admin(?,?)',
            [email, password]
        );

        return res.status(201).json({
            message: "Admin berhasil dibuat",
            data: { email },
        });
    }   catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const registerMahasiswa = async (req, res) => {
    const { email, password, nama_lengkap, nim, pin } = req.body;

    try {
        const [result] = await pool.query(
            'CALL sp_insert_mahasiswa(?, ?, ?, ?, ?)',
            [email, password, nama_lengkap, nim, pin]
        );

        return res.status(201).json({
            msg: "Mahasiswa berhasil dibuat",
            data: { email, nama_lengkap, nim },
        });
    } catch (error) {
        console.error("Error creating mahasiswa:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const registerMerchant = async (req, res) => {
  const { email, password, nama_merchant, cashtag, pin } = req.body;

  try {
    const [result] = await pool.query(
      "CALL sp_insert_merchant(?, ?, ?, ?, ?)",
      [email, password, nama_merchant, cashtag, pin]
    );

    return res.status(201).json({
      msg: "Merchant berhasil dibuat",
      data: { email, nama_merchant, cashtag },
    });
  } catch (error) {
    console.error("Error creating merchant:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [result] = await pool.query("CALL sp_login_users(?, ?)", [
      email,
      password,
    ]);

    const userRows = result[0];

    if (!userRows || userRows.length === 0) {
      return res.status(400).json({
        message: "Email atau password salah",
      });
    }

    const user = userRows[0];

    const token = jwt.sign(
      {
        userId: user.id_users,
        role: user.roles,
        name: user.nama_pengguna,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: "Success",
      token,
      user: {
        id: user.id_users,
        email: user.email,
        role: user.roles,
      },
    });
  } catch (error) {
    if (error.sqlState === "45000") {
      return res.status(400).json({
        message: "Email atau password salah",
      });
    }

    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_all_users()");

    // Hasil CALL berupa array di dalam array 
    const users = rows[0] || rows;

    return res.status(200).json({
      status: "Success",
      total_users: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({
      success: false,  
      message: "Server error",
    });
  }
};

export const getAllMahasiswa = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_all_mahasiswa()");
    const mahasiswa = rows[0] || rows;

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diambil",
      total: mahasiswa.length,
      data: mahasiswa
    });
  } catch (error) {
    console.error("Error fetching all mahasiswa:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server"
    });
  }
};

export const getAllMerchant = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_all_merchant()");
    const merchant = rows[0] || rows;

    return res.status(200).json({
      success: true,
      message: "Data merchant berhasil diambil",
      total: merchant.length,
      data: merchant
    });
  } catch (error) {
    console.error("Error fetching all merchant:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server"
    });
  }
};

export const adminUpdateMahasiswa = async (req, res) => {
  const { id_mahasiswa, nama_lengkap, nim, email } = req.body;

  if (!id_mahasiswa) {
    return res.status(400).json({ message: "id_mahasiswa wajib diisi" });
  }

  if (!nama_lengkap && !nim && !email) {
    return res.status(400).json({
      message: "Tidak ada data yang diubah. Mohon isi minimal satu field.",
    });
  }

  try {
    await pool.query("CALL admin_update_mahasiswa(?, ?, ?, ?)", [
      id_mahasiswa,
      nama_lengkap || null,
      nim || null,
      email || null,
    ]);

    return res.status(200).json({
      status: "Success",
      message: `Data mahasiswa dengan ID ${id_mahasiswa} berhasil diperbarui`,
    });
  } catch (error) {
    console.error("Error updating mahasiswa:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const adminUpdateMerchant = async (req, res) => {
  const { id_merchant, nama_merchant, email } = req.body;

  if (!id_merchant) {
    return res.status(400).json({ message: "id_merchant wajib diisi" });
  }

  if (!nama_merchant && !email) {
    return res.status(400).json({
      message: "Tidak ada data yang diubah. Mohon isi minimal satu field.",
    });
  }

  try {
    await pool.query("CALL admin_update_merchant(?, ?, ?)", [
      id_merchant,
      nama_merchant || null,
      email || null,
    ]);

    return res.status(200).json({
      status: "Success",
      message: `Data merchant dengan ID ${id_merchant} berhasil diperbarui`,
    });
  } catch (error) {
    console.error("Error updating mahasiswa:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
    const { id_users } = req.body;
    
    if (!id_users) {
        return res.status(400).json({ msg: "id_users harus dikirim "});
    }

    try {
        await pool.query("CALL sp_delete_akun(?)", [id_users]);

        return res.status(200).json({
            status: "Success",
            msg: `User dengan id ${id_users} berhasil dihapus`,
        });
    } catch (err) {
        console.error("Delete user error:", error);

        return res.status(500).json({
            msg: "Server error",
        });
    }
};