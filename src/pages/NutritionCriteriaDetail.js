import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/NutritionCriteriaDetail.css";
import editIcon from "../assets/icons/edit-icon.png"; // Đường dẫn tới icon chỉnh sửa

const mockCriteriaData = [
  {
    criteriaId: 1,
    gender: "Male",
    age_range: "18-25",
    bmi_range: "18.5-24.9",
    profession: "Engineer",
    activity_level: "High",
    goal: "Gain Muscle",
    calories: 2500,
    protein: 100,
    carbs: 300,
    fat: 70,
    fiber: 30,
    vitamin_A: 500,
    vitamin_B: 10,
    vitamin_C: 60,
    vitamin_D: 15,
    vitamin_E: 20,
    calcium: 1000,
    iron: 8,
    magnesium: 400,
    omega_3: 1,
    sugars: 30,
    cholesterol: 300,
    sodium: 1500,
  },
  // Thêm nhiều đối tượng khác nếu cần
];

const NutritionCriteriaDetail = () => {
  const { id } = useParams();
  const [criteria, setCriteria] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchedCriteria = mockCriteriaData.find(
      (item) => item.criteriaId === parseInt(id)
    );
    setCriteria(fetchedCriteria);
  }, [id]);

  if (!criteria) {
    return <p>Đang tải thông tin tiêu chí...</p>;
  }

  const handleUpdate = () => {
    alert("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCriteria({ ...criteria, [name]: value });
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="criteria-detail-container">
          <h2>Thông tin chi tiết của Nutrition Criteria</h2>

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

          <div className="criteria-info">
            {Object.keys(criteria).map((key) => (
              <div key={key}>
                <label>{key.replace(/_/g, " ").toUpperCase()}:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name={key}
                    value={criteria[key]}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{criteria[key]}</p>
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

export default NutritionCriteriaDetail;
