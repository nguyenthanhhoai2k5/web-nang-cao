// Đây là trang thanh toán. 
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../css/checkout.css';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState(location.state?.products || []);
    const [isEditing, setIsEditing] = useState(false);
    
    // Thông tin người dùng (Lấy từ localStorage nếu đã đăng nhập)
    const user = JSON.parse(localStorage.getItem('user')) || null;

    const [shippingInfo, setShippingInfo] = useState({
        fullName: user?.fullName || '',
        phone: user?.phoneNumber || '',
        email: user?.email || '',
        address: user?.address || ''
    });

    // THÊM: State lưu lỗi cho từng trường
    const [errors, setErrors] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: ''
    });

    // Handlers to restrict input characters and provide immediate feedback
    const handleNameChange = (e) => {
        // Remove digits from the name input
        const filtered = e.target.value.replace(/[0-9]/g, '');
        setShippingInfo({ ...shippingInfo, fullName: filtered });
        setErrors(prev => ({ ...prev, fullName: filtered.trim() ? '' : 'Yêu cầu bạn nhập Họ và tên' }));
    };

    const handlePhoneChange = (e) => {
        // Keep only digits and limit to 12 characters
        let digits = e.target.value.replace(/\D/g, '');
        if (digits.length > 12) digits = digits.slice(0, 12);
        setShippingInfo({ ...shippingInfo, phone: digits });
        if (!/^\d{10,12}$/.test(digits)) {
            setErrors(prev => ({ ...prev, phone: 'SĐT phải gồm 10-12 chữ số' }));
        } else {
            setErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setShippingInfo({ ...shippingInfo, email: value });
        if (value && !value.toLowerCase().endsWith('@gmail.com')) {
            setErrors(prev => ({ ...prev, email: 'Email phải là gmail (@gmail.com)' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    // Save updated profile to server
    const handleSaveInfo = async () => {
        // Validate before sending
        if (!validateShippingInfo()) {
            alert('Vui lòng kiểm tra lại thông tin trước khi lưu.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = {
                fullName: shippingInfo.fullName,
                email: shippingInfo.email,
                phoneNumber: shippingInfo.phone,
                address: shippingInfo.address
            };

            const response = await axios.put(
                'http://localhost:3000/api/users/profile',
                payload,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );

            alert('Thông tin của khách hàng đã cập nhật thành công');

            // Update localStorage user and local state if server returned updated user
            const updatedUser = response.data?.user || response.data?.user;
            if (updatedUser) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setShippingInfo({
                    fullName: updatedUser.fullName || '',
                    phone: updatedUser.phoneNumber || '',
                    email: updatedUser.email || '',
                    address: updatedUser.address || ''
                });
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Lỗi cập nhật profile:', error.response?.data || error);
            alert(error.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại!');
        }
    };

    // Nếu không có sản phẩm, quay về trang trước
    useEffect(() => {
        if (products.length === 0) {
            alert("Không có sản phẩm để thanh toán!");
            navigate(-1);
        }
    }, [products, navigate]);
    // Hàm sử lý nếu chưa có thông tin địa chỉ. 
    const validateShippingInfo = () => {
        let isValid = true;
        const newErrors = {
            fullName: '',
            phone: '',
            email: '',
            address: ''
        };

        // Validate full name: required and letters/spaces only
        if (!shippingInfo.fullName.trim()) {
            newErrors.fullName = 'Yêu cầu bạn nhập Họ và tên';
            isValid = false;
        } else if (!/^[\p{L}\s'.-]+$/u.test(shippingInfo.fullName.trim())) {
            newErrors.fullName = 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
            isValid = false;
        }

        // Validate phone: required and 10-12 digits
        if (!shippingInfo.phone.trim()) {
            newErrors.phone = 'Yêu cầu bạn nhập số điện thoại';
            isValid = false;
        } else if (!/^\d{10,12}$/.test(shippingInfo.phone.trim())) {
            newErrors.phone = 'Số điện thoại không hợp lệ (10-12 chữ số)';
            isValid = false;
        }

        // Validate email: required and must be a gmail address
        if (!shippingInfo.email.trim()) {
            newErrors.email = 'Yêu cầu bạn nhập email';
            isValid = false;
        } else if (!shippingInfo.email.trim().toLowerCase().endsWith('@gmail.com')) {
            newErrors.email = 'Email phải là gmail (@gmail.com)';
            isValid = false;
        }

        if (!shippingInfo.address.trim()) {
            newErrors.address = 'Yêu cầu bạn nhập địa chỉ nhận hàng';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Hàm này cho phép user có thể xóa bỏ sản phẩm trong trang thanh toán
    const handleRemove = (id) => {
        const newProducts = products.filter(p => p.productId !== id);
        setProducts(newProducts);
    };

    // Hàm tính tổng số tiền.
    const totalAmount = products.reduce((sum, item) => {
        const salePrice = item.price * (1 - (item.discount || 0)/100);
        return sum + (salePrice * item.quantity);
    }, 0);

    // Hàm xử lý đặt hàng
    const handleOrder = async () => {
        if (!validateShippingInfo()) {
            alert('Vui lòng điền đầy đủ thông tin nhận hàng!');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const orderData = {
                items: products.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    discount: item.discount // phần trăm giảm giá.
                })),
                // Gửi theo cấu trúc FLAT mà schema Order.js đang mong đợi
                fullName: shippingInfo.fullName,
                phone: shippingInfo.phone,
                email: shippingInfo.email,
                address: shippingInfo.address,
                totalAmount: totalAmount
            };

            const response = await axios.post(
                'http://localhost:3000/api/orders/create',   // ← SỬA: thêm /create
                orderData,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );

            alert('Đặt hàng thành công!');
            localStorage.removeItem('cart');
            navigate('/');   // hoặc trang cảm ơn

        } catch (error) {
            console.error('Lỗi đặt hàng:', error.response?.data || error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-header">
                <Link to={"/"}><img src="/src/assets/images/Logo_Hamory.png" alt="Logo" className="logo" style={{width: "120px", height: "70px", display: "block", marginTop: "0%", borderRadius: "3px"}} /></Link>
                <span className="divider">|</span>
                <span className="title">THANH TOÁN</span>
            </div>

            <table className="checkout-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Tổng tiền</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(item => (
                        <tr key={item.productId}>
                            <td className="prod-info" style={{display: 'flex'}}>
                                <img src={`http://localhost:3000${item.image}`} alt="" />
                                <div>
                                    <p>{item.name}</p>
                                    <small>{item.categoryName}</small>
                                </div>
                            </td>
                            <td className="price-cell">
                                {item.discount > 0 ? (
                                    <>
                                        <span className="original-price">
                                            {(item.price || 0).toLocaleString('vi-VN')} Đ
                                        </span>
                                        <br />
                                        <span className="sale-price">
                                            {Math.round((item.price || 0) * (1 - (item.discount || 0) / 100)).toLocaleString('vi-VN')} Đ
                                        </span>
                                    </>
                                ) : (
                                    <span className="current-price">
                                        {(item.price || 0).toLocaleString('vi-VN')} Đ
                                    </span>
                                )}
                            </td>
                            <td>x{item.quantity}</td>
                            <td className="subtotal">
                                {Math.round(
                                    (item.price || 0) * (1 - (item.discount || 0) / 100) * item.quantity
                                ).toLocaleString('vi-VN')} Đ
                            </td>
                            <td><button onClick={() => handleRemove(item.productId)}>Xóa</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="shipping-section">
                <h3>Thông Tin Nhận Hàng</h3>
                {user && user.address && !isEditing ? (
                    <div className="address-display">
                        <p><strong>Người nhận:</strong> {shippingInfo.fullName}</p>
                        <p><strong>SĐT:</strong> {shippingInfo.phone}</p>
                        <p><strong>Email:</strong> {shippingInfo.email}</p>
                        <p><strong>Địa chỉ:</strong> {shippingInfo.address}</p>
                        <button onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
                    </div>
                ) : (
                    <div className="address-form">
                        <input type="text" placeholder="Họ và tên" value={shippingInfo.fullName} onChange={handleNameChange} />
                        {errors.fullName && <small className="error">{errors.fullName}</small>}

                        <input
                            type="text"
                            placeholder="Số điện thoại"
                            inputMode="numeric"
                            value={shippingInfo.phone}
                            onChange={handlePhoneChange}
                        />
                        {errors.phone && <small className="error">{errors.phone}</small>}

                        <input type="email" placeholder="Email" value={shippingInfo.email} onChange={handleEmailChange} />
                        {errors.email && <small className="error">{errors.email}</small>}

                        <textarea placeholder="Địa chỉ nhận hàng" value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} />
                        {errors.address && <small className="error">{errors.address}</small>}

                        {user && <button onClick={handleSaveInfo}>Lưu thông tin</button>}
                    </div>
                )}
            </div>

            <div className="checkout-footer">
                <h2>Tổng tiền thanh toán: {totalAmount.toLocaleString()} Đ</h2>
                <button className="btn-order" onClick={handleOrder}>ĐẶT HÀNG</button>
            </div>
        </div>
    );
};

export default Checkout;