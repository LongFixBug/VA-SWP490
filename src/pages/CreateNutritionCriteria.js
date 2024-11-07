import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateNutritionCriteria.css"; // Tạo file CSS để tùy chỉnh giao diện

const CreateNutritionCriteria = () => {
  const [criteriaName, setCriteriaName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const navigate = useNavigate();

  const handleCreateNutritionCriteria = (e) => {
    e.preventDefault();
    // Xử lý logic tạo tiêu chí dinh dưỡng ở đây
    console.log({
      criteriaName,
      calories,
      protein,
      carbs,
      fat,
    });
    navigate("/nutrition-criteria"); // Điều hướng sau khi tạo xong
  };

  return (
    <div className="create-nutrition-container">
      <h2>Tạo tiêu chí dinh dưỡng mới</h2>
      <form onSubmit={handleCreateNutritionCriteria}>
        <div className="nutrition-input-group">
          <label htmlFor="criteriaName">Tên tiêu chí</label>
          <input
            type="text"
            id="criteriaName"
            value={criteriaName}
            onChange={(e) => setCriteriaName(e.target.value)}
            placeholder="Nhập tên tiêu chí"
            required
          />
        </div>
        <div className="nutrition-input-group">
          <label htmlFor="calories">Lượng calo (kcal)</label>
          <input
            type="number"
            id="calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Nhập lượng calo"
            required
          />
        </div>
        <div className="nutrition-input-group">
          <label htmlFor="protein">Protein (g)</label>
          <input
            type="number"
            id="protein"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="Nhập lượng protein"
            required
          />
        </div>
        <div className="nutrition-input-group">
          <label htmlFor="carbs">Carbs (g)</label>
          <input
            type="number"
            id="carbs"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="Nhập lượng carbs"
            required
          />
        </div>
        <div className="nutrition-input-group">
          <label htmlFor="fat">Chất béo (g)</label>
          <input
            type="number"
            id="fat"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="Nhập lượng chất béo"
            required
          />
        </div>
        <div className="nutrition-create-button">
          <button type="submit">Tạo tiêu chí</button>
        </div>
      </form>
    </div>
  );
};

export default CreateNutritionCriteria;
