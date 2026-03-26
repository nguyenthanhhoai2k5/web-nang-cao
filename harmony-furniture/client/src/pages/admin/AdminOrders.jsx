import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaMinus, FaSearch, FaCheck } from 'react-icons/fa';
import '../../css/admin-order.css';
import RevenueTab from './RevenueTab';

const AdminOrders = () => {
    const [activeTab, setActiveTab] = useState('approve');
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, unviewed: 0, approved: 0, pending: 0 });
    const [expandedId, setExpandedId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingIds, setProcessingIds] = useState([]); // Thêm state để xử lý loading

    useEffect(() => { 
        fetchOrders(); 
    }, [filterStatus]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:3000/api/orders/admin/stats';
            
            if (filterStatus) {
                url += `?status=${filterStatus}`;
            }

            const res = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log("📦 Response từ /api/orders/admin/stats:", res.data);

            if (res.data.orders && res.data.stats) {
                setOrders(res.data.orders);
                setStats(res.data.stats);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("❌ Lỗi lấy đơn hàng:", error.response?.data || error.message);
            console.log("First order items:", res.data.orders[0]?.items); // Kiểm tra dữ liệu items
            setOrders([]);
        }
    };

    const handleStatus = async (id, status) => {
        const action = status === 'approved' ? 'duyệt' :    
                      status === 'rejected' ? 'từ chối' : 'hủy';
        
        if (!window.confirm(`Xác nhận ${action} đơn hàng này?`)) return;

        // Thêm ID vào danh sách đang xử lý để hiển thị loading
        setProcessingIds(prev => [...prev, id]);

        try {
            const token = localStorage.getItem('token');
            
            console.log(`Gửi PATCH: /api/orders/status/${id} với status=${status}`);
            
            const res = await axios.patch(
                `http://localhost:3000/api/orders/status/${id}`, 
                { status },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            console.log("Cập nhật thành công:", res.data);
            
            // Xử lý theo từng loại status
            if (status === 'rejected') {
                // Nếu là từ chối - Xóa đơn hàng khỏi danh sách
                setOrders(prevOrders => prevOrders.filter(order => order._id !== id));
                // Cập nhật stats
                setStats(prevStats => ({
                    ...prevStats,
                    total: prevStats.total - 1,
                    pending: prevStats.pending - 1
                }));
                alert("Đã từ chối và xóa đơn hàng khỏi danh sách!");
            } else if (status === 'approved') {
                // Nếu là duyệt - Cập nhật trạng thái trong danh sách
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === id 
                            ? { ...order, status: 'approved' } 
                            : order
                    )
                );
                // Cập nhật stats
                setStats(prevStats => ({
                    ...prevStats,
                    approved: prevStats.approved + 1,
                    pending: prevStats.pending - 1
                }));
                alert("Đã duyệt đơn hàng thành công!");
            } else if (status === 'cancelled') {
                // Nếu là hủy - Cập nhật trạng thái trong danh sách
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === id 
                            ? { ...order, status: 'cancelled' } 
                            : order
                    )
                );
                // Cập nhật stats
                setStats(prevStats => ({
                    ...prevStats,
                    approved: prevStats.approved - 1,
                    pending: prevStats.pending + 1 // Hoặc tùy logic của bạn
                }));
                alert("Đã hủy đơn hàng!");
            }
            
            // Nếu filter đang active, có thể cần fetch lại để đảm bảo đồng bộ
            if (filterStatus) {
                fetchOrders();
            }
            
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        } finally {
            // Xóa ID khỏi danh sách đang xử lý
            setProcessingIds(prev => prev.filter(pid => pid !== id));
        }
    };

    // Hàm kiểm tra đang xử lý
    const isProcessing = (id) => processingIds.includes(id);

    return (
        <div className="admin-orders-page">
            <div className="tab-navigation">
                <button 
                    className={activeTab === 'approve' ? 'active' : ''} 
                    onClick={() => setActiveTab('approve')}
                >
                    Duyệt đơn hàng
                </button>
                <button 
                    className={activeTab === 'revenue' ? 'active' : ''} 
                    onClick={() => setActiveTab('revenue')}
                >
                    Xem doanh số
                </button>
            </div>
            <hr />
            <h1>Duyệt các đơn hàng</h1>

            {activeTab === 'approve' ? (
                <div className="order-container" style={{ width: '80%', margin: '0 auto' }}>
                    <h1>Tổng quan</h1>
                    
                    <div className="summary-boxes">
                        <div className={`summary-card total ${filterStatus === '' ? 'active' : ''}`} onClick={() => setFilterStatus('')}>
                            <h4>Tổng đơn hàng</h4>
                            <p>{stats.total}</p>
                        </div>
                        <div className={`summary-card unviewed ${filterStatus === 'unviewed' ? 'active' : ''}`} onClick={() => setFilterStatus('unviewed')}>
                            <h4>Chưa xem</h4>
                            <p>{stats.unviewed}</p>
                        </div>
                        <div className={`summary-card approved ${filterStatus === 'approved' ? 'active' : ''}`} onClick={() => setFilterStatus('approved')}>
                            <h4>Đã duyệt</h4>
                            <p>{stats.approved}</p>
                        </div>
                        <div className={`summary-card pending ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
                            <h4>Chưa duyệt</h4>
                            <p>{stats.pending}</p>
                        </div>
                    </div>

                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên khách hàng..." 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="order-list">
                        {orders.filter(o => o.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((order, index) => (
                            <div key={order._id} className={`order-box ${order.status === 'rejected' ? 'removing' : ''}`}>
                                <div className="order-header" onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}>
                                    <span className="stt">#{index + 1}</span>
                                    <span className="name">{order.fullName}</span>
                                    <span className={`status-badge ${order.status}`}>
                                        {order.status === 'approved' ? '✓ Đã duyệt' : 
                                         order.status === 'rejected' ? '✗ Đã từ chối' : 
                                         order.status === 'cancelled' ? '✗ Đã hủy' : '⏳ Chờ duyệt'}
                                    </span>
                                    <div className='icon-open-close'>
                                        {expandedId === order._id ? <FaMinus /> : <FaPlus />}
                                    </div>
                                </div>

                                {expandedId === order._id && (
                                    <div className="order-detail">
                                        <div className="customer-info">
                                            <p><strong>Người nhận:</strong> {order.fullName}</p>
                                            <p><strong>Số điện thoại:</strong> {order.phone}</p>
                                            <p><strong>Email:</strong> {order.email}</p>
                                            <p><strong>Địa chỉ:</strong> {order.address}</p>
                                        </div>
                          
                                        <table className="order-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Ảnh</th>
                                                    <th>Tên sản phẩm</th>
                                                    <th>Số lượng</th>
                                                    <th>Đơn giá</th>
                                                    <th>Giảm giá</th>
                                                    <th>Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item, idx) => {
                                                    // Lấy thông tin từ item đã lưu trong order
                                                    const originalPrice = item.originalPrice || item.price || 0;
                                                    const discount = item.discount || 0;
                                                    const discountedPrice = item.price || originalPrice;
                                                    const totalItemPrice = discountedPrice * item.quantity;
                                                    
                                                    return (
                                                        <tr key={idx}>
                                                            <td>
                                                                <img 
                                                                    src={`http://localhost:3000${item.image || item.productId?.images?.[0] || '/default-product.jpg'}`} 
                                                                    alt={item.name || 'Sản phẩm'} 
                                                                    style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '6px' }}
                                                                    onError={(e) => { e.target.src = '/default-product.jpg'; }}
                                                                />
                                                            </td>
                                                            <td>{item.name || 'Tên sản phẩm'}</td>
                                                            <td>x{item.quantity}</td>
                                                            <td>
                                                                {discount > 0 ? (
                                                                    <>
                                                                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                                                            {originalPrice.toLocaleString()}đ
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span>{originalPrice.toLocaleString()}đ</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {discount > 0 ? (
                                                                    <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                                                        -{discount}%
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#999' }}>0%</span>
                                                                )}
                                                            </td>
                                                            <td style={{ fontWeight: 'bold', color: '#28a745' }}>
                                                                {totalItemPrice.toLocaleString()}đ
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                        <div className="total-price-row">
                                            <strong style={{color: "black"}}>Tổng tiền:</strong> 
                                            <span style={{ color: '#28a745', fontSize: '1.2em', marginLeft: '10px' }}>
                                                {order.totalAmount?.toLocaleString()}đ
                                            </span>
                                        </div>
                                        <div className="order-actions">
                                            {order.status === 'approved' ? (
                                                <>
                                                    <button 
                                                        className="btn-approved" 
                                                        disabled
                                                    >
                                                        <FaCheck /> Đã duyệt
                                                    </button>
                                                    <button 
                                                        className="btn-cancel-order" 
                                                        onClick={() => handleStatus(order._id, 'cancelled')}
                                                        disabled={isProcessing(order._id)}
                                                    >
                                                        {isProcessing(order._id) ? 'Đang xử lý...' : 'Hủy hàng'}
                                                    </button>
                                                </>
                                            ) : order.status === 'rejected' ? (
                                                <button 
                                                    className="btn-rejected" 
                                                    disabled
                                                >
                                                    Đã từ chối
                                                </button>
                                            ) : (
                                                <>
                                                    <button 
                                                        className="btn-approve" 
                                                        onClick={() => handleStatus(order._id, 'approved')}
                                                        disabled={isProcessing(order._id)}
                                                    >
                                                        {isProcessing(order._id) ? 'Đang xử lý...' : 'Duyệt sản phẩm'}
                                                    </button>
                                                    <button 
                                                        className="btn-reject" 
                                                        onClick={() => handleStatus(order._id, 'rejected')}
                                                        disabled={isProcessing(order._id)}
                                                    >
                                                        {isProcessing(order._id) ? 'Đang xử lý...' : 'Từ chối'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <p style={{textAlign: 'center', marginTop: '20px', padding: '20px', color: '#666'}}>
                                Không có đơn hàng nào.
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <RevenueTab />
            )}
        </div>
    );
};

export default AdminOrders;