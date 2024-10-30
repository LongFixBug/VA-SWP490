import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/DishDetail.css";
import editIcon from "../assets/icons/edit-icon.png";

const DishDetail = () => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${id}`
        );
        setDish(response.data);
      } catch (error) {
        console.error("Error fetching dish details:", error);
      }
    };

    fetchDish();
  }, [id]);

  if (!dish) {
    return <p>Đang tải thông tin món ăn...</p>;
  }

  const handleUpdate = () => {
    alert("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDish({ ...dish, [name]: value });
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="dish-detail-container">
          <h2>Thông tin chi tiết của Món ăn</h2>

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

          <div className="dish-info">
            <div>
              <label>Tên món ăn:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={dish.name}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.name}</p>
              )}
            </div>

            <div>
              <label>Loại món ăn:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="dishType"
                  value={dish.dishType}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.dishType}</p>
              )}
            </div>

            <div>
              <label>Giá:</label>
              {isEditing ? (
                <input
                  type="number"
                  name="price"
                  value={dish.price}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.price} VNĐ</p>
              )}
            </div>

            <div>
              <label>Mô tả:</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={dish.description}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.description}</p>
              )}
            </div>

            <div>
              <label>Công thức:</label>
              {isEditing ? (
                <textarea
                  name="recipe"
                  value={dish.recipe}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.recipe}</p>
              )}
            </div>

            <div>
              <label>Chế độ ăn:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="preferenceName"
                  value={dish.preferenceName}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.preferenceName}</p>
              )}
            </div>

            <div>
              <label>Hình ảnh:</label>
              <div>
                <img src={dish.imageUrl} alt={dish.name} width="100" />
              </div>
            </div>
          </div>

          {isEditing && (
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
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default DishDetail;
