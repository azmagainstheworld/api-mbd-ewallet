import express from 'express';
import { transferMahasiswa, paymentMahasiswa, topupMahasiswa } from '../controllers/transaksiController.js';
import { verifyRole } from '../middleware/rolesChecker.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/transfer', verifyToken, verifyRole(["Mahasiswa", "Merchant"]), transferMahasiswa);
router.post('/payment', verifyToken, verifyRole(["Mahasiswa"]), paymentMahasiswa);
router.post('/topup', verifyToken, verifyRole(["Admin"]), topupMahasiswa);

export default router;