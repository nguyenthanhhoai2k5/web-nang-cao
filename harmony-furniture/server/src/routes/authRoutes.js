import express from 'express';
// Đặt tên biến là chữ thường để đại diện cho instance đã khởi tạo
import authController from '../controllers/AuthController.js'; 

const router = express.Router();

// Route Đăng ký & Đăng nhập
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));


export default router;