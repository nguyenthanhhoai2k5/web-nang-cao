import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

// Import ảnh Slider (giữ nguyên các ảnh bạn đã import)
import imgSlider1 from '../../assets/images/images_slider1.png';
import imgSlider2 from '../../assets/images/images_slider2.png';
import imgSlider3 from '../../assets/images/images_slider3.png';
import imgSlider4 from '../../assets/images/images_slider4.png';
import imgSlider5 from '../../assets/images/images_slider5.png';
import imgSlider6 from '../../assets/images/images_slider6.png';
import imgSlider7 from '../../assets/images/images_slider7.png';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../../css/style.css';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const sliderImages = [imgSlider1, imgSlider2, imgSlider3, imgSlider4, imgSlider5, imgSlider6, imgSlider7];

  // --- FETCH DỮ LIỆU THẬT ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/products');
        
        // Sửa ở đây: lấy res.data.products thay vì res.data
        const productList = res.data.products || [];   // an toàn nếu không có key products
        
        // Trộn ngẫu nhiên và lấy 16 sản phẩm
        const shuffled = [...productList].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 16);
        
        setProducts(selected);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu sản phẩm:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Đang tải sản phẩm...</div>;

  return (
    <div className="home-container">
      {/* 1. Swiper Banner (Giữ nguyên giao diện của bạn) */}
      <section className="banner-slider">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          {sliderImages.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="slider-img-wrapper">
                <img src={img} alt={`Banner ${idx + 1}`} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      
      {/* 2. Danh sách sản phẩm thật */}
      <section className="product-section">
        <div className="container">
          <h1 style={{fontSize: "37px", color: "black"}}>Các sản phẩm nổi bật</h1>
          <div className="product-grid">
            {products.map((product) => (
              <div 
                key={product._id} 
                className="product-card"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="product-img-home">   {/* Anh sản phẩm */ }  
                  {/* Logic lấy ảnh đầu tiên trong mảng images */}
                  <img 
                    src={`http://localhost:3000${product.images?.[0]}`} 
                    alt={product.name} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
                  />
                </div>
                  <div className="product-info">
                    <h2 className="product-name-home">{product.name}</h2>
                    <div className="price-row">
                      <span className="discount-price">
                        {Math.floor(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')}đ
                      </span>
                      <span className="original-price">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      {product.discount > 0 && (
                        <span className="discount-tag">-{product.discount}%</span>
                      )}
                    </div>
                  </div>
                <button className="view-detail-btn">Xem chi tiết</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;