import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DishesManagement.css";
import Pagination from "../components/Pagination";
import axios from "axios";


const DishesManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dishes, setDishes] = useState([]);
  const dishesPerPage = 5;
  
  // Fetch dishes data from API
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/alldish"
        );
        setDishes(response.data);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    };
    fetchDishes();
  }, []);

// Filter dishes based on search term
  const filteredDishes = dishes.filter(
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
