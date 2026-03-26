import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle, FaCamera } from 'react-icons/fa';
import '../../css/profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [data, setData] = useState({ user: {}, orderHistory: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await axios.get('http://localhost:3000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            setFormData(res.data.user || {});
        } catch (error) {
            console.error('Lỗi khi lấy profile:', error.response?.data || error.message);
            // Nếu token không hợp lệ hoặc hết hạn -> chuyển tới login
            const status = error.response?.status;
            if (status === 400 || status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const form = new FormData();
        Object.keys(formData).forEach(key => form.append(key, formData[key]));
        if (selectedFile) form.append('avatar', selectedFile);

        try {
            await axios.put('http://localhost:3000/api/users/profile', form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert("Cập nhật thành công!");
            setIsModalOpen(false);
            fetchProfile();
        } catch (error) {
            alert("Lỗi cập nhật!");
        }
    };

    const { user, orderHistory } = data;

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Bên trái: Avatar */}
                <div className="profile-left">
                    <div className="avatar-wrapper">
                        {user.avatar ? (
                            <img src={`http://localhost:3000${user.avatar}`} alt="Avatar" />
                        ) : (
                            <FaUserCircle className="default-avatar" />
                        )}
                    </div>
                </div>

                {/* Bên phải: Thông tin */}
                <div className="profile-right">
                    <h2>Thông Tin Cá Nhân</h2>
                    <div className="info-grid">
                        <p><strong>Họ & Tên:</strong> {user.fullName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Role:</strong> <span className="role-badge">{user.role}</span></p>
                        <p><strong>Số điện thoại:</strong> {user.phoneNumber || 'Chưa cập nhật'}</p>
                        <p><strong>Địa chỉ:</strong> {user.address || 'Chưa cập nhật'}</p>
                    </div>
                    <button className="btn-edit" onClick={() => setIsModalOpen(true)}>Cập nhật thông tin</button>
                </div>
            </div>

            {/* Lịch sử mua hàng (Chỉ cho User) */}
            {user.role === 'user' && (
                <div className="order-history">
                    <h2>Lịch sử mua hàng</h2>
                    {orderHistory.length > 0 ? (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Sản phẩm</th>
                                    <th>Đơn giá</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                    <th>Ngày mua</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderHistory.map((order, index) => (
                                    <tr key={order._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {order.items.map(item => (
                                                <div key={item.productId} className="history-item">
                                                    <img src={`http://localhost:3000${item.image}`} width="30" />
                                                    <span>{item.name}</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td>{order.items[0]?.price.toLocaleString()} Đ</td>
                                        <td>{order.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                                        <td className="total">{order.totalAmount.toLocaleString()} Đ</td>
                                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="no-data">Không có lịch sử mua hàng.</p>
                    )}
                </div>
            )}

            {/* Modal Cập nhật */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Cập nhật thông tin</h2>
                        <form onSubmit={handleUpdate}>
                            <input type="text" placeholder="Username" value={formData.username} disabled />
                            <input type="password" placeholder="Mật khẩu mới" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            <input type="text" placeholder="Họ & Tên" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                            <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <input type="text" placeholder="Số điện thoại" value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                            <textarea placeholder="Địa chỉ" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            <input type="file" onChange={e => setSelectedFile(e.target.files[0])} />
                            <div className="modal-actions">
                                <button type="submit">Lưu thay đổi</button>
                                <button type="button" onClick={() => setIsModalOpen(false)}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;