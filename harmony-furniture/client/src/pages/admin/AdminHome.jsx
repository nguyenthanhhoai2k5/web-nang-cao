import React from 'react';
import '../../css/fireworks.css';

const AdminHome = () => {
  let admin = null;
  try {
    admin = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    admin = null;
  }

  return (
    <div className="admin-home-container">
      {/* Hiệu ứng pháo hoa */}
      <div className="pyro">
        <div className="before"></div>
        <div className="after"></div>
      </div>
      {/* Hiển thị fullName thay vì username vì server chỉ trả về fullName */}
      <h1 className="welcome-text">
        Welcome {admin?.fullName || admin?.username || 'Admin'}
      </h1>
    </div>
  );
};

export default AdminHome;
