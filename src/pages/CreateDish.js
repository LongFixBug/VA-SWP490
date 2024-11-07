import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateDish.css"; // Tạo file CSS để tùy chỉnh giao diện

const CreateDish = () => {
  const [name, setName] = useState("");
  const [dishType, setDishType] = useState("");
  const [description, setDescription] = useState("");
  const [recipe, setRecipe] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dietaryPreferenceId, setDietaryPreferenceId] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  const handleCreateDish = (e) => {
    e.preventDefault();
    // Xử lý logic tạo món ăn ở đây
    console.log({
      name,
      dishType,
      description,
      recipe,
      imageUrl,
      dietaryPreferenceId,
      price,
    });
    navigate("/dishes"); // Điều hướng sau khi tạo xong
  };

  return (
    <div className="create-dish-container">
      <h2>Tạo món ăn mới</h2>
      <form onSubmit={handleCreateDish}>
        <div className="dish-input-group">
          <label htmlFor="name">Tên món ăn</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên món ăn"
            required
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="dishType">Loại món ăn</label>
          <input
            type="text"
            id="dishType"
            value={dishType}
            onChange={(e) => setDishType(e.target.value)}
            placeholder="Nhập loại món ăn"
            required
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả món ăn"
            required
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="recipe">Công thức</label>
          <textarea
            id="recipe"
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
            placeholder="Nhập công thức món ăn"
            required
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="imageUrl">URL hình ảnh</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Nhập URL hình ảnh"
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="dietaryPreferenceId">ID sở thích dinh dưỡng</label>
          <input
            type="number"
            id="dietaryPreferenceId"
            value={dietaryPreferenceId}
            onChange={(e) => setDietaryPreferenceId(e.target.value)}
            placeholder="Nhập ID sở thích dinh dưỡng"
            required
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="price">Giá (VNĐ)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Nhập giá món ăn"
            required
          />
        </div>
        <div className="dish-create-button">
          <button type="submit">Tạo món ăn</button>
        </div>
      </form>
    </div>
  );
};

export default CreateDish;
