import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class UserController {
    // Lấy danh sách user
    async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password').sort({ createdAt: -1 });
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
        }
    }

    // Cập nhật vai trò
    async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
            res.status(200).json({ message: "Cập nhật thành công", user });
        } catch (error) {
            res.status(400).json({ message: "Lỗi cập nhật", error: error.message });
        }
    }
    // Thêm vào UserController
    async getPurchaseHistory(req, res) {
        try {
            const { userId } = req.params;
            
            console.log('Request userId:', userId);                   // ← THÊM
            console.log('Is valid ObjectId?', mongoose.Types.ObjectId.isValid(userId)); // ← THÊM

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: "userId không hợp lệ" });
            }

            const history = await Order.find({ userId: userId })
                .sort({ createdAt: -1 })
                .lean(); // lean() nhanh hơn, trả plain object

            console.log('Tìm thấy số đơn hàng:', history.length);     // ← THÊM

            res.status(200).json(history);
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử mua hàng:", error);    // ← in đầy đủ error
            res.status(500).json({ 
                message: "Lỗi lấy lịch sử", 
                error: error.message,
                stack: error.stack ? error.stack.split('\n')[0] : undefined // chỉ lấy dòng đầu stack
            });
        }
    }
    // Thêm models xóa  
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID người dùng không hợp lệ" });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }

            // Không cho xóa chính admin đang đăng nhập (tùy chọn an toàn)
            if (user.role === 'admin') {
                return res.status(403).json({ message: "Không được xóa tài khoản Admin" });
            }

            // Xóa user
            await User.findByIdAndDelete(id);

            // (Tùy chọn) Xóa luôn lịch sử đơn hàng của user đó
            await Order.deleteMany({ userId: id });

            res.status(200).json({ message: "Xóa tài khoản thành công!" });
        } catch (error) {
            console.error("Lỗi xóa user:", error);
            res.status(500).json({ message: "Lỗi server khi xóa tài khoản" });
        }
    }
    /// Thêm models profile 
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select('-password');
            
            // Lấy lịch sử mua hàng (chỉ user mới cần, nhưng lấy chung cũng không sao)
            const orderHistory = await Order.find({ userId }).sort({ createdAt: -1 });

            res.status(200).json({ user, orderHistory });
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy thông tin profile" });
        }
    }

    // Cập nhật thông tin
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { fullName, email, phoneNumber, address } = req.body;
            let updateData = { fullName, email, phoneNumber, address };

            // Lấy user hiện tại để biết avatar cũ (nếu có)
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

            const oldAvatar = user.avatar;

            // Nếu có upload avatar mới -> lưu đường dẫn public và chuẩn bị xóa avatar cũ
            if (req.file) {
                console.log('Upload middleware provided file:', req.file);
                // Đảm bảo req.file.filename tồn tại
                if (req.file.filename) {
                    updateData.avatar = `/uploads/avatars/${req.file.filename}`;
                } else if (req.file.path) {
                    // Fallback: lấy tên file từ đường dẫn
                    const uploadedName = path.basename(req.file.path);
                    updateData.avatar = `/uploads/avatars/${uploadedName}`;
                } else {
                    console.warn('Không tìm thấy filename trong req.file:', req.file);
                }
            }

            const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

            // Nếu có avatar mới và avatar cũ tồn tại -> xóa file avatar cũ khỏi uploads/avatars
            if (req.file && oldAvatar) {
                try {
                    const oldFilename = path.basename(oldAvatar);
                    const newFilename = req.file.filename;
                    if (oldFilename && oldFilename !== newFilename) {
                        const __dirname = path.dirname(fileURLToPath(import.meta.url));
                        const oldFilePath = path.resolve(__dirname, '../../uploads/avatars', oldFilename);
                        fs.unlink(oldFilePath, (err) => {
                            if (err) {
                                console.warn('Không thể xóa ảnh cũ:', oldFilePath, err.message);
                            } else {
                                console.log('Ảnh cũ đã bị xóa:', oldFilePath);
                            }
                        });
                    }
                } catch (delErr) {
                    console.error('Lỗi khi cố gắng xóa avatar cũ:', delErr);
                }
            }

            res.status(200).json({ message: "Cập nhật thành công", user: updatedUser });
        } catch (error) {
            console.error('Lỗi updateProfile:', error);
            res.status(500).json({ message: "Lỗi cập nhật thông tin", error: error.message });
        }
    }

}
export default new UserController(); // Export instance luôn để tránh lỗi constructor