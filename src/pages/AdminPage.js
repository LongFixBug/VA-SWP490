import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";
import axios from "axios"; // Thêm axios để gọi API

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Customer"); // Lưu trạng thái tab hiện tại
  const [searchTerm, setSearchTerm] = useState(""); // Lưu giá trị tìm kiếm
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  }); // Cấu hình sắp xếp
  const [users, setUsers] = useState([]); // Lưu danh sách users
  const [editingUser, setEditingUser] = useState(null); // Lưu người dùng đang được sửa
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const usersPerPage = 2; // Số lượng người dùng trên mỗi trang
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Gọi API để lấy tất cả người dùng
        const response = await axios.get(
          "https://va-api-2efefb5aee82.herokuapp.com/users"
        );
        let fetchedUsers = response.data.data;

        // Lọc người dùng theo vai trò dựa trên tab hiện tại
        if (activeTab === "Customer") {
          fetchedUsers = fetchedUsers.filter(
            (user) => user.role === "Customer"
          );
        } else if (activeTab === "system") {
          fetchedUsers = fetchedUsers.filter((user) =>
            ["Staff", "Moderator", "Nutritionist"].includes(user.role)
          );
        }

        // Tìm kiếm cục bộ dựa trên searchTerm
        if (searchTerm) {
          fetchedUsers = fetchedUsers.filter(
            (user) =>
              user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.phone_number
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

  // Hàm xử lý khi nhấn nút sửa
  const handleEditClick = (user) => {
    setEditingUser(user); // Đặt người dùng đang sửa
  };

  // Hàm xử lý khi nhấn nút xóa (chuyển trạng thái từ active sang inactive)
  const handleDeleteClick = async (userId) => {
    try {
      await axios.put(
        `https://va-api-2efefb5aee82.herokuapp.com/users/${userId}`,
        {
          status: "inactive", // Chuyển trạng thái sang inactive
        }
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId ? { ...user, status: "inactive" } : user
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

  // Hàm xử lý khi submit form sửa người dùng
  const handleSaveEdit = async (updatedUser) => {
    try {
      const response = await axios.put(
        `https://va-api-2efefb5aee82.herokuapp.com/users/${updatedUser.user_id}`,
        updatedUser
      );

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === updatedUser.user_id ? updatedUser : user
          )
        );
        setEditingUser(null); // Đóng form sửa

        alert("Cập nhật thành công!");
      } else {
        alert("Cập nhật thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Đã có lỗi xảy ra khi cập nhật.");
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
          handleEditClick={handleEditClick}
          handleDeleteClick={handleDeleteClick}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
        {editingUser && (
          <EditForm
            user={editingUser}
            onSave={handleSaveEdit}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </div>
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

// Form để sửa người dùng
const EditForm = ({ user, onSave, onCancel }) => {
  const [updatedUser, setUpdatedUser] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="edit-form">
      <h3>Sửa thông tin người dùng</h3>
      <label>
        Tên đăng nhập:
        <input
          type="text"
          name="username"
          value={updatedUser.username}
          onChange={handleChange}
        />
      </label>
      <label>
        Họ và tên:
        <input
          type="text"
          name="fullname"
          value={updatedUser.fullname}
          onChange={handleChange}
        />
      </label>
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={updatedUser.email}
          onChange={handleChange}
        />
      </label>
      <label>
        SĐT:
        <input
          type="text"
          name="phone_number"
          value={updatedUser.phone_number}
          onChange={handleChange}
        />
      </label>
      <button onClick={() => onSave(updatedUser)}>Lưu</button>
      <button onClick={onCancel}>Hủy</button>
    </div>
  );
};

const Sidebar = ({ activeTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa token hoặc thông tin đăng nhập từ localStorage hoặc sessionStorage
    localStorage.removeItem("authToken"); // Nếu bạn đang lưu token tại đây
    sessionStorage.removeItem("authToken"); // Nếu bạn lưu token tại session

    // Chuyển hướng người dùng về trang đăng nhập
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div
        className={`sidebar-item ${
          (activeTab === "system", "customer" ? "active" : "")
        }`}
      >
        <span className="icon">👤</span> Quản lý tài khoản
      </div>
      <div className="sidebar-item" onClick={() => navigate("/dashboard")}>
        <span className="icon">📊</span> Thống kê
      </div>

      {/* Tùy chọn hiển thị tên role người dùng nếu có */}
      {/* <div className="sidebar-item">
        <span className="icon">👋</span> Xin chào: {userRole}
      </div> */}

      <div className="sidebar-item logout" onClick={handleLogout}>
        <span className="icon">🔓</span> Đăng xuất
      </div>
    </div>
  );
};

const Header = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  return (
    <div className="header">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "Customer" ? "active" : ""}`} // Thêm điều kiện active cho Khách hàng
          onClick={() => setActiveTab("Customer")}
        >
          Khách hàng
        </button>
        <button
          className={`tab ${activeTab === "system" ? "active" : ""}`} // Thêm điều kiện active cho Hệ thống
          onClick={() => setActiveTab("system")}
        >
          Hệ thống
        </button>
      </div>
    </div>
  );
};

const SearchBar = ({ searchTerm, setSearchTerm, navigate }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Nhập tại đây..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* <button className="search-button">🔍</button> */}
      <button
        className="create-button"
        style={{ width: "10%" }}
        onClick={() => navigate("/create-account")}
      >
        Tạo tài khoản
      </button>
    </div>
  );
};
const Table = ({ users, handleSort, handleEditClick, handleDeleteClick }) => {
  return (
    <table className="customer-table">
      <thead>
        <tr>
          <th></th>
          <th onClick={() => handleSort("username")}>Tên đăng nhập</th>
          <th onClick={() => handleSort("fullname")}>Họ và tên</th>
          <th onClick={() => handleSort("email")}>Email</th>
          <th>SĐT</th>
          <th>Vai trò</th>
          <th>Trạng thái</th>
          <th>Xem chi tiết</th>
          <th>Tác vụ</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.user_id}>
            <td>
              <input type="checkbox" />
            </td>
            <td>{user.username}</td>
            <td>{user.fullname}</td>
            <td>{user.email}</td>
            <td>{user.phone_number}</td>
            <td>{user.role}</td>
            <td>{user.status || "unknown"}</td>
            <td>
              <button className="detail-button">Xem chi tiết</button>
            </td>
            <td>
              <button
                className="edit-button"
                onClick={() => handleEditClick(user)}
              >
                ✏️
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteClick(user.user_id)}
              >
                ❌
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminPage;
