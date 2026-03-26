import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware xác thực Token (Dành cho cả User và Admin)
 */
export const verifyToken = (req, res, next) => {
    // Lấy token từ header Authorization (dạng: Bearer <token>)
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Truy cập bị từ chối. Bạn cần đăng nhập!" }); // sử lý khi dùng dẫn đến quản lý admin
    }

    try {
        // Kiểm tra tính hợp lệ của token bằng Secret Key
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Lưu thông tin user (id, role) vào request để dùng ở các bước sau
        next(); // Cho phép đi tiếp vào Controller
    } catch (error) {
        res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

/**
 * Middleware kiểm tra quyền Admin
 */
export const isAdmin = (req, res, next) => {
  // req.user được tạo ra từ middleware verifyToken
  if (req.user && req.user.role === 'admin') {
    next(); // Cho phép đi tiếp
  } else {
    return res.status(403).json({ message: "Quyền truy cập bị từ chối. Chỉ dành cho Admin!" });
  }
};