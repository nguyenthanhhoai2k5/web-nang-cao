import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    fullName: String,
    phone: String,
    email: String,
    address: String,
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        originalPrice: Number, // Giá gốc (không giảm giá)
        price: Number, // Giá đã tính giảm giá
        discount: { type: Number, default: 0 }, // % giảm giá
        quantity: Number,
        image: String
    }],
    totalAmount: Number,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    isViewed: { type: Boolean, default: false }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;