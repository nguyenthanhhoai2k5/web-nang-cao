import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    // Mã hóa đơn (Ví dụ: HD001, INV-2024-001)
    invoiceNo: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    // Tên khách hàng
    customerName: { 
        type: String, 
        required: [true, 'Tên khách hàng là bắt buộc'],
        trim: true,
        minlength: [2, 'Tên khách hàng phải có ít nhất 2 ký tự']
    },
    // 
    customerID: {           // ← THÊM mã khác
        type: String,
        trim: true,
        default: ''
    },
    phone: {                // ← THÊM số điện thoại
        type: String,
        trim: true,
        default: ''
    },
    email: {                // ← THÊM MỚI email
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
        default: ''
    },
    address: {              // ← THÊM MỚI địa chỉ 
        type: String,
        trim: true,
        maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự'],
        default: ''
    },
    // Mảng các sản phẩm trong hóa đơn
    items: [{
        productId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product' 
        },
        name: String,      // Lưu tên SP để đề phòng SP bị xóa vẫn còn lịch sử
        quantity: { 
            type: Number, 
            required: true,
            default: 1 
        },
        price: { 
            type: Number, 
            required: true 
        }
    }],
    // Tổng tiền hóa đơn
    totalAmount: { 
        type: Number, 
        required: true,
        default: 0 
    },
    // Phương thức thanh toán (Bổ sung thêm cho chuyên nghiệp)
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Transfer', 'Credit Card'],
        default: 'Cash'
    },
    discount: {             // ← THÊM (có thể là Number hoặc để optional)
        type: Number,
        default: 0
    },
    // Ghi chú hóa đơn
    notes: String
}, { 
    // Tự động tạo trường createdAt và updatedAt
    timestamps: true 
});
// Tự động tính totalAmount trước khi save (nếu cần bảo vệ logic)
invoiceSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.totalAmount = subtotal - (this.discount || 0);
    }
    next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;