import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserDetail.css";
import Sidebar from "../components/Sidebar";
import editIcon from "../assets/icons/edit-icon.png";

const UserDetail = () => {
  const { id } = useParams(); // Get the userId from URL params
  const [user, setUser] = useState(null); // Store user details
  const [isEditing, setIsEditing] = useState(false); // Toggle editing state
  const navigate = useNavigate();

  // Fetch user details
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
        }

        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Thêm token vào header
            },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Không thể tải thông tin người dùng. Vui lòng thử lại.");
      }
    };

    fetchUserDetail();
  }, [id]);

  // Handle updating user information
  const handleUpdate = async () => {
    try {
      const confirmUpdate = window.confirm("Bạn có chắc chắn muốn cập nhật?");
      if (!confirmUpdate) return;

      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/EditCustomer${user.userId}`,
        user
      );
      alert("Cập nhật thông tin thành công!");
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Có lỗi xảy ra khi cập nhật.");
    }
  };

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Render loading message if user data is not yet available
  if (!user) {
    return <p>Đang tải thông tin người dùng...</p>;
  }

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
                placeholder="Nhập mật khẩu mới"
                onChange={handleChange}
              />
            ) : (
              <p>******</p>
            )}

            <label>Email:</label>
            {isEditing ? (
              <input type="email" name="email" value={user.email} readOnly />
            ) : (
              <p>{user.email}</p>
            )}

            <label>SĐT:</label>
            {isEditing ? (
              <input
                type="text"
                name="phoneNumber"
                value={user.phoneNumber}
                readOnly
                // onChange={handleChange}
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
