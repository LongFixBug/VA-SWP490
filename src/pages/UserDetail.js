import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserDetail.css";
import Sidebar from "../components/Sidebar";
import editIcon from "../assets/icons/edit-icon.png"; // Đường dẫn tới icon chỉnh sửa

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${id}`
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetail();
  }, [id]);

  if (!user) {
    return <p>Đang tải thông tin người dùng...</p>;
  }

  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/${user.userId}`,
        user
      );
      alert("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Có lỗi xảy ra khi cập nhật.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  return (
    <div className="admin-container">
      <Sidebar activeTab="customer" />
      <div className="content">
        <div className="user-detail-container">
          <h2>Thông tin chi tiết của người dùng</h2>

          <div className="top-buttons">
            <button className="back-button" onClick={() => navigate(-1)}>
              Quay lại
            </button>

            <div
              className="edit-icon"
              onClick={() => setIsEditing(!isEditing)}
              style={{ cursor: "pointer" }}
            >
              <img src={editIcon} alt="Edit" width="40" height="40" />
            </div>
          </div>

          <div className="user-info">
            <label>Tên đăng nhập:</label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={user.username}
                onChange={handleChange}
              />
            ) : (
              <p>{user.username}</p>
            )}

            <label>Mật khẩu:</label>
            {isEditing ? (
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
              />
            ) : (
              <p>******</p>
            )}

            <label>Họ và tên:</label>
            {isEditing ? (
              <input
                type="text"
                name="fullname"
                value={user.fullname}
                onChange={handleChange}
              />
            ) : (
              <p>{user.fullname}</p>
            )}

            <label>Email:</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
              />
            ) : (
              <p>{user.email}</p>
            )}

            <label>SĐT:</label>
            {isEditing ? (
              <input
                type="text"
                name="phoneNumber"
                value={user.phoneNumber}
                onChange={handleChange}
              />
            ) : (
              <p>{user.phoneNumber}</p>
            )}

            <label>Địa chỉ:</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={user.address}
                onChange={handleChange}
              />
            ) : (
              <p>{user.address}</p>
            )}

            <label>Giới tính:</label>
            {isEditing ? (
              <input
                type="text"
                name="gender"
                value={user.gender}
                onChange={handleChange}
              />
            ) : (
              <p>{user.gender}</p>
            )}
          </div>

          {isEditing && (
            <button className="edit-button" onClick={handleUpdate}>
              Cập nhật thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
