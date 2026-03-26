import React, { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import '../css/auth.css';


const Register = () => {

  const [formData, setFormData] = useState({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert("Mật khẩu nhập lại không khớp!");
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      });
      alert(response.data.message);
      navigate('/login'); // Đăng ký xong chuyển sang Đăng nhập
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi đăng ký");
    }
  };
  return (
    <div className="auth-container">
      {/*  Nút trở về đến trang chủ*/}
      <Link to={'./src/pages/Home'} className="back-link"><FaArrowLeft /> Trở về</Link>
      <div className="auth-form register-form">
        <FaUserCircle className="user-icon" />
        <h2>Đăng ký tài khoản</h2>
        
        <div className="input-group">
          <label>Họ & tên</label>
          <input type="text" placeholder="Nhập vào họ và tên" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}/>
        </div>

        <div className="input-group">
          <label>Username</label>
          <input type="text" placeholder="Nhập vào username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}/>
        </div>

        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="Nhập vào email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}/>
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type="password" placeholder="Nhập vào password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}/>
        </div>

        <div className="input-group">
          <label>Nhập lại password</label>
          <input type="password" placeholder="Nhập lại password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}/>
        </div>

        <div className="checkbox-group">
          <input type="checkbox" id="confirm" />
          <label htmlFor="confirm">Xác nhận thông tin đăng ký</label>
        </div>

        <table className="btn-group">
          <tr>
            <td><button className="btn-register" onClick={handleRegister}>Đăng ký</button></td>
            <td><button className="btn-cance-register" onClick={() => navigate('/login')}>Hủy</button></td>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default Register;