import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }], // Mảng chứa các đường dẫn ảnh
    video: { type: String },    // Đường dẫn video
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);