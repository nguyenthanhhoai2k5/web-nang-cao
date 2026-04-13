import express from 'express';
import OrderController from '../controllers/OrderController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware hỗ trợ cả khách vãng lai và thành viên
const optionalAuth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;
        } catch (error) {
            // Token sai thì coi như khách vãng lai
        }
    }
    next();
};

// Route đặt hàng (Guest + User)
router.post('/create', optionalAuth, OrderController.createOrder);

// Routes cho Admin - ĐẶT TRƯỚC CÁC ROUTE PUBLIC
router.get('/admin/all', verifyToken, isAdmin, OrderController.getAllOrders);
router.patch('/admin/update/:id', verifyToken, isAdmin, OrderController.updateStatus);
router.get('/admin/stats', verifyToken, isAdmin, OrderController.getAdminOrders);
// Route lấy thống kê doanh thu (Top items/customers + monthly data)
router.get('/revenue-stats', verifyToken, isAdmin, OrderController.getRevenueStats);

// Route public - ĐẶT SAU CÙNG
router.get('/', OrderController.getAllOrders);

// Route lấy đơn hàng của user hiện tại
router.get('/my-orders', verifyToken, OrderController.getUserOrders);

// Route cập nhật khi user xác nhận đã nhận hàng
router.patch('/received/:orderId', verifyToken, OrderController.markAsReceived);

// Route cập nhật trạng thái (có xác thực)
router.patch('/status/:id', verifyToken, OrderController.updateStatus);

export default router;