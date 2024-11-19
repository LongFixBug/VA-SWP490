import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DishesManagement.css"; // Ensure this file contains cloned styles from ArticleModerateManagement.css
import SearchBar from "../components/SearchBar";
import DishTable from "../components/DishTable"; // Replace EnhancedTable with DishTable
import axios from "axios";

const itemsPerPage = 100;

const DishesManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dishes from API
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        const roleId = localStorage.getItem("roleId");

        if (!token || roleId !== "5") {
          navigate("/"); // Redirect to login or home if not authorized
          return;
        }

        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/alldish",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include JWT
            },
          }
        );

        setDishes(response.data);
        setFilteredDishes(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching dishes:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken"); // Remove token if invalid
          navigate("/"); // Redirect to login
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishes();
  }, [navigate]);

  // Filter dishes based on search term
  useEffect(() => {
    const filtered = dishes.filter(
      (dish) =>
        dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.dishType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.preferenceName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDishes(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    if (currentPage > Math.ceil(filtered.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [searchTerm, dishes]);

  // Handle deleting a dish
  const handleDeleteClick = async (dishId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/delete/${dishId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update dish list after deletion
      setDishes((prevDishes) =>
        prevDishes.filter((dish) => dish.dishId !== dishId)
      );
      alert("Món ăn đã được xóa thành công.");
    } catch (error) {
      console.error("Error deleting dish:", error);
      alert("Không thể xóa món ăn. Vui lòng thử lại.");
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="dishes-management-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className="create-button"
            onClick={() => navigate("/create-dish")}
          >
            Tạo món ăn
          </button>
        </div>
        {isLoading ? (
          <div className="loading">Đang tải...</div>
        ) : filteredDishes.length === 0 ? (
          <div className="no-data">Không có món ăn nào để hiển thị.</div>
        ) : (
          <DishTable
            dishes={filteredDishes.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )}
            handleDeleteClick={handleDeleteClick}
            currentPage={currentPage}
            rowsPerPage={itemsPerPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear JWT on logout
    localStorage.removeItem("roleId"); // Clear roleId
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
        onClick={() => navigate("/ingredient-management")}
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

export default DishesManagement;