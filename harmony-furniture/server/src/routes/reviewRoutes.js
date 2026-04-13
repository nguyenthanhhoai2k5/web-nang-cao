import express from 'express';
import ReviewController from '../controllers/ReviewController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js'; // Import default thành công

const router = express.Router();

// Cấu hình upload đa phương tiện
const cpUpload = upload.fields([
    { name: 'images', maxCount: 5 }, 
    { name: 'video', maxCount: 1 }
]);

router.post('/', verifyToken, cpUpload, ReviewController.createReview);
router.get('/:orderId', ReviewController.getReviewByOrder);
// Route lấy tất cả review của 1 product
router.get('/product/:productId', ReviewController.getReviewsByProduct);

export default router;