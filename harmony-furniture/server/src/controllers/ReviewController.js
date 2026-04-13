import Review from '../models/Review.js';

class ReviewController {
    async createReview(req, res) {
        try {
            const { orderId, productId, rating, comment } = req.body;
            const userId = req.user.id;

            // Xử lý file ảnh và video từ multer
            const images = req.files['images'] ? req.files['images'].map(f => `/uploads/reviews/${f.filename}`) : [];
            const video = req.files['video'] ? `/uploads/reviews/${req.files['video'][0].filename}` : null;

            const newReview = new Review({
                userId,
                productId,
                orderId,
                rating,
                comment,
                images,
                video
            });

            await newReview.save();
            res.status(201).json({ message: "Đánh giá thành công!", review: newReview });
        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
        }
    }

    // Hàm lấy đánh giá của một đơn hàng (để hiển thị nếu cần)
    async getReviewByOrder(req, res) {
        try {
            const review = await Review.findOne({ orderId: req.params.orderId });
            res.status(200).json(review);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy đánh giá" });
        }
    }

    // Lấy tất cả đánh giá cho một product
    async getReviewsByProduct(req, res) {
        try {
            const productId = req.params.productId;
            const reviews = await Review.find({ productId }).populate('userId', 'name fullname avatar');
            res.status(200).json(reviews);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy đánh giá cho sản phẩm" });
        }
    }
}

export default new ReviewController();