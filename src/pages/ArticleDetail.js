import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ArticleDetail.css";
import editIcon from "../assets/icons/edit-icon.png";

const ArticleDetail = () => {
  const { id } = useParams(); // Lấy ID bài viết từ URL
  const [article, setArticle] = useState(null); // Dữ liệu bài viết
  const [articleImages, setArticleImages] = useState([]); // Ảnh bài viết
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const [selectedImage, setSelectedImage] = useState(null); // Ảnh được chọn để phóng to
  const navigate = useNavigate();

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkUserRole = () => {
      const token = localStorage.getItem("authToken");
      const roleId = localStorage.getItem("roleId");

      if (!token || !roleId) {
        alert("Bạn cần đăng nhập để truy cập trang này!");
        navigate("/");
        return;
      }

      if (parseInt(roleId) !== 4) {
        alert("Bạn không có quyền truy cập trang này!");
        navigate("/");
      }
    };

    checkUserRole();
  }, [navigate]);

  // Lấy thông tin bài viết từ API
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setArticle(response.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin bài viết:", error);
        alert("Không thể tải thông tin bài viết.");
        navigate("/articleModerate-management");
      }
    };

    fetchArticle();
  }, [id, navigate]);

  // Lấy ảnh bài viết từ API
  useEffect(() => {
    const fetchArticleImages = async () => {
      try {
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setArticleImages(response.data);
      } catch (error) {
        console.error("Lỗi khi tải ảnh bài viết:", error);
      }
    };

    fetchArticleImages();
  }, [id]);

  const handleUpdateStatus = async (status) => {
    if (article) {
      try {
        const response = await axios.put(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/updateArticleStatusByArticleId/${article.articleId}`,
          JSON.stringify(status),
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        // Log kết quả API
        console.log("API Response:", response.data);

        // Cập nhật trạng thái bài viết trong UI sau khi thành công
        setArticle({ ...article, status });
        alert(`Trạng thái bài viết đã được cập nhật.`);
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái bài viết:", error);
        alert("Không thể cập nhật trạng thái bài viết.");
      }
    }
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

            <div
              className="edit-icon"
              onClick={() => setIsEditing(!isEditing)}
              style={{ cursor: "pointer" }}
            >
              <img src={editIcon} alt="Edit" width="40" height="40" />
            </div>
          </div>

          {article ? (
            <div className="article-info">
              <div>
                <label>Tiêu đề:</label>
                <p>{article.title}</p>
              </div>

              <div>
                <label>Nội dung:</label>
                <p>{article.content}</p>
              </div>

              <div>
                <label>Tác giả:</label>
                <p>{article.authorName}</p>
              </div>

              <div>
                <label>Trạng thái:</label>
                <p>{article.status}</p>
              </div>

              <div>
                <label>Ngày kiểm duyệt:</label>
                <p>
                  {article.moderateDate ? article.moderateDate : "Chưa duyệt"}
                </p>
              </div>

              <div>
                <label>Ảnh bài viết:</label>
                <div className="article-images">
                  {articleImages.map((image) => (
                    <img
                      key={image.articleImageId}
                      src={image.imageUrl}
                      alt={`Article Image ${image.articleImageId}`}
                      className="article-image"
                      onClick={() => setSelectedImage(image.imageUrl)} // Mở ảnh lớn
                    />
                  ))}
                </div>
              </div>

              {/* Hai nút cho Chấp nhận và Từ chối bài viết */}
              <div className="button-group">
                <button
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    marginRight: "10px",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",

                    fontSize: "16px",
                  }}
                  onClick={() => handleUpdateStatus("accepted")}
                >
                  Chấp nhận bài viết
                </button>
                <button
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",

                    fontSize: "16px",
                  }}
                  onClick={() => handleUpdateStatus("unaccepted")}
                >
                  Từ chối bài viết
                </button>
              </div>
            </div>
          ) : (
            <p>Đang tải thông tin bài viết...</p>
          )}
        </div>
      </div>

      {/* Hiển thị modal ảnh to */}
      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <img src={selectedImage} alt="Enlarged" />
          </div>
        </div>
      )}
    </div>
  );
};

// Sidebar component
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
        Bài viết đã được xử lý
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default ArticleDetail;
