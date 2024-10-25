import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DishesManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [dishes, setDishes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const dishesPerPage = 2;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        // Gọi API để lấy tất cả món ăn
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionists/alldish"
        );
        let fetchedDishes = response.data;

        // Tìm kiếm dựa trên searchTerm
        if (searchTerm) {
          fetchedDishes = fetchedDishes.filter(
            (dish) =>
              dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              dish.dishType.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setDishes(fetchedDishes); // Cập nhật danh sách món ăn đã lọc
        setTotalPages(Math.ceil(fetchedDishes.length / dishesPerPage)); // Tính tổng số trang
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    };

    fetchDishes();
  }, [searchTerm, sortConfig, currentPage]);

  // Phân trang
  const indexOfLastDish = currentPage * dishesPerPage;
  const indexOfFirstDish = indexOfLastDish - dishesPerPage;
  const currentDishes = dishes.slice(indexOfFirstDish, indexOfLastDish);

  // Hàm thay đổi hướng sắp xếp
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Hàm xử lý khi nhấn nút xóa món ăn
  const handleDeleteClick = async (dishId) => {
    try {
      await axios.delete(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionists/dish/${dishId}`
      );
      setDishes((prevDishes) =>
        prevDishes.filter((dish) => dish.dishId !== dishId)
      );
    } catch (error) {
      console.error("Error deleting dish:", error);
    }
  };

  // Phân trang
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
    <div className="dishes-management-container">
      <Sidebar />
      <div className="content">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <table className="dishes-table">
          <thead>
            <tr>
              <th></th>
              <th onClick={() => handleSort("dishId")}>DishId</th>
              <th onClick={() => handleSort("name")}>Tên món ăn</th>
              <th onClick={() => handleSort("dishType")}>Loại món ăn</th>
              <th>ImageUrl</th>
              <th>Trạng thái</th>
              <th>Giá</th>
              <th>Xem chi tiết</th>
              <th>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {currentDishes.map((dish) => (
              <tr key={dish.dishId}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{dish.dishId}</td>
                <td>{dish.name}</td>
                <td>{dish.dishType}</td>
                <td>
                  <img src={dish.imageUrl} alt={dish.name} width="50" />
                </td>
                <td>{dish.status || "unknown"}</td>
                <td>{dish.price}</td>
                <td>
                  <button
                    className="detail-button"
                    onClick={() => navigate(`/dish/${dish.dishId}`)}
                  >
                    Xem chi tiết
                  </button>
                </td>
                <td>
                  <button className="edit-button">✏️</button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteClick(dish.dishId)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        onClick={() => navigate("/order-management")}
      >
        Quản lý đơn hàng
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
        placeholder="Nhập tại đây..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        className="create-button"
        onClick={() => navigate("/create-dish")}
      >
        Thêm món ăn
      </button>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPrevPage, onNextPage }) => {
  return (
    <div className="pagination">
      <button onClick={onPrevPage} disabled={currentPage === 1}>
        Trang trước
      </button>
      <span>
        Trang {currentPage} / {totalPages}
      </span>
      <button onClick={onNextPage} disabled={currentPage === totalPages}>
        Trang sau
      </button>
    </div>
  );
};

export default DishesManagement;
