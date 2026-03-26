// Tạo file mới: src/pages/admin/InvoiceDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../../css/admin-invoice.css'; // Tái sử dụng CSS từ file trước (có thể chỉnh nếu cần)

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/invoices/${id}`);
                setInvoice(res.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải thông tin hóa đơn.');
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;
    if (!invoice) return <div>Không tìm thấy hóa đơn.</div>;

    // Tính toán subTotal và finalTotal (tương tự InvoiceForm)
    const subTotal = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = subTotal - (invoice.discount || 0);

    return (
        <div className="invoice-detail-modal-overlay"> {/* Lớp overlay để tạo cảm giác cửa sổ */}
            <div className="invoice-detail-modal">
                {/* Nút đóng cửa sổ */}
                <button className="close-btn" onClick={() => navigate('/admin/invoices')}>
                    <FaTimes /> Đóng
                </button>

                {/* Header: Logo + Tiêu đề + Mã/Ngày */}
                <div className="invoice-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link><img src="/src/assets/images/Logo_Hamory.png" alt="Logo" className="sidebar-logo-img" /></Link>
                    <h1 style={{ flex: 1 }}>HÓA ĐƠN BÁN HÀNG</h1>
                    <p style={{ textAlign: 'right' }}>
                        Mã hóa đơn: {invoice.invoiceNo} <br />
                        Ngày lập: {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                </div>
                <hr></hr>

                {/* Tên công ty */}
                <h2 style={{ textAlign: 'left', margin: '20px 0'}}>Công ty thiết kế nội thất Harmory</h2>

                <div className='content-contener'>
                    {/* Phần thông tin khách hàng & giao dịch */}
                    <h4>Thông tin khách hàng & Giao dịch</h4>
                    <hr></hr>
                    <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <p>Mã khách hàng: {invoice.customerID || 'N/A'}</p>
                        <p>Tên khách hàng: {invoice.customerName}</p>
                        <p>Số điện thoại: {invoice.phone || 'N/A'}</p>
                    </div>
                    <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <p>Email: {invoice.email || 'N/A'}</p>
                        <p>Địa chỉ: {invoice.address || 'N/A'}</p>
                    </div>
                    <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <p>Phương thức thanh toán: {invoice.paymentMethod}</p>
                        <p>Chiết khấu/Khuyến mại: {invoice.discount?.toLocaleString() || 0} VNĐ</p>
                    </div>
                    <p>Ghi chú: {invoice.notes || 'Không có'}</p>
                    <hr></hr>
                    {/* Danh sách sản phẩm */}
                    <h4>Danh sách sản phẩm</h4>
                    
                    <table className="invoice-detail-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã hàng (SKU)</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className='contents-tables'>
                            {invoice.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item._id || 'N/A'}</td> {/* Giả sử backend populate hoặc lưu sku */}
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price.toLocaleString()} VNĐ</td>
                                    <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot >
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'right' }}>Tổng tiền hàng:</td>
                                <td style={{color: '#7bb4ff'}}>{subTotal.toLocaleString()} VNĐ</td>
                            </tr>
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'right' }}>Chiết khấu:</td>
                                <td style={{color: '#7bb4ff'}}>{(invoice.discount || 0).toLocaleString()} VNĐ</td>
                            </tr>
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold' }}>Tổng thanh toán:</td>
                                <td style={{ fontWeight: 'bold', color: 'red' }}>{finalTotal.toLocaleString()} VNĐ</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Nút quay về (tùy chọn, nếu cần) */}
                <button className="btn-back" onClick={() => navigate('/admin/invoices')} style={{ marginTop: '20px' }}>
                    <FaArrowLeft /> Thoát
                </button>
            </div>
        </div>
    );
};

export default InvoiceDetail;