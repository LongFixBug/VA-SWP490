import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ activeTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className={`sidebar-item ${activeTab !== "" ? "active" : ""}`}>
        <span className="icon">👤</span> Quản lý tài khoản
      </div>
      <div className="sidebar-item" onClick={() => navigate("/dashboard")}>
        <span className="icon">📊</span> Thống kê
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        <span className="icon">🔓</span> Đăng xuất
      </div>
    </div>
  );
};

export default Sidebar;
