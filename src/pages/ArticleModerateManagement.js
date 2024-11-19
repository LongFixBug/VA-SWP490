import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ArticleModerateManagement.css";
import SearchBar from "../components/SearchBar";
import EnhancedTable from "../components/MorderateTable";
import axios from "axios";

const itemsPerPage = 25;

const ArticleModerateManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch articles từ API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/"); // Chuyển về trang login nếu chưa đăng nhập
          return;
        }

        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/3",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Đính kèm JWT
            },
          }
        );

        const pendingArticles = response.data.filter(
          (article) => article.status === "pending"
        );

        setArticles(pendingArticles);
        setFilteredArticles(pendingArticles);
        setTotalPages(Math.ceil(pendingArticles.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching articles:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken"); // Xóa token nếu không hợp lệ
          navigate("/"); // Chuyển về trang login
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [navigate]);

  // Lọc bài viết theo từ khóa tìm kiếm
  useEffect(() => {
    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    if (currentPage > Math.ceil(filtered.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [searchTerm, articles]);

  // Xử lý xóa bài viết
  const handleDeleteClick = async (articleId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/delete/${articleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật danh sách bài viết sau khi xóa
      setArticles((prevArticles) =>
        prevArticles.filter((article) => article.articleId !== articleId)
      );
      alert("Bài viết đã được xóa thành công.");
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Không thể xóa bài viết. Vui lòng thử lại.");
    }
  };

  // Xử lý thay đổi trang
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="article-moderate-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        {isLoading ? (
          <div className="loading">Đang tải...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="no-data">Không có bài viết nào để hiển thị.</div>
        ) : (
          <EnhancedTable
            articles={filteredArticles.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )}
            handleDeleteClick={handleDeleteClick}
            currentPage={currentPage}
            rowsPerPage={itemsPerPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Xóa JWT khi đăng xuất
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
