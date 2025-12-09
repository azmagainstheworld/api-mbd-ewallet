import express from 'express';
import { 
    createAdmin, 
    registerMahasiswa, 
    registerMerchant, 
    login, 
    deleteUser, 
    getAllUsers, 
    getAllMahasiswa, 
    getAllMerchant, 
    getAllLog, 
    adminUpdateMahasiswa, 
    adminUpdateMerchant,
    mahasiswaUpdateProfile, 
    merchantUpdateProfile,
    getLogByUser,
    getLogMahasiswa,
    getLogMerchant,
    getLogUserByAdmin,
    getUserById, 
    getMahasiswaById,
    getMerchantById,
    getSaldoMahasiswa,
    getSaldoMerchant,
    getJumlahTransaksiMahasiswa,
    getJumlahTransaksiMerchant,
    getTotalUsers,
    getTotalMahasiswa,
    getTotalMerchant,
    getCashtagByMahasiswa
} from '../controllers/userController.js';
import { verifyRole } from '../middleware/rolesChecker.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/admin/create', createAdmin);
router.post('/mahasiswa/register', registerMahasiswa);
router.post('/merchant/register', verifyToken, verifyRole(["Admin"]), registerMerchant);
router.post('/login', login);
router.post('/admin/log-user', verifyToken, verifyRole(["Admin"]), getLogUserByAdmin);
router.post('/admin/user-by-id', verifyToken, verifyRole(["Admin"]), getUserById);
router.post('/admin/mahasiswa-by-id', verifyToken, verifyRole(["Admin"]), getMahasiswaById);
router.post('/admin/merchant-by-id', verifyToken, verifyRole(["Admin"]), getMerchantById);

router.get('/admin/users', verifyToken, verifyRole(["Admin"]), getAllUsers);
router.get('/admin/mahasiswa', verifyToken, verifyRole(["Admin"]), getAllMahasiswa);
router.get('/admin/merchant', verifyToken, verifyRole(["Admin"]), getAllMerchant);
router.get('/admin/log', verifyToken, verifyRole(["Admin"]), getAllLog);
router.get('/admin/log-mahasiswa', verifyToken, verifyRole(["Admin"]), getLogMahasiswa);
router.get('/admin/log-merchant', verifyToken, verifyRole(["Admin"]), getLogMerchant);
router.get('/log-by-user', verifyToken, verifyRole(["Mahasiswa", "Merchant"]), getLogByUser);
router.get('/mahasiswa/saldo', verifyToken, verifyRole(["Mahasiswa"]), getSaldoMahasiswa);
router.get('/merchant/saldo', verifyToken, verifyRole(["Merchant"]), getSaldoMerchant);
router.get('/mahasiswa/jumlah-transaksi', verifyToken, verifyRole(["Mahasiswa"]), getJumlahTransaksiMahasiswa);
router.get('/merchant/jumlah-transaksi', verifyToken, verifyRole(["Merchant"]), getJumlahTransaksiMerchant);
router.get('/admin/total-users', verifyToken, verifyRole(["Admin"]), getTotalUsers);
router.get('/admin/total-mahasiswa', verifyToken, verifyRole(["Admin"]), getTotalMahasiswa);
router.get('/admin/total-merchant', verifyToken, verifyRole(["Admin"]), getTotalMerchant);
router.get('/mahasiswa/list-merchant', verifyToken, verifyRole(["Mahasiswa"]), getCashtagByMahasiswa);


router.put('/admin/update-mahasiswa', verifyToken, verifyRole(["Admin"]), adminUpdateMahasiswa);
router.put('/admin/update-merchant', verifyToken, verifyRole(["Admin"]), adminUpdateMerchant);
router.put('/mahasiswa/update', verifyToken, verifyRole(["Mahasiswa"]), mahasiswaUpdateProfile);
router.put('/merchant/update', verifyToken, verifyRole(["Merchant"]), merchantUpdateProfile);

router.delete('/delete', verifyToken, verifyRole(["Admin"]), deleteUser);

export default router;
