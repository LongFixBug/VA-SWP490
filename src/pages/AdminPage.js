import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";
import axios from "axios"; // Thêm axios để gọi API
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Customer"); // Lưu trạng thái tab hiện tại
  const [searchTerm, setSearchTerm] = useState(""); // Lưu giá trị tìm kiếm
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  }); // Cấu hình sắp xếp
  const [users, setUsers] = useState([]); // Lưu danh sách users
  // const [editingUser, setEditingUser] = useState(null); // Lưu người dùng đang được sửa
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const usersPerPage = 2; // Số lượng người dùng trên mỗi trang
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Gọi API để lấy tất cả người dùng
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/alluser"
        );
        console.log(response.data); // Kiểm tra dữ liệu trả về từ API
        let fetchedUsers = response.data; // Không nên dùng response.data.data nếu API không trả về 'data' bên trong 'data'

        // Lọc người dùng theo vai trò dựa trên tab hiện tại
        if (activeTab === "Customer") {
          fetchedUsers = fetchedUsers.filter((user) => user.roleId === 5);
        } else if (activeTab === "system") {
          fetchedUsers = fetchedUsers.filter((user) =>
            [2, 3, 4].includes(user.roleId)
          );
        }

        // Tìm kiếm cục bộ dựa trên searchTerm
        if (searchTerm) {
          fetchedUsers = fetchedUsers.filter(
            (user) =>
              user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.phoneNumber
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setUsers(fetchedUsers); // Cập nhật danh sách người dùng đã lọc
        setTotalPages(Math.ceil(fetchedUsers.length / usersPerPage)); // Tính tổng số trang dựa trên số người dùng đã lọc
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [activeTab, searchTerm, sortConfig, currentPage]);

  // Phân trang phía client
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Hàm thay đổi hướng sắp xếp
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Hàm xử lý khi nhấn nút xóa (chuyển trạng thái từ active sang inactive)
  const handleDeleteClick = async (userId) => {
    try {
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${userId}`,
        {
          status: "inactive", // Chuyển trạng thái sang inactive
        }
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userId === userId ? { ...user, status: "inactive" } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  // Hàm xử lý khi chuyển sang trang trước
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Hàm xử lý khi chuyển sang trang sau
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="admin-container">
      <Sidebar activeTab={activeTab} />
      <div className="content">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          navigate={navigate}
        />
        <Table
          users={currentUsers} // Hiển thị người dùng của trang hiện tại
          handleSort={handleSort}
          // handleEditClick={handleEditClick}
          handleDeleteClick={handleDeleteClick}
        />
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

export default AdminPage;
