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

    const handleConfirmReceived = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/orders/received/${orderId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Xác nhận đã nhận hàng!");
            // Sau khi xác nhận thành công, chuyển đến trang đánh giá
            navigate(`/review/${orderId}`);
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
                                                <span className={`status ${order.status}`}>
                                                    {order.status === 'Approved' ? 'Đã duyệt' : 
                                                     order.status === 'Rejected' ? 'Từ chối' : 'Đang chờ duyệt'}
                                                </span>
                                            </td>
                                            <td>
                                                {order.status === 'Approved' && (
                                                    <button 
                                                        className="btn-received"
                                                        onClick={() => handleConfirmReceived(order._id)}
                                                    >
                                                        Nhận hàng
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;