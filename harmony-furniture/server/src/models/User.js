import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: [true, 'Họ tên là bắt buộc'], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email là bắt buộc'], 
        unique: true, 
        lowercase: true 
    },
    username: {
        type: String, 
        required: [true, 'Tên đăng nhập là bắt buộc'], 
        unique: true
    }, 
    password: { 
        type: String, 
        required: [true, 'Mật khẩu là bắt buộc'],
        minlength: 6
    },
    avatar: { 
        type: String, 
        default: '' // Ảnh đại diện cho trang Hồ sơ 
    },
    role: { 
        type: String, 
        enum: ['admin', 'user'], 
        default: 'user' // Phân quyền Admin quản trị [cite: 9, 10, 25]
    },
    phoneNumber: { 
        type: String, 
        default: '' 
    },
    address: { 
        type: String, 
        default: '' 
    },
    // Lưu danh sách ID các đơn hàng đã mua để hiển thị ở trang Hồ sơ 
    purchaseHistory: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order' 
    }]
}, { 
    timestamps: true 
});

const User = mongoose.model('User', userSchema);
export default User;