// Đây là trang chi tiết sản phẩm, có thể truy cập từ trang Home hoặc các trang khác, sẽ hiển thị thông tin chi tiết về sản phẩm, hình ảnh, mô tả, đánh giá, v.v.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/product-detail.css';
import Cart from './user/Cart';


// Giả sử bạn có component riêng, import chúng
// import DescriptionList from '../components/DescriptionList'; // Nếu có file riêng
// import Comments from '../components/Comments'; // Nếu có file riêng

// Nếu chưa có, define inline tạm (sau này tách ra)
const DescriptionList = ({ data }) => {
  return (
    <div className="description-list">
      {data && data.length > 0 ? (
        data.map((desc, index) => (
          <div key={index} className="desc-item">
            <h2>{desc.title || 'Mô tả'}</h2>
            <p>{desc.content || 'Chưa có nội dung'}</p>
            {desc.images && desc.images.map((img, i) => (
              <img key={i} src={`http://localhost:3000${img}`} alt="Mô tả" style={{ width: '100%', height: 'auto'}} />
            ))}
          </div>
        ))
      ) : (
        <h3 className='infor-description-comments'>Không có mô tả chi tiết</h3>
      )}
    </div>
  );
};

const Comments = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(0); // 0 = tất cả, 1-5 = tương ứng

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/reviews/product/${productId}`);
        setReviews(res.data || []);
      } catch (err) {
        console.warn('Lỗi fetch reviews', err.message || err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  const filtered = selectedRating === 0 ? reviews : reviews.filter(r => Number(r.rating) === Number(selectedRating));

  const onSelectRating = (r) => setSelectedRating(r);

  if (loading) return <div>Đang tải bình luận...</div>;
  if (!reviews || reviews.length === 0) return <h3 className='infor-description-comments'>Chưa có bình luận nào ở đây</h3>;

  return (
    <div className="comments">
      <div className="review-filters">
        <button className={`filter-btn ${selectedRating===0? 'active' : ''}`} onClick={() => onSelectRating(0)}>Tất cả đánh giá</button>
        {[5,4,3,2,1].map(n => (
          <button key={n} className={`filter-btn ${selectedRating===n? 'active' : ''}`} onClick={() => onSelectRating(n)}>{n} sao</button>
        ))}
      </div>

      <div className="review-list">
        {filtered.map(r => (
          <div key={r._id} className="review-card">
            <div className="review-card-date">{new Date(r.createdAt).toLocaleString()}</div>
            <div className="review-card-top">
              <div className="avatar-wrap">
                {r.userId?.avatar ? (
                  <img className="avatar" src={`http://localhost:3000${r.userId.avatar}`} alt={r.userId?.name || 'avatar'} />
                ) : (
                  <div className="avatar-fallback">👤</div>
                )}
              </div>
              <div className="user-name">{r.userId?.name || r.userId?.fullname || 'Người dùng'}</div>
            </div>

            <div className="review-rating-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>

            <div className="review-text">{r.comment}</div>

            {((r.images && r.images.length>0) || r.video) && (
              <div className="review-media">
                {r.images && r.images.map((img, i) => (
                  <img key={i} src={`http://localhost:3000/${img.replace(/^\/+/, '')}`} alt={`rev-${i}`} className="review-media-img" />
                ))}
                {r.video && (
                  <video className="review-media-video" controls>
                    <source src={`http://localhost:3000/${r.video.replace(/^\/+/, '')}`} />
                  </video>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImg, setMainImg] = useState('');
  const [activeTab, setActiveTab] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // dùng để đến trang detail.

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProduct(res.data);
        setMainImg(res.data.images?.[0] || '');
        setLoading(false);
      } catch (err) {
        setError('Không thể tải sản phẩm: ' + (err.response?.data?.message || 'Lỗi kết nối'));
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Sản phẩm không tồn tại.</div>;

  // Hàm xóa cho admin
  const handleDelete = async () => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        await axios.delete(`http://localhost:3000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        alert('Xóa thành công!');
        navigate('/admin/products');
      } catch (err) {
        alert('Lỗi khi xóa: ' + (err.response?.data?.message || 'Không xác định'));
      }
    }
  };
  // Cập nhật hàm đến với trang giỏ hàng:
  const handleAddToCart = async () => {
      if (!product) return;

      const token = localStorage.getItem('token');

      const cartItem = {
          productId: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount,
          image: product.images?.[0],
          categoryName: product.category?.name || 'Nội thất',
          quantity: quantity          // ← dùng state quantity
      };

      try {
          if (token) {
              // User đã đăng nhập → lưu vào database
              await axios.post('http://localhost:3000/api/cart/add', 
                  { 
                      productId: product._id, 
                      quantity: quantity 
                  }, 
                  {
                      headers: { Authorization: `Bearer ${token}` }
                  }
              );
              console.log("Đã lưu vào Database");
          } else {
              // Khách chưa đăng nhập → lưu localStorage
              let localCart = JSON.parse(localStorage.getItem('cart')) || [];
              
              const existingIndex = localCart.findIndex(item => item.productId === product._id);
              
              if (existingIndex !== -1) {
                  localCart[existingIndex].quantity += quantity;
              } else {
                  localCart.push(cartItem);
              }
              
              localStorage.setItem('cart', JSON.stringify(localCart));
              console.log("Đã lưu vào localStorage");
          }

          alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
          navigate('/cart');   // Chỉ navigate khi thành công

      } catch (error) {
          console.error("Lỗi thêm vào giỏ hàng:", error);
          alert("Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.");
      }
  };
  // Hàm lấy sản phẩm đến giỏ hàm 
  // Tạo object sản phẩm theo định dạng trang Checkout yêu cầu
  // Hàm Mua ngay (Buy Now)
  const handleBuyNow = () => {
      if (!product) return;
      const itemToBuy = [{
          productId: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount,                    
          image: product.images?.[0], 
          categoryName: product.category?.name || 'Nội thất',
          quantity: quantity
      }];

      navigate('/checkout', { 
          state: { products: itemToBuy } 
      });
  };

  return (
    <div className="detail-container">
        {/* Link trở về */}
        <button 
        className="detail-back-btn"
        onClick={() => navigate(-1)}
        >
        ← Trở về
        </button>

        {/* Phần chính: ảnh + thông tin trên cùng hàng */}
        <div className="detail-main-row">
          {/* Bên trái: Ảnh */}
          <div className="detail-left">
              <div className="thumb-column">
                {product.images?.map((img, idx) => (
                    <img
                    key={idx}
                    src={`http://localhost:3000${img}`}
                    className={`thumb ${mainImg === img ? 'active' : ''}`}
                    onClick={() => setMainImg(img)}
                    alt={`Thumbnail ${idx + 1}`}
                    />
                ))}
              </div>
              <div className="main-img-box">
              <img
                  src={`http://localhost:3000${mainImg || product.images?.[0]}`}
                  className="big-img"
                  alt={product.name}
              />
              </div>
          </div>

          {/* Bên phải: Thông tin sản phẩm */}
          <div className="detail-right">
              <div className='infomation-of-product'>
                <p className="product-title">{product.name}</p>
                <p className="product-category">Loại: {product.category?.name || 'Chưa phân loại'}</p>

                {/* Giá + giảm giá trên cùng hàng */}
                <hr></hr>
                  <div className="price-row">
                    <span className="sale-price">
                        {(product.price * (1 - product.discount / 100)).toLocaleString()} VNĐ
                    </span>
                    <span className="old-price">{product.price.toLocaleString()} VNĐ</span>
                    {product.discount > 0 && (
                        <span className="percent">-{product.discount}%</span>
                    )}
                  </div>
                <hr></hr>

                {/* Số lượng còn */}
                <p className="stock-info">
                Số lượng còn: <strong>{product.stock}</strong>
                </p>
                <>
                  {/* Input chọn số lượng */}
                  <div className="quantity-group">
                      <button 
                          className="qty-btn" 
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      >
                          -
                      </button>
                      <input 
                          type="number" 
                          className="qty-input" 
                          value={quantity} 
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                      />
                      <button 
                          className="qty-btn" 
                          onClick={() => setQuantity(prev => prev + 1)}
                      >
                          +
                      </button>
                  </div>
                </>

                {/* Nút hành động */}
                <div className="action-buttons">
                  {isAdmin ? (
                      <button className="btn-cart-delete" onClick={handleDelete}>
                        Xóa sản phẩm
                      </button>
                  ) : (
                    <>
                      <button className="btn-add-cart" onClick={handleAddToCart}>
                          Thêm vào giỏ hàng
                      </button>
                      <button className="btn-buy" onClick={handleBuyNow}>Mua Hàng</button>
                    </>
                  )}
                </div> 
              </div>
                {/* Phần hổ trợ*/} 
              <div className='shipping-support'>
                <p>1. Miễn phí giao hàng & lắp đặt tại tất cả quận huyện thuộc TP.HCM, Hà Nội, Khu đô thị Ecopark, Biên Hòa và một số quận thuộc Bình Dương (*)</p>
                <p>2. Miễn phí 1 đổi 1 - Bảo hành 5 năm - Bảo trì trọn đời (**)</p>
                <p>3. Không áp dụng cho danh mục Đồ Trang Trí và Nệm</p>
                <p>4. Không áp dụng cho các sản phẩm Clearance. Chỉ bảo hành 01 năm cho khung ghế, mâm và cần đối với Ghế Văn Phòng</p>
                <p>5. Hỗ trở đổi / trả và hoàn lại tiền nếu sản phẩm bị lỗi</p> 
              </div>
          </div> {/*Kết thúc cột bên phải*/}
        </div>  
        
          {/* Tabs mô tả & bình luận (dưới cùng) */}
          <div className="detail-tabs">
            <div className="tab-headers">
                <button 
                className={activeTab === 'desc' ? 'active' : ''} 
                onClick={() => setActiveTab('desc')}
                >
                Mô tả
                </button>
                <button 
                className={activeTab === 'comment' ? 'active' : ''} 
                onClick={() => setActiveTab('comment')}
                >
                Bình luận
                </button>
            </div>
            <hr></hr>
          <div className="tab-content">
              {activeTab === 'desc' ? (
              <DescriptionList data={product.descriptions} />
              ) : (
              <Comments productId={product._id} />
              )}
          </div>
        </div>
    </div>
  );
};

export default ProductDetail;