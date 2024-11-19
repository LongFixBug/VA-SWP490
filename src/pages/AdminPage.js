import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import EnhancedTable from "../components/Table";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Customer");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Lấy token từ localStorage
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/alluser",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Thêm header Authorization
            },
          }
        );

        let fetchedUsers = response.data;

        if (activeTab === "Customer") {
          fetchedUsers = fetchedUsers.filter((user) => user.roleId === 3);
        } else if (activeTab === "system") {
          fetchedUsers = fetchedUsers.filter((user) =>
            [2, 5, 4].includes(user.roleId)
          );
        }

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        if (error.response && error.response.status === 401) {
          alert("Bạn không có quyền truy cập. Vui lòng đăng nhập lại!");
          navigate("/"); // Chuyển hướng về trang đăng nhập
        }
      }
    };

    fetchUsers();
  }, [activeTab, navigate]);

  // Filter users by search term
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDeleteClick = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${userId}`,
        {
          status: "inactive",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm header Authorization
          },
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

  return (
    <div className="admin-container">
      <Sidebar activeTab={activeTab} />
      <div className="content">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="header">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            navigate={navigate}
          />
          <button
            className="create-button"
            onClick={() => navigate("/create-account")}
          >
            Tạo tài khoản
          </button>
        </div>
        <EnhancedTable
          rows={filteredUsers}
          handleDeleteClick={handleDeleteClick}
        />
      </div>
    </div>
  );
};

export default AdminPage;
