// server/src/routes/userRoutes.js
import express from 'express';
import userController from '../controllers/UserController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Lấy danh sách user: GET /api/users
router.get('/', (req, res) => userController.getAllUsers(req, res));

// Cập nhật vai trò: PUT /api/users/:id/role
router.put('/:id/role', (req, res) => userController.updateUserRole(req, res));

// Lấy thông tin profile hiện tại (dùng token để xác thực)
router.get('/profile', verifyToken, (req, res) => userController.getProfile(req, res));

// Cập nhật profile hiện tại
router.put('/profile', verifyToken, upload.single('avatar'), (req, res) => userController.updateProfile(req, res));

// Lấy lịch sử mua hàng theo userId (nếu cần)
router.get('/:userId/history', userController.getPurchaseHistory);
// Models xóa 
router.delete('/:id', userController.deleteUser); 


export default router;