import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Lưu avatar vào thư mục uploads/avatars
    const dest = path.resolve('uploads', 'avatars');
    try {
      // Tạo thư mục nếu chưa tồn tại (đồng thời tạo parent nếu cần)
      fs.mkdirSync(dest, { recursive: true });
    } catch (err) {
      // Nếu mkdir gặp lỗi, log nhưng vẫn tiếp tục (multer sẽ báo lỗi nếu cần)
      console.warn('Không thể tạo thư mục uploads/avatars:', err.message);
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Đổi tên file để tránh trùng: thời-gian-tên-gốc
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB/file
});