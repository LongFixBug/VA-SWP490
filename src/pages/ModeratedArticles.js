import React, { useEffect, useState } from "react";
import "../styles/ModeratedArticles.css";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ModeratedArticles = () => {
  const [articles, setArticles] = useState([]); // Danh sách bài viết từ API
  const [activeTab, setActiveTab] = useState("accepted"); // Tab hiện tại
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const navigate = useNavigate();

  const itemsPerPage = 20; // Số bài viết trên mỗi trang

  // Gọi API để lấy danh sách bài viết
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/3",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setArticles(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bài viết:", error);
        alert("Không thể tải danh sách bài viết.");
      }
    };

    fetchArticles();
  }, []);

  // Lọc bài viết theo tab hiện tại và từ khóa tìm kiếm
  const filteredArticles = articles.filter((article) => {
    const isAccepted = activeTab === "accepted" && article.status === "accepted";
    const isRejected = activeTab === "rejected" && article.status !== "unaccepted";
    const matchesSearchTerm =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.authorName.toLowerCase().includes(searchTerm.toLowerCase());

    return (isAccepted || isRejected) && matchesSearchTerm;
  });

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
                <td>{article.authorName}</td>
                <td>
                  {article.status === "active" ? "Đã Duyệt" : "Đã Từ Chối"}
                </td>
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
    localStorage.removeItem("authToken");
    localStorage.removeItem("roleId");
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
