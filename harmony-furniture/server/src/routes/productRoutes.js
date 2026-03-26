import express from 'express';
import ProductController from '../controllers/ProductController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
// QUAN TRỌNG: Bạn phải import middleware upload đã tạo ở bước trước
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

/**
 * Route: POST /api/products/st('/add', verifyToken, isAdmin, ProductController.create);
add
 * Bảo vệ: Phải có Token hợp lệ VÀ có quyền Admin
 */
console.log("Kiểm tra ProductController:", ProductController);
console.log("Kiểm tra hàm getAll:", ProductController.getAll);
// Định nghĩa fields cho Multer
const uploadFields = upload.fields([
  { name: 'images', maxCount: 7 }, // Ảnh chính (tối đa 7)
  { name: 'descImages[0]', maxCount: 2 }, // Ảnh mô tả 1
  { name: 'descImages[1]', maxCount: 2 }, // Ảnh mô tả 2 (thêm max theo số mô tả bạn cho phép, hoặc dùng dynamic nếu cần)
  { name: 'descImages[2]', maxCount: 2 }, // ...
  // Thêm nhiều nếu user có thể add >3 mô tả, hoặc dùng upload.any() nhưng kém bảo mật
]);

router.get('/', ProductController.getAll);
// Thêm route này để lấy chi tiết sản phẩm theo ID 
router.get('/:id', ProductController.getById);
// Routes
router.post('/add', verifyToken, isAdmin, uploadFields, ProductController.add);
router.put('/:id', verifyToken, isAdmin, uploadFields, ProductController.update);
// Thêm route này và nhớ dùng Middleware xác thực Admin (Route PUT để ẩn hiện sản phẩm thay vì xóa hẳn)
router.patch('/hide/:id', verifyToken, isAdmin, ProductController.toggleHide);
// Thêm route này và nhớ dùng Middleware xác thực Admin
router.delete('/:id', verifyToken, isAdmin, ProductController.delete);


// Route công khai cho khách xem sản phẩm
// router.get('/', ProductController.getAll); 

export default router;