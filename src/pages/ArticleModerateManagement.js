import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ArticleModerateManagement.css";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

const mockArticles = [
  {
    articleId: 1,
    title: "Lợi ích của ăn chay đối với sức khỏe",
    authorId: "1",
    author: "User 1",
    status: "pending",
    moderateDate: null,
  },
  {
    articleId: 2,
    title: "Các món ăn chay đơn giản dễ làm tại nhà",
    authorId: "2",
    author: "User 2",
    status: "pending",
    moderateDate: null,
  },
];

const itemsPerPage = 2;

const ArticleModerateManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState(mockArticles);

  const filteredArticles = articles.filter(
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

  const handleReject = (articleId) => {
    const updatedArticles = articles.map((article) =>
      article.articleId === articleId
        ? { ...article, status: "rejected" }
        : article
    );
    setArticles(updatedArticles);
    alert("Bài viết đã được từ chối!");
  };

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
    <div className="article-moderate-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <table className="articles-table">
          <thead>
            <tr>
              <th></th>
              <th>Article ID</th>
              <th>Tiêu đề</th>
              <th>Tác giả</th>
              <th>Trạng thái</th>
              <th>Ngày duyệt</th>
              <th>Hành động</th>
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
                <td>
                  <span
                    className="author-link"
                    onClick={() =>
                      navigate(`/userActivity-management/${article.authorId}`)
                    }
                    style={{ cursor: "pointer", color: "blue" }}
                  >
                    {article.author}
                  </span>
                </td>
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
                  {article.status === "pending" && (
                    <button
                      className="reject-button"
                      onClick={() => handleReject(article.articleId)}
                    >
                      Từ chối
                    </button>
                  )}
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

export default ArticleModerateManagement;
