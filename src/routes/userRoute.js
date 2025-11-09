import express from 'express';
import { createAdmin, registerMahasiswa, registerMerchant, login, deleteUser, getAllUsers, getAllMahasiswa, getAllMerchant, adminUpdateMahasiswa, adminUpdateMerchant } from '../controllers/userController.js';
import { verifyRole } from '../middleware/rolesChecker.js';

const router = express.Router();
router.post('/admin/create', createAdmin);
router.post('/mahasiswa/register', registerMahasiswa);
router.post('/merchant/register', verifyRole(["Admin"]), registerMerchant);
router.post('/login', login);

router.get('/get-all-users', verifyRole(["Admin"]), getAllUsers)
router.get('/get-all-mahasiswa', verifyRole(["Admin"]), getAllMahasiswa)
router.get('/get-all-merchant', verifyRole(["Admin"]), getAllMerchant)

router.put('/admin-update-mahasiswa', verifyRole(["Admin"]), adminUpdateMahasiswa);
router.put('/admin-update-merchant', verifyRole(["Admin"]), adminUpdateMerchant);

router.delete('/delete-user', verifyRole(["Admin"]), deleteUser);

export default router;
