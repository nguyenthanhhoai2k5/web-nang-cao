import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    FaPlus, FaSearch, FaTrash, FaTimes, FaCheck, FaArrowLeft, FaFileInvoice 
} from 'react-icons/fa';
import '../../css/admin-invoice.css';

const InvoiceForm = ({ isEdit = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE QUẢN LÝ THÔNG TIN ---
    const [invoiceNo, setInvoiceNo] = useState('Tự động tạo...');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('vi-VN'));
    
    const [customerName, setCustomerName] = useState('');
    const [customerID, setCustomerID] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');
    
    const [selectedItems, setSelectedItems] = useState([]);

    // --- STATE MODAL ---
    const [showProductModal, setShowProductModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showQtyModal, setShowQtyModal] = useState(false);
    const [tempProduct, setTempProduct] = useState(null);
    const [tempQty, setTempQty] = useState(1);

    // Function sửa sản phẩm
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Sửa phần lấy sản phẩm
                const prodRes = await axios.get('http://localhost:3000/api/products');
                console.log("API Response:", prodRes.data); // Debug: xem cấu trúc dữ liệu
                
                // Kiểm tra và lấy đúng mảng products
                if (prodRes.data && Array.isArray(prodRes.data)) {
                    // Trường hợp API trả về mảng trực tiếp
                    setProducts(prodRes.data);
                } else if (prodRes.data && prodRes.data.products && Array.isArray(prodRes.data.products)) {
                    // Trường hợp API trả về object có thuộc tính products (như controller của bạn)
                    setProducts(prodRes.data.products);
                } else {
                    console.error("Dữ liệu sản phẩm không đúng định dạng:", prodRes.data);
                    setProducts([]);
                }

                // Phần còn lại giữ nguyên
                if (isEdit && id) {
                    const invoiceRes = await axios.get(`http://localhost:3000/api/invoices/${id}`);
                    const inv = invoiceRes.data;
                    
                    setInvoiceNo(inv.invoiceNo || 'Tự động tạo...');
                    setInvoiceDate(new Date(inv.createdAt).toLocaleDateString('vi-VN'));
                    setCustomerName(inv.customerName || '');
                    setCustomerID(inv.customerID || '');
                    setPhone(inv.phone || '');
                    setEmail(inv.email || '');
                    setAddress(inv.address || '');
                    setPaymentMethod(inv.paymentMethod || 'Cash');
                    setDiscount(inv.discount || 0);
                    setNotes(inv.notes || '');

                    const loadedItems = inv.items.map(item => ({
                        productId: item.productId?._id || item.productId,
                        sku: item.productId?.sku || item._id || 'N/A',
                        name: item.name,
                        price: Number(item.price),
                        quantity: Number(item.quantity),
                        total: Number(item.price) * Number(item.quantity)
                    }));
                    setSelectedItems(loadedItems);
                } else {
                    const invRes = await axios.get('http://localhost:3000/api/invoices');
                    setCustomerID(`KH${(invRes.data.length + 1).toString().padStart(3, '0')}`);
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                alert("Không thể tải thông tin. Vui lòng thử lại.");
            }
        };
        fetchData();
    }, [isEdit, id]);

    // --- LOGIC TÍNH TOÁN Số tiền trừ háo đơn xuất - tông hóa đơn---
    const subTotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
    const finalTotal = subTotal - discount;

    const handleSelectProduct = (product) => {
        setTempProduct(product);
        setTempQty(1);
        setShowQtyModal(true);
    };

    const confirmAddProduct = () => {
        const newItem = {
            productId: tempProduct._id,
            sku: tempProduct._id || 'N/A',
            name: tempProduct.name,
            price: tempProduct.price,
            quantity: Number(tempQty),
            total: tempProduct.price * tempQty
        };
        setSelectedItems([...selectedItems, newItem]);
        setShowQtyModal(false);
        setShowProductModal(false);
    };

    const removeItem = (index) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };
    /// handleSubmit function
    // Trong InvoiceForm.jsx, tìm và thay thế hàm handleSubmit:
    const handleSubmit = async () => {
        if (!customerName || selectedItems.length === 0) {
            alert("Vui lòng điền họ tên khách hàng và chọn ít nhất 1 sản phẩm!");
            return;
        }

        const invoiceData = {
            customerName,
            customerID,
            phone,
            email,          // ← THÊM
            address,        // ← THÊM
            paymentMethod,           // giờ đã là 'Cash' | 'Transfer' | 'Credit Card'
            discount: Number(discount) || 0,
            notes,
            items: selectedItems.map(item => ({
                productId: item.productId,
                name: item.name,
                quantity: Number(item.quantity),
                price: Number(item.price),
                sku: item._id 
                // Nếu backend cần sku thì thêm: sku: item.sku
            })),
            totalAmount: Number(subTotal - discount)
        };

        try {
            let res;
            if (isEdit && id) {
                // UPDATE
                res = await axios.put(`http://localhost:3000/api/invoices/${id}`, invoiceData);
                if (res.status === 200) {
                    alert("Cập nhật hóa đơn thành công!");
                    navigate('/admin/invoices');
                }
            } else {
                // CREATE
                res = await axios.post('http://localhost:3000/api/invoices', invoiceData);
                if (res.status === 201) {
                    alert("Tạo hóa đơn thành công!");
                    navigate('/admin/invoices');
                }
            }
        } catch (error) {
            console.error("Lỗi lưu hóa đơn:", error.response?.data);
            alert("Lỗi: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    return (
        <div className="invoice-form-wrapper">
            {/* Nút trở về trên cùng */}
            <div className="form-top-nav">
                <button className="btn-back" onClick={() => navigate('/admin/invoices')}>
                    <FaArrowLeft /> Trở về danh sách
                </button>
                <h1>{isEdit ? 'Chỉnh Sửa Hóa Đơn' : 'Tạo Hóa Đơn Bán Hàng'}</h1>
            </div>

            <div className="invoice-grid">
                
                {/* KHỐI 1: THÔNG TIN HÓA ĐƠN */}
                <div className="invoice-section card-info">
                    <div className="section-header">
                        <div className="section-title"><FaFileInvoice /> Thông tin hóa đơn</div>
                    </div>
                    <hr></hr>
                    <div className="input-row">
                        <div className="input-group-2">
                            <label>Mã hóa đơn *</label>
                            <input type="text" value={invoiceNo} disabled className="input-disabled" />
                        </div>
                        <div className="input-group-2">
                            <label>Ngày lập hóa đơn *</label>
                            <input type="text" value={invoiceDate} disabled className="input-disabled" />
                        </div>
                    </div>
                </div>

                {/* KHỐI 2: THÔNG TIN HÀNG HÓA */}
                <div className="invoice-section card-items">
                    <div className="section-header">
                        <div className="section-title">Thông tin hàng hóa</div>
                        <button className="btn-add-item" onClick={() => setShowProductModal(true)}>
                            <FaPlus /> Thêm sản phẩm
                        </button>
                    </div>
                    <hr></hr>

                    
                    <div className="table-container">
                        <table className="form-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>STT</th>
                                    <th>Mã hàng (SKU)</th>
                                    <th>Tên sản phẩm</th>
                                    <th style={{ width: '120px' }}>Số lượng</th>
                                    <th style={{ width: '140px' }}>Đơn giá</th>
                                    <th style={{ width: '140px' }}>Thành tiền</th>
                                    <th style={{ width: '80px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.length > 0 ? (
                                    selectedItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td>{item.sku || 'N/A'}</td>
                                            <td>{item.name}</td>
                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>{item.price.toLocaleString('vi-VN')} đ</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                                {item.total.toLocaleString('vi-VN')} đ
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    className="btn-remove-item" 
                                                    title="Xóa sản phẩm"
                                                    onClick={() => removeItem(idx)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center empty-row">
                                            Chưa có sản phẩm nào được chọn
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="sub-total-display">
                        <b>Tổng tiền hàng: <span style={{color: 'red'}}>{subTotal.toLocaleString()}VNĐ</span></b>
                    </div>
                </div>

                {/* KHỐI 3: THÔNG TIN KHÁCH HÀNG & GIAO DỊCH */}
                <div className="invoice-section card-customer">
                    <div className="section-header">
                        <div className="section-title">Thông tin khách hàng & Giao dịch</div>
                    </div>
                    <hr></hr>
                    <div className="input-grid-3">  {/* hoặc tạo grid mới nếu muốn */}
                        {/*Mã khách hàng , Tên khách hàng, Số điện thoại */}
                        <div className="input-group-3">
                            <label>Mã khách hàng</label>
                            <input type="text" value={customerID} onChange={(e) => setCustomerID(e.target.value)} placeholder="KH001..." />
                        </div>
                        <div className="input-group-3">
                            <label>Họ tên khách hàng *</label>
                            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                        </div>
                        <div className="input-group-3">
                            <label>Số điện thoại</label>
                            <input 
                                type="tel" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                placeholder="0123456789" 
                            />
                        </div>
                    </div>

                    {/* Thêm hàng mới cho Email & Địa chỉ */}
                    <div className="input-grid-2">
                        <div className="input-group-2">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="khachhang@example.com" 
                            />
                        </div>
                        <div className="input-group-2">
                            <label>Địa chỉ</label>
                            <input 
                                type="text" 
                                value={address} 
                                onChange={(e) => setAddress(e.target.value)} 
                                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" 
                            />
                        </div>
                    </div>

                    <div className="input-grid-2">
                        <div className="input-group">
                            <label>Phương thức thanh toán *</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="Cash">Tiền mặt</option>
                                <option value="Transfer">Chuyển khoản</option>
                                <option value="Credit Card">Thẻ tín dụng</option>
                            </select>
                        </div>
                        <div className="input-group-2">
                            <label>Chiết khấu/Khuyến mại (VNĐ)</label>
                            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Ghi chú</label>
                        <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                    </div>

                    <div className="final-summary">
                        <div className="summary-row">
                            <b>Tổng cộng thanh toán: <p className="final-price" style={{fontSize: '30px'}}>{finalTotal.toLocaleString()} VNĐ</p></b>
                        </div>
                        <div className="form-footer-btns">
                            <button className="btn-cancel-form" onClick={() => navigate('/admin/invoices')}>Hủy</button>
                            <button className="btn-submit-form" onClick={handleSubmit}>
                                {/* Thay thế phần text cứng bằng ternary operator */}
                                {isEdit ? 'Cập nhật hóa đơn' : 'Tạo hóa đơn'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DANH SÁCH SẢN PHẨM (Giữ nguyên logic modal cũ) phần này đảm nhân thêm sản phẩm trong kho vào hóa đơn */}
            {/* MODAL DANH SÁCH SẢN PHẨM */}
            {showProductModal && (
                <div className="invoice-modal-overlay">
                    <div className="invoice-modal-large">
                        <div className="modal-header">
                            <h3>Chọn sản phẩm từ kho</h3>
                            <FaTimes className="close-icon" onClick={() => setShowProductModal(false)} />
                        </div>
                        <div className="modal-search-bar">
                            <FaSearch />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm theo tên hoặc mã..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="modal-body">
                            {products.length === 0 ? (
                                <div style={{textAlign: 'center', padding: '30px'}}>
                                    <p>Không có sản phẩm nào</p>
                                    <button 
                                        onClick={() => {
                                            // Thử gọi lại API
                                            axios.get('http://localhost:3000/api/products')
                                                .then(res => {
                                                    if (res.data.products) setProducts(res.data.products);
                                                    else if (Array.isArray(res.data)) setProducts(res.data);
                                                })
                                                .catch(err => console.error(err));
                                        }}
                                    >
                                        Tải lại
                                    </button>
                                </div>
                            ) : (
                                <table className="modal-table">
                                    <thead>
                                        <tr>
                                            <th>Ảnh</th>
                                            <th>SKU</th>
                                            <th>Tên sản phẩm</th>
                                            <th>Giá bán</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products
                                            .filter(p => p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(p => (
                                                <tr key={p._id} onClick={() => handleSelectProduct(p)} style={{cursor: 'pointer'}}>
                                                    <td>
                                                        {p.images && p.images.length > 0 ? (
                                                            <img 
                                                                src={p.images[0].startsWith('http') ? p.images[0] : `http://localhost:3000${p.images[0]}`} 
                                                                alt={p.name} 
                                                                width="50" 
                                                                height="50"
                                                                style={{objectFit: 'cover'}}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/50';
                                                                }}
                                                            />
                                                        ) : (
                                                            <img src="https://via.placeholder.com/50" alt="No image" width="50" height="50" />
                                                        )}
                                                    </td>
                                                    <td>{p._id ? p._id.slice(-6) : 'N/A'}</td>
                                                    <td>{p.name}</td>
                                                    <td>{p.price ? p.price.toLocaleString() + 'đ' : '0đ'}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NHẬP SỐ LƯỢNG */}
            {showQtyModal && tempProduct && (
                <div className="invoice-modal-overlay">
                    <div className="invoice-modal-small">
                        <h4>Nhập số lượng cho: {tempProduct.name}</h4>
                        <p>Giá: {tempProduct.price?.toLocaleString()}đ</p>
                        <input 
                            type="number" 
                            value={tempQty} 
                            min="1" 
                            max={tempProduct.stock || 999}
                            onChange={(e) => setTempQty(parseInt(e.target.value) || 1)} 
                            autoFocus 
                        />
                        <div className="modal-actions">
                            <button className="btn-confirm" onClick={confirmAddProduct}>Xác nhận</button>
                            <button className="btn-cancel" onClick={() => setShowQtyModal(false)}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceForm;