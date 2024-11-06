import React, { useState } from "react";
import "../styles/ModeratedArticles.css";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";

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
    status: "rejected",
    moderateDate: "2024-10-02",
  },
];

const itemsPerPage = 5;

const ModeratedArticles = () => {
  const [activeTab, setActiveTab] = useState("accepted");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const filteredArticles = mockArticles.filter(
    (article) =>
      article.status === activeTab &&
      (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="moderated-articles-container">
      <Sidebar />
      <div className="content">
        <div className="moderated-tabs">
          <button
            className={`moderated-tab ${
              activeTab === "accepted" ? "active" : ""
            }`}
            onClick={() => setActiveTab("accepted")}
          >
            Đã Duyệt
          </button>
          <button
            className={`moderated-tab ${
              activeTab === "rejected" ? "active" : ""
            }`}
            onClick={() => setActiveTab("rejected")}
          >
            Đã Từ Chối
          </button>
        </div>
        <div className="moderated-header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <table className="moderated-articles-table">
          <thead>
            <tr>
              <th>Article ID</th>
              <th>Tiêu đề</th>
              <th>Tác giả</th>
              <th>Trạng thái</th>
              <th>Ngày duyệt</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {currentArticlesPage.map((article) => (
              <tr key={article.articleId}>
                <td>{article.articleId}</td>
                <td>{article.title}</td>
                <td>{article.author}</td>
                <td>{article.status}</td>
                <td>{article.moderateDate || "N/A"}</td>
                <td>
                  <button
                    className="detail-btn"
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

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => navigate("/articleModerate-management")}
      >
        Quản lý phê duyệt bài viết
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/moderated-articles")}
      >
        Bài viết đã được xử lí
      </div>

      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default ModeratedArticles;
