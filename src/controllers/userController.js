import pool from '../../config/db.js';
import jwt from "jsonwebtoken";

export const createAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: "Email dan password wajib diisi",
    });
  }

  try {
    const [result] = await pool.query(
      'CALL sp_insert_admin(?,?)',
      [email, password]
    );

    return res.status(201).json({
      message: "Admin berhasil dibuat",
      data: { email },
    });

  } catch (error) {

    if (error.code === "45000" || error.sqlState === "45000") {
      return res.status(400).json({
        msg: error.sqlMessage  
      });
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        msg: "Email sudah terdaftar",
      });
    }

    console.error("Error creating admin:", error);
    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

export const registerMahasiswa = async (req, res) => {
    const { email, password, nama_lengkap, nim, pin } = req.body;

    if(!email || !password || !nama_lengkap || !nim || !pin)  {
      return res.status(400).json({
        msg: "Semua field wajin diisi"
      });
    }

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

      if(error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          msg: "Email atau NIM sudah terdaftar",
        });
      }

        console.error("Error creating mahasiswa:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const registerMerchant = async (req, res) => {
  const { email, password, nama_merchant, cashtag, pin } = req.body;

  if (!email || !password || !nama_merchant || !cashtag || !pin) {
    return res.status(400).json({ msg: "Semua field wajib diisi" });
  }

  try {
    const [rows] = await pool.query(
      "CALL sp_insert_merchant(?, ?, ?, ?, ?)",
      [email, password, nama_merchant, cashtag, pin]
    );

    return res.status(201).json({
      msg: "Merchant berhasil dibuat",
      data: { email, nama_merchant, cashtag },
    });
  } catch (error) {
    console.error("Error creating merchant:", error);

    if (error.sqlState === "45000") {
      return res.status(400).json({ msg: error.sqlMessage });
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ msg: "Email atau cashtag sudah terdaftar" });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email dan password wajib diisi" });
  }

  try {
    const [rows] = await pool.query("CALL sp_login_users(?, ?)", [
      email,
      password,
    ]);

    const userRows = rows[0];

    if (!userRows || userRows.length === 0) {
      return res.status(400).json({ msg: "Email atau password salah" });
    }

    const user = userRows[0];

    // ⬇⬇ MEMBANGUN PAYLOAD TOKEN
    const tokenPayload = {
      userId: user.id_users,
      role: user.roles,
      name: user.nama_pengguna,
    };

    if (user.roles === "Mahasiswa") {
      tokenPayload.id_mahasiswa = user.id_mahasiswa;
    }

    if (user.roles === "Merchant") {
      tokenPayload.id_merchant = user.id_merchant;
    }

    if (user.roles === "Admin") {
      tokenPayload.id_admin = user.id_admin;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      status: "Success",
      token,
      user: {
        ...tokenPayload, // opsional untuk langsung dikirim ke FE
        email: user.email,
      },
    });

  } catch (error) {
    if (error.sqlState === "45000") {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    console.error("Login error:", error);

    return res.status(500).json({ msg: "Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_all_users()");

    // Hasil CALL berupa array di dalam array 
    const users = rows[0] || [];

    return res.status(200).json({
      status: true,
      total: users.length,
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

export const getUserById = async (req, res) => {
  try {
    const { id_users } = req.body; // ambil id user target dari body

    if (!id_users) {
      return res.status(400).json({
        success: false,
        message: "id_users harus diisi",
      });
    }

    const [rows] = await pool.query("CALL sp_get_user_by_id(?)", [id_users]);
    const log = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: `Data user dengan id ${id_users} berhasil diambil`,
      total: log.length,
      data: log,
    });
  } catch (error) {
    console.error("Error fetching log:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const getAllMahasiswa = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_all_mahasiswa()");
    const mahasiswa = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diambil",
      total: mahasiswa.length,
      data: mahasiswa,
    });
  } catch (error) {
    console.error("Error fetching all mahasiswa:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server"
    });
  }
};

export const getMahasiswaById = async (req, res) => {
  try {
    const { id_users } = req.body; // ambil id user target dari body

    if (!id_users) {
      return res.status(400).json({
        success: false,
        message: "id_users harus diisi",
      });
    }

    const [rows] = await pool.query("CALL sp_get_mahasiswa_by_id(?)", [id_users]);
    const mahasiswa = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: `Data mahasiswa dengan id users ${id_users} berhasil diambil`,
      total: mahasiswa.length,
      data: mahasiswa,
    });
  } catch (error) {
    console.error("Error fetching log:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const getAllMerchant = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_all_merchant()");
    const merchant = rows[0] || [];

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

export const getMerchantById = async (req, res) => {
  try {
    const { id_users } = req.body; // ambil id user target dari body

    if (!id_users) {
      return res.status(400).json({
        success: false,
        message: "id_users harus diisi",
      });
    }

    const [rows] = await pool.query("CALL sp_get_merchant_by_id(?)", [id_users]);
    const merchant = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: `Data merchant dengan id users ${id_users} berhasil diambil`,
      total: merchant.length,
      data: merchant,
    });
  } catch (error) {
    console.error("Error fetching log:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};


export const getAllLog = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_all_log()");
    const log = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: "Data log berhasil diambil",
      total: log.length,
      data: log,
    });
  } catch (error) {
    console.error("Error fetching all logs:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server"
    });
  }
};

