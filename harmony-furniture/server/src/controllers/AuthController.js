import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthController {
    /**
     * @route   POST /api/auth/register
     * @desc    Đăng ký tài khoản người dùng mới
     *  User cần nhập vào fullName, username, email, password, nhập lại password để xác nhận
     */
    //Bổ sung vào lấy thông tin user
    
    async register(req, res) {
        try {
            const { fullName, username, email, password, role } = req.body;

            // 1. Kiểm tra xem email đã tồn tại trong hệ thống chưa
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: "Email này đã được sử dụng!" });
            }

            // 2. Kiểm tra xem username đã tồn tại trong hệ thống chưa
            const userExistsByUsername = await User.findOne({ username });
            if (userExistsByUsername) {
                return res.status(400).json({ message: "Tên đăng nhập này đã được sử dụng!" });
            }

            // 2. Mã hóa mật khẩu (Bcrypt) trước khi lưu vào DB để bảo mật
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 3. Khởi tạo đối tượng User mới từ Schema [cite: 10, 28]
            const newUser = new User({
                fullName,   
                username,
                email,
                password: hashedPassword,
                role: role || 'user' // Mặc định là 'user' nếu không truyền role [cite: 9, 10]
            });

            // 4. Lưu người dùng vào MongoDB
            await newUser.save();

            res.status(201).json({ 
                message: "Chúc mừng! Bạn đã đăng ký tài khoản thành công." 
            });
        } catch (error) {
            res.status(500).json({ message: "Lỗi máy chủ khi đăng ký", error: error.message });
        }
    }

    /**
     * @route   POST /api/auth/login
     * @desc    Xác thực người dùng và trả về Token
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // 1. Tìm người dùng dựa trên username 
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: "Tài khoản không tồn tại trong hệ thống." });
            }

            // 2. So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu không chính xác. Vui lòng thử lại!" });
            }

            // 3. Tạo JWT Token (Chứa ID và Quyền hạn - Role)
            const token = jwt.sign(
                { id: user._id, role: user.role }, // Payload
                process.env.JWT_SECRET,            // Secret Key từ file .env
                { expiresIn: '24h' }               // Token có hiệu lực trong 24 giờ
            );

            // 4. Trả về thông tin đăng nhập thành công kèm Token [cite: 17]
            res.status(200).json({
                message: "Đăng nhập thành công!",
                token: token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role // Admin hoặc User [cite: 9, 10]
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Lỗi máy chủ khi đăng nhập", error: error.message });
        }
    }
    // Thêm vào bên trong class AuthController
}

// Xuất ra một instance duy nhất theo mẫu Singleton
// Thay vì export Class, hãy export một thực thể (instance) đã tạo sẵn
export default new AuthController();
