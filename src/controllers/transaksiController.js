import pool from '../../config/db.js';

export const transferMahasiswa = async (req, res) => {
    const { rekeningPengirim, rekeningPenerima,  nominal, pin } = req.body;

    try {
        const [rows] = await pool.query(
            'CALL sp_transfer_mahasiswa(?, ?, ?, ?)',
            [ rekeningPengirim, rekeningPenerima, nominal, pin ]
        );

        const result = rows[0][0]; 
        return res.status(200).json({
            msg: `Transfer berhasil ke ${rekeningPenerima} sebesar ${nominal}`,
        });

    } catch(error) {
        console.error(error);
        res.status(400).json({ 
            error: error.sqlMessage  || error.message
        });
    }
};

export const paymentMahasiswa = async (req, res) => {
    const { rekeningMahasiswa, cashtag, nominal, pin } = req.body;

    if (!rekeningMahasiswa || !cashtag || !nominal || !pin)
        return res.status(400).json({ msg: "Semua field wajib diisi"});

    try {
        const [rows] = await pool.query(
            'CALL sp_payment_mahasiswa(?, ?, ?, ?)',
            [ rekeningMahasiswa, cashtag, nominal, pin ]
        );


        const result = rows[0][0]; 
        return res.status(200).json({
            msg: `Payment berhasil ke ${cashtag} sebesar ${nominal}`,
            data: result,
        });

    } catch(error) {
        console.error(error);
        res.status(400).json({ error: error.sqlMessage || error.message });
    }
};

export const topupMahasiswa = async (req, res) => {
    const { nomorRekening, nominal } = req.body;

    try {
        const [rows] = await pool.query(
            'CALL sp_topup_mahasiswa(?, ?)',
            [ nomorRekening, nominal ]
        );

        // rows[0] berisi SELECT terakhir di procedure
        const result = rows[0][0]; // ambil row pertama 

        return res.status(200).json({
            msg: `Topup berhasil ke rekening ${nomorRekening} sebesar ${nominal}`,
            data: result
        });

    } catch(error) {
        console.error(error);
        res.status(400).json({ 
            error: error.sqlMessage || error.message 
        });
    }
};