export const getLogMahasiswa = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_log_mahasiswa()");
    const log = rows[0] || [];

    return res.status(200).json({
      success: true,
      msg: "Data log mahasiswa berhasil diambil",
      total: log.length,
      data: log,
    });
  } catch (error){
    console.error("Error fetching all logs:", error);
    return res.status(500).json({
      success: false,
      msg: "Server Error"
    });
  }
};

export const getLogMerchant = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_log_merchant()");
    const log = rows[0] || [];

    return res.status(200).json({
      success: true,
      msg: "Data log merchant berhasil diambil",
      total: log.length,
      data: log,
    });
  } catch (error){
    console.error("Error fetching all logs:", error);
    return res.status(500).json({
      success: false,
      msg: "Server Error"
    });
  }
};

export const getLogUserByAdmin = async (req, res) => {
  try {
    const { id_users } = req.body; // ambil id user target dari body

    if (!id_users) {
      return res.status(400).json({
        success: false,
        message: "id_users harus diisi",
      });
    }

    const [rows] = await pool.query("CALL sp_get_log_user_by_admin(?)", [id_users]);
    const log = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: `Data log user dengan id ${id_users} berhasil diambil`,
      total: log.length,
      data: log,
    });
  } catch (error) {
    console.error("Error fetching log:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};


export const getLogByUser = async (req, res) => {
  try {
    const id_users = req.user.id_users; // AMBIL DARI TOKEN

    const [rows] = await pool.query("CALL sp_get_log_by_user(?)", [id_users]);
    const log = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: `Data log user dengan id users ${id_users} berhasil diambil`,
      total: log.length,
      data: log,
    });
  } catch (error) {
    console.error("Error fetching log:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const getSaldoMahasiswa = async (req, res) => {
  try {
    const id_users = req.user.id_users; // AMBIL DARI TOKEN

    const [rows] = await pool.query("CALL get_saldo_mahasiswa(?)", [id_users]);
    const saldo = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: `Data saldo mahasiswa dengan id users ${id_users} berhasil diambil`,
      total: saldo.length,
      data: saldo,
    });
  } catch (error) {
    console.error("Error fetching saldo:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const getSaldoMerchant = async (req, res) => {
  try {
    const id_users = req.user.id_users; // AMBIL DARI TOKEN

    const [rows] = await pool.query("CALL get_saldo_merchant(?)", [id_users]);
    const saldo = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: `Data saldo merchant dengan id users ${id_users} berhasil diambil`,
      total: saldo.length,
      data: saldo,
    });
  } catch (error) {
    console.error("Error fetching saldo:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const getJumlahTransaksiMahasiswa = async (req, res) => {
  try {
    const id_users = req.user.id_users; // Ambil dari token

    const [rows] = await pool.query(
      "CALL get_jumlah_transaksi_mahasiswa(?)",
      [id_users]
    );

    const transaksi = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: `Data jumlah transaksi mahasiswa dengan id_users ${id_users} berhasil diambil`,
      total: transaksi.length,
      data: transaksi
    });
  } catch (error) {
    console.error("Error fetching transaksi mahasiswa:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server"
    });
  }
};

export const getJumlahTransaksiMerchant = async (req, res) => {
  try {
    const id_users = req.user.id_users; // Ambil dari token

    const [rows] = await pool.query(
      "CALL get_jumlah_transaksi_merchant(?)",
      [id_users]
    );

    const transaksi = rows[0] || [];

    return res.status(200).json({
      success: true,
      message: `Data jumlah transaksi merchant dengan id_users ${id_users} berhasil diambil`,
      total: transaksi.length,
      data: transaksi
    });
  } catch (error) {
    console.error("Error fetching transaksi merchant:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server"
    });
  }
};


