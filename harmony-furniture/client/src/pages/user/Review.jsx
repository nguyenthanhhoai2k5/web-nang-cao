import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaCamera, FaVideo, FaCloudUploadAlt } from 'react-icons/fa';
import axios from 'axios';
import '../../css/review.css';

const Review = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const productId = searchParams.get('productId');
    const navigate = useNavigate();
    
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);
    const [productInfo, setProductInfo] = useState(null);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const fetchOrderAndProduct = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Lấy danh sách đơn hàng của user, tìm order theo orderId
                const ordersRes = await axios.get('http://localhost:3000/api/orders/my-orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const orders = ordersRes.data || [];
                const order = orders.find(o => o._id === orderId || o._id === (orderId && orderId.toString()));

                if (order && productId) {
                    const item = order.items.find(i => i.productId && i.productId.toString() === productId.toString()) || order.items[0];
                    if (item) {
                        setProductInfo({
                                image: item.image || (item.images && item.images[0]) || '',
                                name: item.name || '',
                                category: item.category || '',
                                price: item.price || item.originalPrice || 0,
                                quantity: item.quantity || 1,
                                total: (item.price || item.originalPrice || 0) * (item.quantity || 1)
                            });
                        return;
                    }
                }

                // Nếu không tìm thấy trong order, fallback lấy thông tin product
                if (productId) {
                    const prodRes = await axios.get(`http://localhost:3000/api/products/${productId}`);
                    const p = prodRes.data;
                    const discount = p.discount || 0;
                    const priceAfter = p.price * (100 - discount) / 100;
                    setProductInfo({
                        image: p.images?.[0] || '',
                        name: p.name || '',
                        category: p.category?.name || '',
                        price: priceAfter,
                        quantity: 1,
                        total: priceAfter
                    });
                }
            } catch (err) {
                console.warn('Không lấy được thông tin đơn hàng/sản phẩm', err.message || err);
            }
        };

        fetchOrderAndProduct();
    }, [orderId, productId]);

    // helper to normalize server image paths to valid URLs
    const makeImageUrl = (imgPath) => {
        if (!imgPath) return '';
        // If already absolute URL
        if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
        // Normalize backslashes to slashes
        const normalized = imgPath.replace(/\\/g, '/');
        // Ensure no leading slash duplication
        const cleaned = normalized.startsWith('/') ? normalized.slice(1) : normalized;
        return `http://localhost:3000/${cleaned}`;
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages((prev) => [...prev, ...files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Vui lòng chọn số sao đánh giá!");
            return;
        }

        const formData = new FormData();
        formData.append('orderId', orderId);
        if (productId) formData.append('productId', productId);
        formData.append('rating', rating);
        formData.append('comment', comment);
        images.forEach((img) => formData.append('images', img));
        if (video) formData.append('video', video);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:3000/api/reviews', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // show success message and navigate back
            alert(res.data?.message || "Đánh giá sản phẩm thành công. Cảm ơn bạn đã phản hồi.");
            navigate('/my-orders');
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Lỗi khi gửi đánh giá.';
            setSubmitError(msg);
            alert(msg);
        }
    };

    return (
        <div className="review-page">
            <div className="review-container">
                <h2>Đánh Giá Sản Phẩm</h2>
                {/* Hiển thị tóm tắt sản phẩm thay cho mã đơn hàng */}
                {productInfo ? (
                    <div className="product-summary">
                        <img src={productInfo.image ? makeImageUrl(productInfo.image) : '/'} alt="thumb" width={50} height={50} />
                        <div className="product-meta">
                            <div className="prod-name">{productInfo.name}</div>
                            <div className="prod-category">{productInfo.category}</div>
                        </div>
                        <div className="prod-price">{Number(productInfo.price).toLocaleString()}₫</div>
                        <div className="prod-qty">x{productInfo.quantity}</div>
                        <div className="prod-total">{Number(productInfo.total).toLocaleString()}₫</div>
                    </div>
                ) : (
                    <p className="order-ref">Mã đơn hàng: {orderId}</p>
                )}
                {submitError && <p className="submit-error">{submitError}</p>}

                <form onSubmit={handleSubmit}>
                    {/* 1. Hệ thống đánh giá sao */}
                    <div className="rating-section">
                        <p>Chất lượng sản phẩm:</p>
                        <div className="stars">
                            {[...Array(5)].map((_, index) => {
                                const starValue = index + 1;
                                return (
                                    <FaStar
                                        key={starValue}
                                        className="star-icon"
                                        color={starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                        size={40}
                                        onMouseEnter={() => setHover(starValue)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setRating(starValue)}
                                    />
                                );
                            })}
                            <span className="rating-text">
                                {rating === 5 ? "Tuyệt vời" : rating === 4 ? "Hài lòng" : rating === 3 ? "Bình thường" : rating === 2 ? "Không hài lòng" : rating === 1 ? "Tệ" : ""}
                            </span>
                        </div>
                    </div>

                    {/* 2. Ô nhập bình luận */}
                    <div className="comment-section">
                        <textarea
                            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    {/* 3. Upload Hình ảnh & Video */}
                    <div className="upload-section">
                        <div className="upload-buttons">
                            <label className="upload-label">
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
                                <FaCamera /> Thêm Hình ảnh
                            </label>
                            <label className="upload-label">
                                <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} hidden />
                                <FaVideo /> Thêm Video
                            </label>
                        </div>

                        {/* Preview */}
                        <div className="preview-container">
                            {images.map((img, index) => (
                                <div key={index} className="preview-item">
                                    <img src={URL.createObjectURL(img)} alt="preview" />
                                </div>
                            ))}
                            {video && (
                                <div className="preview-item video-preview">
                                    <FaVideo size={30} color="#666" />
                                    <span>{video.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button type="submit" className="btn-submit-review">Gửi Đánh Giá</button>
                </form>
            </div>
        </div>
    );
};

export default Review;