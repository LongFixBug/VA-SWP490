import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DishesManagement.css";
import Pagination from "../components/Pagination";

  
const mockDishesData = [
  {
    dish_id: 1,
    name: "Vegetable Stir-fry",
    dish_type: "Main",
    description: "A delicious stir-fry with fresh vegetables.",
    image_url: "https://example.com/images/vegetable_stir_fry.jpg",
    dietary_preference_id: 2,
    price: 10.99,
    recipe: "Stir vegetables in a hot pan with soy sauce.",
    status: "available",
  },
  {
    dish_id: 2,
    name: "Miso Soup",
    dish_type: "Starter",
    description: "Traditional Japanese miso soup with tofu and seaweed.",
    image_url: "https://example.com/images/miso_soup.jpg",
    dietary_preference_id: 1,
    price: 5.99,
    recipe: "Mix miso paste in hot water, add tofu and seaweed.",
    status: "available",
  },
  // Thêm nhiều món ăn khác nếu cần
];

const DishesManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const dishesPerPage = 5;
  


  const filteredDishes = mockDishesData.filter(
    (dish) =>
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.dish_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDishes.length / dishesPerPage);
  const indexOfLastDish = currentPage * dishesPerPage;
  const indexOfFirstDish = indexOfLastDish - dishesPerPage;
  const currentDishes = filteredDishes.slice(indexOfFirstDish, indexOfLastDish);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
        <div className="sidebar-item logout" onClick={handleLogout}>
          Đăng xuất
        </div>
      </div>
    );
  };

  const SearchBar = ({ searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    return (
      <div className="search-bar">
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="create-button"
          onClick={() => navigate("/create-dish")}
        >
          Thêm món ăn mới
        </button>
      </div>
    );
  };

  return (
    <div className="dishes-management">
      <Sidebar />
      <div className="content">
        <div className="header-actions">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <table className="dishes-table">
          <thead>
            <tr>
              <th></th>
              <th>Mã Món</th>
              <th>Tên</th>
              <th>Loại</th>
              <th>Giá</th>
              <th>Trạng Thái</th>
              <th>Hình Ảnh</th>
              <th>Xem Thêm</th>
            </tr>
          </thead>
          <tbody>
            {currentDishes.map((dish) => (
              <tr key={dish.dish_id}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{dish.dish_id}</td>
                <td>{dish.name}</td>
                <td>{dish.dish_type}</td>
                <td>{dish.price}</td>
                <td>{dish.status}</td>
                <td>
                  <img src={dish.image_url} alt={dish.name} width="50" />
                </td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => navigate(`/dish/${dish.dish_id}`)}
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

export default DishesManagement;
