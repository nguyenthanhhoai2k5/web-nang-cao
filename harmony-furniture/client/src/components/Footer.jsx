import React from 'react';
import { FaYoutube, FaTiktok, FaFacebook, FaFacebookMessenger } from 'react-icons/fa';
import '../css/style.css'; // correct, no change needed
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-columns">
          {/* Cột 1 */}
          <div className="footer-col">
            <h3>Nội Thất Harmony</h3>
            <p>
              Nội Thất Harmony là thương hiệu đến từ Savimex với gần 50 năm kinh nghiệm 
              trong việc sản xuất và xuất khẩu nội thất đạt chuẩn quốc tế.
            </p>
          </div>

          {/* Cột 2 */}
          <div className="footer-col">
            <h3>THÔNG TIN</h3>
            <ul>
              <li>Chính Sách Bán Hàng</li>
              <li>Chính Sách Giao Hàng & Lắp Đặt</li>
              <li>Chính Sách Bảo Hành & Bảo Trì</li>
              <li>Chính Sách Đổi Trả</li>
              <li>Khách Hàng Thân Thiết</li>
              <li>Chính Sách Đối Tác Bán Hàng</li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div className="footer-col">
            <h3>Thông tin liên hệ</h3>
            <ul>
              <li><strong>Trụ sở chính:</strong> 69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh, TP. Hồ Chí Minh</li>
              <li><strong>Số điện thoại:</strong> 0912000000 hoặc 0900000000</li>
              <li><strong>Email:</strong> example@gmail.com</li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Mạng xã hội */}
        <div className="social-icons">
          <div className="social-item" style={{backgroundColor:'red', color:'white'}}><FaYoutube /><Link to="https://www.youtube.com/@Yoditim68"></Link></div>
          <div className="social-item" style={{backgroundColor:'black', color:'white'}}><FaTiktok /></div>
          <div className="social-item" style={{backgroundColor:'#1877F2', color:'white'}}><FaFacebook /></div>
          <div className="social-item" style={{backgroundColor:'#0084FF', color:'white'}}><FaFacebookMessenger /></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;