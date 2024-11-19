import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NutritionCriteriaManagement.css";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

const currentCriteria = [
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
const itemsPerPage = 2;

const NutritionCriteriaManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCriteria = currentCriteria.filter(
    (criteria) =>
      criteria.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criteria.profession.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCriteria.length / itemsPerPage);
  const indexOfLastCriteria = currentPage * itemsPerPage;
  const indexOfFirstCriteria = indexOfLastCriteria - itemsPerPage;
  const currentCriteriaPage = filteredCriteria.slice(
    indexOfFirstCriteria,
    indexOfLastCriteria
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
    <div className="Nutrition-container">
      <Sidebar />
      <div className="content">
        <div className="header-actions">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className="create-button"
            onClick={() => navigate("/create-nutritionCriteria")}
          >
            Create
          </button>
        </div>
        <table className="nutrition-criteria-table">
          <thead>
            <tr>
              <th></th>
              <th>Criteria ID</th>
              <th>Gender</th>
              <th>Age Range</th>
              <th>BMI Range</th>
              <th>Profession</th>
              <th>Goal</th>
              <th>Xem thêm</th>
            </tr>
          </thead>
          <tbody>
            {currentCriteriaPage.map((criteria) => (
              <tr key={criteria.criteriaId}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{criteria.criteriaId}</td>
                <td>{criteria.gender}</td>
                <td>{criteria.age_range}</td>
                <td>{criteria.bmi_range}</td>
                <td>{criteria.profession}</td>
                <td>{criteria.goal}</td>
                <td>
                  <button
                    className="detail-button"
                    onClick={() =>
                      navigate(
                        `/nutritionCriteria-detail/${criteria.criteriaId}`
                      )
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
      <div
        className="sidebar-item"
        onClick={() => navigate("/articles-management")}
      >
        Quản lí bài viết
      </div>

      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};


export default NutritionCriteriaManagement;