export const getTotalUsers = async (req, res) => {
  try {
    const id_users = req.user.id_users;

    const [rows] = await pool.query("CALL sp_get_total_users()");
    const total = rows[0][0]?.total_users || 0;

    return res.status(200).json({
      success: true,
      message: `Total user berhasil diambil oleh admin dengan id_users ${id_users}`,
      total,
    });
  } catch (error) {
    console.error("Error fetching total users:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};


export const getTotalMahasiswa = async (req, res) => {
  try {
    // id_users dari token (admin)
    const id_users = req.user.id_users;

    const [rows] = await pool.query("CALL sp_get_total_mahasiswa()");
    const total = rows[0][0]?.total_mahasiswa || 0;

    return res.status(200).json({
      success: true,
      message: `Total mahasiswa berhasil diambil oleh admin dengan id_users ${id_users}`,
      total,
    });
  } catch (error) {
    console.error("Error fetching total mahasiswa:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};


export const getTotalMerchant = async (req, res) => {
  try {
    // id_users dari token (admin)
    const id_users = req.user.id_users;

    const [rows] = await pool.query("CALL sp_get_total_merchant()");
    const total = rows[0][0]?.total_merchant || 0;

    return res.status(200).json({
      success: true,
      message: `Total merchant berhasil diambil oleh admin dengan id_users ${id_users}`,
      total,
    });
  } catch (error) {
    console.error("Error fetching total merchant:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const getCashtagByMahasiswa = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL sp_get_cashtag_by_mahasiswa()");

    const merchants = rows[0]; 
    res.status(200).json({
      status: "success",
      data: merchants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil daftar merchant",
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

    if (error.sqlState === "45000") {
      return res.status(400).json({ message: error.sqlMessage });
  }

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
  
    if (error.sqlState === "45000") {
      return res.status(400).json({ message: error.sqlMessage });
  }

    return res.status(500).json({ message: "Server error" });
  }
};

export const mahasiswaUpdateProfile = async (req, res) => {
  const id_mahasiswa = req.user.id_mahasiswa;
  const { nama_lengkap, nim, pin, email, password } = req.body;

  if (!id_mahasiswa) {
    return res.status(400).json({ msg: "id_mahasiswa tidak ditemukan pada token" });
  }

  try {
    await pool.query(
      "CALL mahasiswa_update_profile(?, ?, ?, ?, ?, ?)",
      [
        id_mahasiswa,
        nama_lengkap || null,
        nim || null,
        pin || null,
        email || null,
        password || null
      ]
    );

    return res.status(200).json({
      success: true,
      msg: `Profil mahasiswa dengan ID ${id_mahasiswa} berhasil diperbarui`
    });

  } catch (error) {
    console.error("Error updating profile (mahasiswa):", error);

    // Tangkap SIGNAL SQLSTATE '45000'
    if (error.sqlState === "45000") {
      return res.status(400).json({ msg: error.sqlMessage });
    }

    return res.status(500).json({ msg: "Server error" });
  }
};


export const merchantUpdateProfile = async (req, res) => {
  const id_merchant = req.user.id_merchant;
  const { nama_merchant, cashtag, pin, email, password } = req.body;

  if (!id_merchant) {
    return res.status(400).json({ msg: "id_merchant tidak ditemukan pada token" });
  }

  try {
    await pool.query(
      "CALL merchant_update_profile(?, ?, ?, ?, ?, ?)",
      [
        id_merchant,
        nama_merchant || null,
        cashtag || null,
        pin || null,
        email || null,
        password || null
      ]
    );

    return res.status(200).json({
      success: true,
      msg: `Profil merchant dengan ID ${id_merchant} berhasil diperbarui`
    });

  } catch (error) {
    console.error("Error updating profile (merchant):", error);

    // Tangkap SIGNAL SQLSTATE '45000'
    if (error.sqlState === "45000") {
      return res.status(400).json({ msg: error.sqlMessage }); // FIX
    }

    return res.status(500).json({ msg: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
    const { id_users } = req.body;

    if (!id_users) {
        return res.status(400).json({ msg: "id_users harus dikirim" });
    }

    const loggedInUserId = res.locals.userId;
    const loggedInUserRole = res.locals.userRole;

    try {
        // 1. Hanya Admin boleh hapus user
        if (loggedInUserRole !== "Admin") {
            return res.status(403).json({ msg: "Anda tidak memiliki izin untuk menghapus akun" });
        }

        // 2. Admin tidak bisa menghapus dirinya sendiri
        if (parseInt(id_users) === parseInt(loggedInUserId)) {
            return res.status(403).json({ msg: "Admin tidak bisa menghapus dirinya sendiri" });
        }

        // 3. Cek user exist
        const [rows] = await pool.query(
            "SELECT id_users FROM Users WHERE id_users = ?",
            [id_users]
        );

        if (rows.length === 0) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // 4. CALL Stored Procedure
        await pool.query("CALL sp_delete_user(?)", [id_users]);

        return res.status(200).json({
            status: "Success",
            msg: `User dengan id ${id_users} berhasil dihapus`,
        });

    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(400).json({
            msg: error.sqlMessage || "Gagal menghapus user",
        });
    }
};
