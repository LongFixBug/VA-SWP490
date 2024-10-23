import React from "react";
import { useNavigate } from "react-router-dom";

const Table = ({ users, handleSort, handleEditClick, handleDeleteClick }) => {
  const navigate = useNavigate();

  const handleViewDetails = (userId) => {
    navigate(`/user/${userId}`); // Điều hướng đến trang chi tiết người dùng
  };

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
          <tr key={user.userId}>
            <td>
              <input type="checkbox" />
            </td>
            <td>{user.username}</td>
            <td>{user.fullname}</td>
            <td>{user.email}</td>
            <td>{user.phoneNumber}</td>
            <td>
              {user.roleId === 1
                ? "Admin"
                : user.roleId === 2
                ? "Staff"
                : user.roleId === 3
                ? "Nutritionist"
                : user.roleId === 4
                ? "Moderator"
                : "Customer"}
            </td>
            <td>{user.status || "unknown"}</td>
            <td>
              <button
                className="detail-button"
                onClick={() => handleViewDetails(user.userId)}
              >
                Xem chi tiết
              </button>
            </td>
            <td>
              {/* <button
                className="edit-button"
                onClick={() => handleEditClick(user)}
              >
                ✏️
              </button> */}
              <button
                className="delete-button"
                onClick={() => handleDeleteClick(user.userId)}
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

export default Table;
