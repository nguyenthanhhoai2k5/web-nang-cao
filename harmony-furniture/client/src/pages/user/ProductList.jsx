import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../../css/product.css';

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

const ProductList = () => {
const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const itemsPerPage = 12;

    const sliderImages = [imgSlider1, imgSlider2, imgSlider3, imgSlider4, imgSlider5, imgSlider6, imgSlider7];
    
    // State cho bộ lọc và sắp xếp
    const [filter, setFilter] = useState({
        category: '',
        priceRange: '',
        sort: 'featured' // Mặc định là sản phẩm nổi bật
    });

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [filter, currentPage]); // Gọi lại API mỗi khi filter hoặc trang hiện tại thay đổi

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);
        }
    };

const fetchProducts = async () => {
  setLoading(true);
  setError(null);
  try {
    const params = {
      ...filter,
      page: currentPage,
      limit: itemsPerPage,   // 12
    };

    const res = await axios.get('http://localhost:3000/api/products', { params });

        // API trả về { products, totalPages, currentPage, totalProducts }
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        // Nếu muốn hiển thị totalProducts thì set thêm state nữa
    } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
    } finally {
        setLoading(false);
    }
    };
    // Hàm chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
        }
    };

    // Tạo mảng số trang để hiển thị (ví dụ: 1 2 3 ... 10)
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxPagesToShow - 1);

        if (end - start + 1 < maxPagesToShow) {
            start = Math.max(1, end - maxPagesToShow + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="Contents">
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
            <div className="product-page">
                <div className="product-header">
                    <h1 style={{color: "black", fontSize: "37px"}}>Tất cả sản phẩm tại Harmony</h1>
                    <div className="sort-box">
                        <select value={filter.sort} onChange={(e) => setFilter({...filter, sort: e.target.value})}>
                            <option value="featured">Sản phẩm nổi bật</option>
                            <option value="price-asc">Giá tăng dần</option>
                            <option value="price-desc">Giá giảm dần</option>
                            <option value="newest">Sản phẩm mới nhất</option>
                        </select>
                    </div>
                </div>

                <div className="filter-bar">
                    <div className="filter-label">
                        <FaFilter /> <span>BỘ LỌC</span>
                    </div>
                    
                    <select onChange={(e) => setFilter({...filter, category: e.target.value})}>
                        <option value="">DANH MỤC</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>  // Hiển thị tên danh mục, giá trị là ID để gửi lên API
                        ))}
                    </select>

                    <select onChange={(e) => setFilter({...filter, priceRange: e.target.value})}>
                        <option value="">GIÁ SẢN PHẨM</option>
                        <option value="1-5">1.000.000Đ - 5.000.000Đ</option>
                        <option value="5-10">5.000.000Đ - 10.000.000Đ</option>
                        <option value="10-15">10.000.000Đ - 15.000.000Đ</option>
                        <option value="15-20">15.000.000Đ - 20.000.000Đ</option>
                        <option value="20-up">Trên 20.000.000Đ</option>
                    </select>
                </div>

                <div className="product-grid">
                    {loading ? (
                        <div className="loading">Đang tải sản phẩm...</div>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : products.length > 0 ? (
                        products.map(product => (
                            <div key={product._id} className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
                                <img src={`http://localhost:3000${product.images?.[0] || '/placeholder.jpg'}`} alt={product.name} />
                                <h2 className="product-name-home">{product.name}</h2>
                                <div className="price-row">
                                    <p className="discount-price">
                                        {((product.price * (1 - (product.discount || 0) / 100)).toLocaleString())} Đ
                                    </p>
                                    {product.discount > 0 && (
                                        <>
                                            <p className="original-price">{product.price.toLocaleString()} Đ</p>
                                            <span className="discount-tag">-{product.discount}%</span>
                                        </>
                                    )}
                                </div>
                                <button className="view-detail-btn">Xem chi tiết</button>
                            </div>
                        ))
                    ) : (
                        <p className="no-product">Không tìm thấy sản phẩm nào phù hợp.</p>
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="pagination" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '12px',
                        margin: '40px 0 60px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{ padding: '8px 12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <FaChevronLeft />
                        </button>

                        {getPageNumbers().map(pageNum => (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                style={{
                                    padding: '8px 14px',
                                    background: pageNum === currentPage ? '#007bff' : '#f0f0f0',
                                    color: pageNum === currentPage ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                {pageNum}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{ padding: '8px 12px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;