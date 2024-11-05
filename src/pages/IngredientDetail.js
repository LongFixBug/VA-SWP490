import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/IngredientDetail.css";
import editIcon from "../assets/icons/edit-icon.png"; // Đường dẫn tới icon chỉnh sửa

const mockIngredientData = [
  {
    ingredient_id: 1,
    name: "Tomato",
    weight: 100,
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    vitamin_A: 833,
    vitamin_B: 0.04,
    vitamin_C: 13.7,
    vitamin_D: 0,
    vitamin_E: 0.54,
    calcium: 10,
    iron: 0.3,
    magnesium: 11,
    omega_3: 0,
    sugars: 2.6,
    cholesterol: 0,
    sodium: 5,
  },
  // Thêm nhiều nguyên liệu khác nếu cần
];

const IngredientDetail = () => {
  const { id } = useParams();
  const [ingredient, setIngredient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchedIngredient = mockIngredientData.find(
      (item) => item.ingredient_id === parseInt(id)
    );
    setIngredient(fetchedIngredient);
  }, [id]);

  if (!ingredient) {
    return <p>Đang tải thông tin nguyên liệu...</p>;
  }

  const handleUpdate = () => {
    alert("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIngredient({ ...ingredient, [name]: value });
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="ingredient-detail-container">
          <h2>Thông tin chi tiết của Nguyên Liệu</h2>

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

          <div className="ingredient-info">
            {Object.keys(ingredient).map((key) => (
              <div key={key}>
                <label>{key.replace(/_/g, " ").toUpperCase()}:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name={key}
                    value={ingredient[key]}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{ingredient[key]}</p>
                )}
              </div>
            ))}
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
      <div
        className="sidebar-item"
        onClick={() => navigate("/Ingredient-management")}
      >
        Quản lí nguyên liệu
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default IngredientDetail;
