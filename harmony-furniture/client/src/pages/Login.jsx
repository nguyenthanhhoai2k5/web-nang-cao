import React, { useState } from 'react';
import { FaUserCircle, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Gọi API đăng nhập
import '../css/auth.css';

const Login = () => {
  //Khai báo các state để lưu trữ dữ liệu từ form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password
      });

      // Lưu token và thông tin user vào trình duyệt
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      alert("Đăng nhập thành công!");
      
      // Nếu là Admin thì chuyển hướng vào trang quản trị, ngược lại về trang chủ
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
      window.location.reload(); // Reload để Header cập nhật trạng thái mới
    } catch (error) {
    // Log lỗi chi tiết ra console để kiểm tra
      console.error("Chi tiết lỗi server:", error.response?.data); 
      alert(error.response?.data?.message || "Lỗi máy chủ khi đăng nhập");
      alert(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="auth-container">
      <Link to={"/"} className="back-link"><FaArrowLeft /> Trở về</Link>
      <div className="auth-form login-form">
        <FaUserCircle className="user-icon" />
        <h2>Đăng nhập tài khoản</h2>
        
        <div className="input-group">
          <label>Username</label>
          <input type="text" placeholder="Nhập vào username ..." value={username} onChange={e => setUsername(e.target.value)}/>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input 
              type={showPassword ? "text" : "password" }
              placeholder="Nhập vào password ..." 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
        </div>

        <div className="checkbox-group">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Remember me</label>
        </div>

        <button className="btn btn-login" onClick={handleLogin}>Đăng nhập</button>
        <p className="auth-footer-text">Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </div>
    </div>
  );
};

export default Login;