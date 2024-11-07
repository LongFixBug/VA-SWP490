import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateArticle.css"; // Tạo file CSS để tùy chỉnh giao diện

const CreateArticle = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("pending");
  const navigate = useNavigate();

  const handleCreateArticle = (e) => {
    e.preventDefault();
    // Xử lý logic tạo bài viết ở đây (hiện chỉ in ra console)
    console.log({
      title,
      content,
      author,
      status,
    });
    navigate("/articles-management"); // Điều hướng sau khi tạo xong
  };

  return (
    <div className="create-article-container">
      <h2>Tạo bài viết mới</h2>
      <form onSubmit={handleCreateArticle}>
        <div className="article-input-group">
          <label htmlFor="title">Tiêu đề bài viết</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề bài viết"
            required
          />
        </div>
        <div className="article-input-group">
          <label htmlFor="content">Nội dung bài viết</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung bài viết"
            required
          />
        </div>
        <div className="article-input-group">
          <label htmlFor="author">Tác giả</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nhập tên tác giả"
            required
          />
        </div>
        <div className="article-input-group">
          <label htmlFor="status">Trạng thái</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Chờ duyệt</option>
            <option value="accepted">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
        <div className="article-create-button">
          <button type="submit">Tạo bài viết</button>
        </div>
      </form>
    </div>
  );
};

export default CreateArticle;
