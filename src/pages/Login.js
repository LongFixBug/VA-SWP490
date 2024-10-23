import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook để điều hướng

  // Hàm để kiểm tra đăng nhập
  const handleLogin = (e) => {
    e.preventDefault();

    // Tạm thời kiểm tra trực tiếp username và password mà không cần gọi API
    if (username === "admin" && password === "admin123") {
      // Nếu thông tin hợp lệ, điều hướng đến trang admin
      navigate("/admin");
    } else if (username === "staff" && password === "staff123") {
      // Nếu thông tin hợp lệ cho staff, điều hướng đến trang Dishes Management
      navigate("/dishes-management");
    } else {
      setError("Tên đăng nhập hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng nhập</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Hiển thị lỗi nếu có */}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </div>
          <button type="submit" className="login-button">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
