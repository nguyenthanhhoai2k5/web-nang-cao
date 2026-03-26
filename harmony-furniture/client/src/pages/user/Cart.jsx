import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaSearch, FaMinus, FaPlus, FaCartPlus} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const isLogin = !!localStorage.getItem('token');

    const navigate = useNavigate(); // Khởi tạo userNavigate 

    // 1. Lấy dữ liệu giỏ hàng
    useEffect(() => {
        if (isLogin) {
            fetchDbCart();
        } else {
            const localCart = JSON.parse(localStorage.getItem('cart')) || [];
            setCartItems(localCart);
        }
    }, []);
    
    // Đã thêm mới map dữ liệu để khớp với cấu trúc của localStorage và code render
    const fetchDbCart = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/cart', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Map về cấu trúc phẳng để khớp với localStorage và code render
            const mappedItems = res.data.items.map(item => ({
                productId: item.product._id,  // Lấy từ product object
                name: item.product.name,
                price: item.product.price,
                discount: item.product.discount || 0,
                image: item.product.images?.[0],
                categoryName: item.product.category?.name || 'Nội thất',
                quantity: item.quantity
            }));
            setCartItems(mappedItems);
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng", error);
        }
    };

    // 2. Logic Tăng/Giảm số lượng
    const updateQuantity = (productId, delta) => {
        const newCart = cartItems.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(newCart);
        if (!isLogin) localStorage.setItem('cart', JSON.stringify(newCart));
        // Nếu là User, bạn có thể gọi API update tại đây
    };

    // 3. Logic Checkbox
    const handleCheckAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(cartItems.map(item => item.productId));
        } else {
            setSelectedIds([]);
        }
    };

    const handleCheckItem = (productId) => {
        setSelectedIds(prev => 
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    // 4. Tính toán tổng tiền
    const selectedItems = cartItems.filter(item => selectedIds.includes(item.productId));
    const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Lọc tìm kiếm
    const filteredItems = cartItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hàm đi đến chi tiết sản phẩm
    const goToProductDetail = (productId) => {
        navigate(`/product/${productId}`);
    };
    
    const removeItem = async (productId) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
            const newCart = cartItems.filter(item => item.productId !== productId);
            setCartItems(newCart);

            if (!isLogin) {
                localStorage.setItem('cart', JSON.stringify(newCart));
            } else {
                try {
                    await axios.delete(`http://localhost:3000/api/cart/remove/${productId}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    // Optional: Refetch
                    // fetchDbCart();
                } catch (error) {
                    console.error("Lỗi xóa item", error);
                    alert("Lỗi xóa sản phẩm");
                }
            }
        }
    };
    // Lấy sản phẩm của giỏ hàng dẫn đến trang thanh toán.
    const handleCheckout = () => {
        // 1. Lấy danh sách chi tiết các sản phẩm đã chọn checkbox
        const selectedItems = cartItems.filter(item => selectedIds.includes(item.productId));

        if (selectedItems.length === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
            return;
        }

        // 2. Chuyển hướng sang trang checkout và đính kèm dữ liệu
        navigate('/checkout', { state: { products: selectedItems } });
    };

    return (
        <div className="cart-page">
            {/* Header Giỏ hàng */}
            <div className="cart-header">
                <div className="header-left">
                    <div className="cart-logo-wrapper">
                        <Link to={'/'}><img src='src/assets/images/Logo_Hamory.png' className='logo'></img></Link>
                        <span className="divider">|</span>
                        <span className="cart-title-name">Giỏ Hàng</span>
                    </div>
                </div>
                <div className="header-search">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Tìm sản phẩm trong giỏ..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch />
                    </div>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="cart-content">
                {cartItems.length === 0 ? (
                    <div className="empty-cart">Không có sản phẩm nào trong giỏ hàng.</div>
                ) : (
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" onChange={handleCheckAll}  // Phần này cho phép lấy tất cả sản phẩm trong danh sách
                                    checked={selectedIds.length === cartItems.length && cartItems.length > 0}/>
                                </th>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Tổng tiền</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item.productId}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(item.productId)}
                                            onChange={() => handleCheckItem(item.productId)}
                                        />
                                    </td>
                                    <td 
                                        className="product-cell clickable"
                                        onClick={() => goToProductDetail(item.productId)}
                                    >
                                        <div className="carts-product-info">
                                            <img 
                                                src={`http://localhost:3000${item.image}`}  
                                                alt={item.name} 
                                                className="carts-product-img" // ảnh sản phẩm trong giỏ hàng
                                            />
                                            <div>
                                                <p className="carts-product-name">{item.name}</p>  {/* Tên sản phẩm*/}
                                                <small>{item.categoryName || 'Nội thất'}</small> {/* Danh mục sản phẩm, nếu có */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="subtotal">  {/* Giá sau khi đã áp dụng giảm giá (nếu có) nhân với số lượng */}
                                        {((item.price * (1 - (item.discount || 0)/100)) * item.quantity).toLocaleString()} Đ
                                    </td>
                                    <td>
                                        <div className="cart-qty-actions">
                                            <button onClick={() => updateQuantity(item.productId, -1)}><FaMinus/></button>
                                            <input type="number" value={item.quantity} readOnly />
                                            <button onClick={() => updateQuantity(item.productId, 1)}><FaPlus/></button>
                                        </div>
                                    </td>
                                    <td className="subtotal"> {/* Tổng tiền của sản phẩm đó (đơn giá sau giảm giá nhân với số lượng) */}
                                        {((item.price * (1 - (item.discount || 0)/100)) * item.quantity).toLocaleString()} Đ
                                    </td>
                                    <td>
                                        <button className="btn-carts-remove" onClick={() => removeItem(item.productId)}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))} 
                        </tbody>
                    </table>
                )}
            </div>

            {/* Thanh toán cố định ở dưới hoặc bên phải */}
            <div className="cart-footer">
                <div className="summary">
                    <span>Tổng cộng ({selectedIds.length} sản phẩm): </span>
                    <span className="total-price">{totalAmount.toLocaleString()} Đ</span>
                </div>
                <button className="btn-checkout" disabled={selectedIds.length === 0} onClick={handleCheckout}>
                    Mua Hàng
                </button>
            </div>
        </div>
    );
};

export default Cart;