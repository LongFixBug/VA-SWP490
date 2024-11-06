import React, {  useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ArticleDetail.css";
import editIcon from "../assets/icons/edit-icon.png";

// Mock data for article and user role
const mockArticleData = {
  articleId: 1,
  title: "Lợi ích của ăn chay đối với sức khỏe",
  content: "Bài viết này trình bày những lợi ích sức khỏe của việc ăn chay...",
  author: "User 1",
  status: "accepted",
  moderateDate: "2024-10-01",
};
const userRole = "nutritionist"; // Example role, replace with actual role from auth context or API

const ArticleDetail = () => {
  const [article, setArticle] = useState(mockArticleData);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = () => {
    alert("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticle({ ...article, [name]: value });
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="article-detail-container">
          <h2>Thông tin chi tiết của Bài viết</h2>

          <div className="top-buttons">
            <button className="back-button" onClick={() => navigate(-1)}>
              Quay lại
            </button>

            {userRole === "nutritionist" && (
              <div
                className="edit-icon"
                onClick={() => setIsEditing(!isEditing)}
                style={{ cursor: "pointer" }}
              >
                <img src={editIcon} alt="Edit" width="40" height="40" />
              </div>
            )}
          </div>

          <div className="article-info">
            <div>
              <label>Tiêu đề:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={article.title}
                  onChange={handleChange}
                />
              ) : (
                <p>{article.title}</p>
              )}
            </div>

            <div>
              <label>Nội dung:</label>
              {isEditing ? (
                <textarea
                  name="content"
                  value={article.content}
                  onChange={handleChange}
                />
              ) : (
                <p>{article.content}</p>
              )}
            </div>

            <div>
              <label>Tác giả:</label>
              <p>{article.author}</p>
            </div>

            <div>
              <label>Trạng thái:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="status"
                  value={article.status}
                  onChange={handleChange}
                />
              ) : (
                <p>{article.status}</p>
              )}
            </div>

            <div>
              <label>Ngày kiểm duyệt:</label>
              <p>
                {article.moderateDate ? article.moderateDate : "Chưa duyệt"}
              </p>
            </div>
          </div>

          {isEditing && userRole === "nutritionist" && (
            <button className="edit-button" onClick={handleUpdate}>
              Cập nhật thông tin
            </button>
          )}
        </div>
      </div>
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
        onClick={() => navigate("/articles-management")}
      >
        Quản lý bài viết
      </div>
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
        Quản lý thể trạng
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default ArticleDetail;
