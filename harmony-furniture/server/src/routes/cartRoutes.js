import express from 'express';
import cartController from '../controllers/CartController.js'; // Viết thường c để đại diện instance
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, (req, res) => cartController.getCart(req, res));
router.post('/add', verifyToken, (req, res) => cartController.addToCart(req, res));

// Kiểm tra kỹ tên hàm ở đây: updateCartItem
router.put('/update', verifyToken, (req, res) => cartController.updateCartItem(req, res));

router.delete('/remove/:productId', verifyToken, (req, res) => cartController.removeFromCart(req, res));

export default router;