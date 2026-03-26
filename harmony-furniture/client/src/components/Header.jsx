import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaShoppingCart, FaUserCircle, FaChevronDown, 
  FaUserEdit, FaBoxOpen, FaSignOutAlt 
} from 'react-icons/fa';
import '../css/style.css'; // correct, no change needed

const Header = () => {
  const navigate = useNavigate();
  // Lấy thông tin user từ localStorage khi component mount
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    window.location.reload(); // Refresh để xóa sạch trạng thái cũ
  };

  return (
    <header className="main-header" >
      <div className="header-top" style={{ backgroundColor: '#01837f', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="container header-flex">
          <div className="logo">
            <Link to="/"><img src="/src/assets/images/Logo_Hamory.png" alt="Logo Harmony" /></Link>
          </div>

          <div className="search-bar">
            <input type="text" placeholder="Tìm kiếm sản phẩm..." />
            <button><FaSearch /></button>
          </div>

          <div className="header-actions">
            <Link to="/cart" className="cart-btn" style={{ color: '#fff', fontSize: '16px' }}>
              <FaShoppingCart />
              <span>Giỏ hàng</span>
            </Link>

            <div className="account-wrapper">
              <div className="account-info">
                {/* Thay đổi Avatar dựa trên dữ liệu User */}
                {user && user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="user-avatar-img" />
                ) : (
                  <FaUserCircle className="avatar-default" style={{color: 'red'}} />
                )}
                
                <div className="account-text" >
                  {user ? (
                    <span className="auth-links" style={{color: "#fff", fontSize: "18px"}}>{user.fullName || user.username}</span>
                  ) : (
                    <div>
                      <Link to="/login" className="auth-links" style={{color: "#fff", fontSize: "14px"}}>Đăng nhập / </Link> <Link to="/register" className="auth-links" style={{color: "#fff", fontSize: "14px"}}> Đăng ký</Link>
                    </div>
                  )}
                  <span className="my-account" style={{color: "#fff", fontSize: "18px"}}>
                    Tài khoản của tôi <FaChevronDown size={10} />
                  </span>
                </div>
              </div>
              
              {/* Dropdown List */}
              <ul className="dropdown-list">
                <li>
                  <Link to="/profile">
                    <FaUserEdit className="dropdown-icon" /> Thông tin cá nhân
                  </Link>
                </li>
                <li>
                  <Link to="/my-orders">
                    <FaBoxOpen className="dropdown-icon" /> Đơn hàng của tôi
                  </Link>
                </li>
                <li className="logout-item" onClick={handleLogout}>
                   <FaSignOutAlt className="dropdown-icon" /> Đăng xuất
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Menu nav giữ nguyên... */}
      {/* Thanh Menu điều hướng */}
      <nav className="nav-menu">
        <div className="container" style={{fontSize: '22px'}}>
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/promotions">Khuyến mãi</Link></li>
            <li><Link to="/about-us">Về Harmony</Link></li>
            <li><Link to="/connect">Kết nối với chúng tôi</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;