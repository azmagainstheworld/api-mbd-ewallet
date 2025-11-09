import express from 'express';
import { transferMahasiswa, paymentMahasiswa, topupMahasiswa } from '../controllers/transaksiController.js';
import { verifyRole } from '../middleware/rolesChecker.js';

const router = express.Router();
router.post('/transfer', verifyRole(["Mahasiswa", "Merchant"]), transferMahasiswa);
router.post('/payment', verifyRole(["Mahasiswa"]), paymentMahasiswa);
router.post('/topup', verifyRole(["Admin"]), topupMahasiswa);

export default router;