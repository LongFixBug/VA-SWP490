import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

// Định nghĩa Role ID
const ROLES = {
  ADMIN: 1,
  STAFF: 2,
  CUSTOMER: 3,
  MODERATOR: 4,
  NUTRITIONIST: 5,
};

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const roleId = localStorage.getItem("roleId"); // Lấy roleId từ localStorage

    console.log("Token trong localStorage:", token); // Log token
    console.log("RoleId trong localStorage:", roleId); // Log roleId

    if (token && roleId) {
      switch (
        parseInt(roleId) // Chuyển roleId từ string sang number
      ) {
        case ROLES.ADMIN:
          navigate("/admin");
          break;
        case ROLES.STAFF:
          navigate("/orders-management");
          break;
        case ROLES.CUSTOMER:
          navigate("/dashboard");
          break;
        case ROLES.MODERATOR:
          navigate("/articleModerate-management");
          break;
        case ROLES.NUTRITIONIST:
          navigate("/dishes-management");
          break;
        default:
          break;
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/login",
        {
          phoneNumber,
          password,
        }
      );

      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem("authToken", token); // Lưu JWT vào localStorage
        localStorage.setItem("roleId", user.roleId); // Lưu roleId vào localStorage

        console.log("Token sau khi đăng nhập:", token); // Log token
        console.log("RoleId sau khi đăng nhập:", user.roleId); // Log roleId

        // Điều hướng dựa trên roleId
        switch (user.roleId) {
          case ROLES.ADMIN:
            navigate("/admin");
            break;
          case ROLES.STAFF:
            navigate("/orders-management");
            break;
          case ROLES.CUSTOMER:
            navigate("/dashboard");
            break;
          case ROLES.MODERATOR:
            navigate("/articleModerate-management");
            break;
          case ROLES.NUTRITIONIST:
            navigate("/dishes-management");
            break;
          default:
            setError("Vai trò người dùng không xác định!");
            break;
        }
      } else {
        setError("Số điện thoại hoặc mật khẩu không đúng!");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng nhập</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="phoneNumber">Số điện thoại</label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại"
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
          <button type="submit" className="login-button">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
