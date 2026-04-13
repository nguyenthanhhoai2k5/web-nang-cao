import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/reviews';
        // Tự động tạo thư mục nếu chưa có
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Đặt tên file: timestamp + tên gốc để tránh trùng lặp
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Kiểm tra định dạng file (chỉ cho phép ảnh và video)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh hoặc video!'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Giới hạn 50MB cho video
});

// QUAN TRỌNG: Phải có dòng này để reviewRoutes.js import được
export default upload;
// Cung cấp thêm export đặt tên để các file khác có thể import { upload }
export { upload };