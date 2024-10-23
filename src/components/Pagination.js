import React from "react";
import "../styles/Pagination.css";
const Pagination = ({ currentPage, totalPages, onPrevPage, onNextPage }) => {
  return (
    <div className="pagination">
      <button onClick={onPrevPage} disabled={currentPage === 1}>
        Trang trước
      </button>
      <span>
        Trang {currentPage} / {totalPages}
      </span>
      <button onClick={onNextPage} disabled={currentPage === totalPages}>
        Trang sau
      </button>
    </div>
  );
};

export default Pagination;
