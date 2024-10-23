import React from "react";
import "../styles/Header.css";

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <div className="header">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "Customer" ? "active" : ""}`}
          onClick={() => setActiveTab("Customer")}
        >
          Khách hàng
        </button>
        <button
          className={`tab ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          Hệ thống
        </button>
      </div>
    </div>
  );
};

export default Header;
