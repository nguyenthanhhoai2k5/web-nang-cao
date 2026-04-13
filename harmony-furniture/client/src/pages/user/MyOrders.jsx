import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import '../../css/my-orders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3000/api/orders/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng");
        }
    };

    const handleConfirmReceived = async (orderId, productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/orders/received/${orderId}`, { productId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Cập nhật trạng thái ở phía client cho từng item (không chuyển trang)
            setOrders(prev => prev.map(o => {
                if (o._id === orderId) {
                    return {
                        ...o,
                        items: o.items.map(it => it.productId?.toString() === productId?.toString() ? { ...it, status: 'received' } : it)
                    };
                }
                return o;
            }));

            alert("Xác nhận đã nhận hàng!");
        } catch (error) {
            alert("Có lỗi xảy ra khi xác nhận.");
        }
    };

    // Lọc đơn hàng theo tên sản phẩm bên trong đơn đó
    const filteredOrders = orders.filter(order => 
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="my-orders-page">
            {/* Header */}
            <div className="orders-header">
                <div className="header-left">
                    <Link to="/"><img src="/src/assets/images/Logo_Hamory.png" alt="Logo" className="logo" /></Link>
                    <span className="divider">|</span>
                    <span className="title">ĐƠN HÀNG CỦA BẠN</span>
                </div>
                <div className="header-right">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Tìm tên sản phẩm..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch />
                    </div>
                </div>
            </div>

            {/* Danh sách đơn hàng */}
            <div className="orders-list">
                {filteredOrders.length === 0 ? (
                    <p className="empty-msg">Bạn chưa có đơn hàng nào.</p>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-date">
                                Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="content-cart">
                                <table className="order-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Giá</th>
                                            <th>Số lượng</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map(item => (
                                            <tr key={item.productId}>
                                                <td className="prod-col">
                                                    <img src={`http://localhost:3000${item.image}`} alt="" />  
                                                    <div className="info">
                                                        <p className="name">{item.name}</p>
                                                        <small>{item.category}</small>
                                                    </div>
                                                </td>
                                                <td>{item.price.toLocaleString()} Đ</td>
                                                <td>{item.quantity}</td>
                                                <td>{(item.price * item.quantity).toLocaleString()} Đ</td>
                                                <td>
                                                    <span className={`status ${item.status || order.status}`}>
                                                        {item.status === 'received' ? 'Đã nhận hàng' :
                                                         item.status === 'approved' ? 'Đã duyệt' :
                                                         item.status === 'rejected' ? 'Từ chối' :
                                                         item.status === 'cancelled' ? 'Đã hủy' :
                                                         order.status === 'approved' ? 'Đã duyệt' : 'Đang chờ duyệt'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {((item.status && item.status !== 'received') || order.status === 'approved') && item.status !== 'received' && (
                                                        <button 
                                                            className="btn-received"
                                                            onClick={() => handleConfirmReceived(order._id, item.productId)}
                                                        >
                                                            Nhận hàng
                                                        </button>
                                                    )}

                                                    {item.status === 'received' && (
                                                        item.isReviewed ? (
                                                            <button className="btn-reviewed" disabled>Đã đánh giá</button>
                                                        ) : (
                                                            <button
                                                                className="btn-review"
                                                                onClick={() => navigate(`/review/${order._id}?productId=${item.productId}`)}
                                                            >
                                                                Đánh giá sản phẩm
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;