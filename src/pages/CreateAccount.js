import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateAccount.css"; // Tạo file CSS để tùy chỉnh giao diện

const CreateAccount = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Nam");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("User");
  const navigate = useNavigate();

  const handleCreateAccount = (e) => {
    e.preventDefault();
    // Xử lý logic tạo tài khoản ở đây
    // Hiện tại chỉ điều hướng lại về trang admin
    console.log({
      username,
      password,
      gender,
      phone,
      role,
    });
    navigate("/admin"); // Điều hướng quay lại trang Admin sau khi tạo xong
  };

  return (
    <div className="create-account-container">
      <h2>Tạo tài khoản mới</h2>
      <form onSubmit={handleCreateAccount}>
        <div className="input-group">
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            required
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
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="gender">Giới tính</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="phone">Số điện thoại</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="role">Vai trò</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Moderator">Moderator</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
        <div className="create-button2">
          <button type="submit">Tạo tài khoản</button>
        </div>
      </form>
    </div>
  );
};

export default CreateAccount;
