import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import hook
import axios from 'axios';
import { FaPrint, FaEdit, FaTrash, FaSearch, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import '../../css/admin-invoice.css'; // Sử dụng file CSS riêng

const AdminInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState({ show: false, type: '', data: null });
    const navigate = useNavigate();

        // Hàm đi đến trang tạo mới
    const goToCreateInvoice = () => {
        navigate('/admin/invoices/add');
    };

    // Hàm đi đến trang sửa (truyền ID vào URL)
    const goToEditInvoice = (id) => {
        navigate(`/admin/invoices/edit/${id}`);
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/invoices');
            setInvoices(res.data || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách hóa đơn:", error);
        }
    };

    const handleAction = async () => {
        const { type, data } = showModal;
        if (type === 'delete') {
            try {
                await axios.delete(`http://localhost:3000/api/invoices/${data._id}`);
                alert("Đã xóa hóa đơn thành công!");
                fetchInvoices();
            } catch (error) {
                alert("Lỗi khi xóa hóa đơn");
            }
        } else if (type === 'print') {
            alert(`Đang chuẩn bị in hóa đơn #${data.invoiceNo}`);
        }
        setShowModal({ show: false, type: '', data: null });
    };

    const filteredInvoices = invoices.filter(inv => 
        inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // 
    return (
        <div className="invoice-page-container">
            <h1 className="invoice-page-title">Quản lý hóa đơn bán hàng</h1>
            <div className="incoice-page-content">
                <div className="invoice-toolbar">
                    <div className="invoice-search-box">
                        <FaSearch className="invoice-search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm mã hóa đơn hoặc tên khách hàng..." 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/*Nút tạo hóa đơn đến InvoiceForm*/}
                    <button className="invoice-btn-add" onClick={goToCreateInvoice}>
                        <FaPlus /> Tạo hóa đơn
                    </button>
                </div>

                <div className="invoice-table-wrapper">
                    <table className="invoice-main-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã hóa đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày tạo</th>
                                <th>Tổng tiền</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
    
                        <tbody>
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((inv, index) => (
                                    <tr 
                                        key={inv._id}
                                        className="invoice-row-clickable"  // Thêm class để style hover/pointer
                                        onClick={() => navigate(`/admin/invoices/${inv._id}`)}  // ← CLICK VÀO ĐÂY ĐỂ MỞ CHI TIẾT
                                        style={{ cursor: 'pointer' }}  // Con trỏ tay khi hover
                                    >
                                        <td>{index + 1}</td>
                                        <td className="invoice-no-cell">{inv.invoiceNo}</td>
                                        <td>{inv.customerName}</td>
                                        <td>{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="invoice-amount-cell">{inv.totalAmount?.toLocaleString()}đ</td>
                                        <td 
                                            className="invoice-actions-cell"
                                            onClick={(e) => e.stopPropagation()}  // ← QUAN TRỌNG: Ngăn click hàng lan ra các nút hành động
                                        >
                                            <button 
                                                className="invoice-action-btn edit" 
                                                title="Sửa"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Đảm bảo không mở detail khi click sửa
                                                    goToEditInvoice(inv._id);
                                                }}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="invoice-action-btn print" 
                                                title="In"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowModal({ show: true, type: 'print', data: inv });
                                                }}
                                            >
                                                <FaPrint />
                                            </button>
                                            <button 
                                                className="invoice-action-btn delete" 
                                                title="Xóa"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowModal({ show: true, type: 'delete', data: inv });
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="invoice-empty-row">
                                        <div className="invoice-empty-content">
                                            <p>Không có hóa đơn</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
        
                {/* Modal Xác nhận */}
                {showModal.show && (
                    <div className="invoice-modal-overlay">
                        <div className="invoice-modal-card">
                            <FaExclamationTriangle size={50} color={showModal.type === 'delete' ? "#ff4d4f" : "#000856"} />
                            <h3>Xác nhận thao tác</h3>
                            <p>
                                Bạn có muốn <strong>{showModal.type === 'delete' ? 'xóa' : 'in'}</strong> hóa đơn 
                                <span className="highlight"> {showModal.data.invoiceNo}</span> này không?
                            </p>
                            <div className="invoice-modal-footer">
                                <button className="invoice-modal-btn confirm" onClick={handleAction}>Đồng ý</button>
                                <button className="invoice-modal-btn cancel" onClick={() => setShowModal({ show: false, type: '', data: null })}>Hủy bỏ</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminInvoices;