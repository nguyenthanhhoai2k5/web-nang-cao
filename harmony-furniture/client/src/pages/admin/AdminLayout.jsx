import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { FaUserShield, FaChevronDown, FaHome, FaBox, FaBars, FaTimes, FaSignOutAlt, FaUserEdit, FaCartPlus, FaClipboardList, FaHeadset, FaUsersCog } from 'react-icons/fa';
import '../../css/admin.css';
import '../../css/fireworks.css';
import Logo_Ig from '../../assets/images/Logo_Hamory.png';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  // Lấy thông tin admin từ localStorage (đồng nhất với AdminHome)
  let admin = null;
  try {
    admin = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    admin = null;
  }

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <h1>Quản Trị Website Nội Thất Harmony</h1>
        <div className="admin-account" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <FaUserShield className="admin-avatar-icon" />
          <h4 className="admin-name">{admin?.fullName || admin?.username}</h4>
          {isDropdownOpen && ( 
            <ul className="admin-dropdown">
              <li><FaUserEdit /> Hồ sơ</li>
              <li onClick={() => navigate('/login')}><FaSignOutAlt /> Thoát</li>
            </ul>
          )}
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar có chức năng toggle, cho nút đóng/mở ở trên logo*/}
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
            <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}> 
              {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          <div className="sidebar-header">
            {isSidebarOpen && <Link to="/admin/dashboard"><img src="/src/assets/images/Logo_Hamory.png" alt="Logo" className="sidebar-logo-img" /></Link>}
          </div>
          <nav className="sidebar-nav">
            <Link to="/admin/dashboard"><FaHome /> Trang chủ</Link>
            <Link to="/admin/products"><FaBox /> Quản lý sản phẩm</Link>
            {/* Đặt hàng đến AdminOrders.jsx*/}
            <Link to="/admin/orders"><FaCartPlus />Quản lý đặt hàng</Link>
            <Link to="/admin/invoices"><FaClipboardList /> Quản lý hóa đơn</Link>
            <Link to="/admin/users"><FaUsersCog /> Quản lý tài khoản</Link>
          </nav>
        </aside>

        <main className={`admin-content ${isSidebarOpen ? '' : 'full-width'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;