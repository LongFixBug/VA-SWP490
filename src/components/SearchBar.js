// src/components/SearchBar.js
import React from "react";
import "../styles/SearchBar.css";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Nhập từ khóa tìm kiếm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* <button
        className="create-button"
        onClick={() => navigate("/create-account")}
      >
        Thêm người dùng
      </button> */}
    </div>
  );
};

export default SearchBar;
