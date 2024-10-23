import React from "react";
import "../styles/SearchBar.css";
const SearchBar = ({ searchTerm, setSearchTerm, navigate }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Nhập tại đây..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        className="create-button"
        style={{ width: "10%" }}
        onClick={() => navigate("/create-account")}
      >
        Tạo tài khoản
      </button>
    </div>
  );
};

export default SearchBar;
