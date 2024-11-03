import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/DishesManagement.css"; // Ensure this file contains cloned styles from AdminPage.css
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

const DishesManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dishes, setDishes] = useState([]);
  const dishesPerPage = 5;

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

  const filteredDishes = dishes.filter(
    (dish) =>
      dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.dishType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.preferenceName?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const Table = ({ dishes }) => {
    return (
      <table className="customer-table">
        <thead>
          <tr>
            <th></th>
            <th>Mã Món</th>
            <th>Tên</th>
            <th>Loại</th>
            <th>Giá</th>
            <th>Chế độ ăn</th>
            <th>Hình Ảnh</th>
            <th>Trạng thái</th>
            <th>Xem Thêm</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((dish) => (
            <tr key={dish.dishId}>
              <td>
                <input type="checkbox" />
              </td>
              <td>{dish.dishId}</td>
              <td>{dish.name}</td>
              <td>{dish.dishType}</td>
              <td>{dish.price} VNĐ</td>
              <td>{dish.preferenceName}</td>
              <td>
                <img src={dish.imageUrl} alt={dish.name} width="50" />
              </td>
              <td>{dish.status}</td>
              <td>
                <button
                  className="view-button"
                  onClick={() => navigate(`/dish/${dish.dishId}`)}
                >
                  Xem thêm
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className="create-button"
            onClick={() => navigate("/create-dish")}
          >
            Create
          </button>
        </div>
        <Table dishes={currentDishes} />
        <div className="pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        </div>
      </div>
    </div>
  );
};

export default DishesManagement;
