import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/IngredientManagement.css";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

const currentIngredients = [
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
  // Thêm nhiều đối tượng khác nếu cần
];
const itemsPerPage = 2;

const IngredientManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredIngredients = currentIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const indexOfLastIngredient = currentPage * itemsPerPage;
  const indexOfFirstIngredient = indexOfLastIngredient - itemsPerPage;
  const currentIngredientsPage = filteredIngredients.slice(
    indexOfFirstIngredient,
    indexOfLastIngredient
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
    <div className="Ingredient-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className="create-button"
            onClick={() => navigate("/create-ingredient")}
          >
            Create
          </button>
        </div>
        <table className="ingredient-table">
          <thead>
            <tr>
              <th></th>
              <th>Ingredient ID</th>
              <th>Name</th>
              <th>Weight (g)</th>
              <th>Calories</th>
              <th>Protein (g)</th>
              <th>Carbs (g)</th>
              <th>Fat (g)</th>
              <th>Fiber (g)</th>

              <th>Cholesterol (mg)</th>
              <th>Sodium (mg)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentIngredientsPage.map((ingredient) => (
              <tr key={ingredient.ingredient_id}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{ingredient.ingredient_id}</td>
                <td>{ingredient.name}</td>
                <td>{ingredient.weight}</td>
                <td>{ingredient.calories}</td>
                <td>{ingredient.protein}</td>
                <td>{ingredient.carbs}</td>
                <td>{ingredient.fat}</td>
                <td>{ingredient.fiber}</td>
                <td>{ingredient.cholesterol}</td>
                <td>{ingredient.sodium}</td>
                <td>
                  <button
                    className="detail-button"
                    onClick={() =>
                      navigate(`/ingredient-detail/${ingredient.ingredient_id}`)
                    }
                  >
                    View
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


export default IngredientManagement;
