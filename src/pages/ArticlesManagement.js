import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ArticlesManagement.css";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

// Dữ liệu giả cho các bài viết
const mockArticles = [
  {
    articleId: 1,
    title: "Lợi ích của ăn chay đối với sức khỏe",
    author: "User 1",
    status: "accepted",
    moderateDate: "2024-10-01",
  },
  {
    articleId: 2,
    title: "Các món ăn chay đơn giản dễ làm tại nhà",
    author: "User 2",
    status: "pending",
    moderateDate: null,
  },
  // Thêm dữ liệu giả khác nếu cần
];
const itemsPerPage = 2;

const ArticlesManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredArticles = mockArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const indexOfLastArticle = currentPage * itemsPerPage;
  const indexOfFirstArticle = indexOfLastArticle - itemsPerPage;
  const currentArticlesPage = filteredArticles.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="Articles-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className="create-button"
            onClick={() => navigate("/create-article")}
          >
            Create
          </button>
        </div>
        <table className="articles-table">
          <thead>
            <tr>
              <th></th>
              <th>Article ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Moderate Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {currentArticlesPage.map((article) => (
              <tr key={article.articleId}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{article.articleId}</td>
                <td>{article.title}</td>
                <td>{article.author}</td>
                <td>{article.status}</td>
                <td>{article.moderateDate ? article.moderateDate : "N/A"}</td>
                <td>
                  <button
                    className="detail-button"
                    onClick={() =>
                      navigate(`/article-detail/${article.articleId}`)
                    }
                  >
                    Xem thêm
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
};

// Sidebar component
const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => navigate("/dishes-management")}
      >
        Quản lý món ăn
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/nutritionCriteria-management")}
      >
        Quản lí thể trạng
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/Ingredient-management")}
      >
        Quản lí nguyên liệu
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/articles-management")}
      >
        Quản lí bài viết
      </div>

      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default ArticlesManagement;
