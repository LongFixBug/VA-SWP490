import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/OrderDetail.css";
import editIcon from "../assets/icons/edit-icon.png";

const OrderDetail = () => {
  const { id } = useParams(); // Lấy orderId từ URL
  const [order, setOrder] = useState(null); // Lưu thông tin đơn hàng
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const navigate = useNavigate();

  // Gọi API để lấy thông tin đơn hàng
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Lấy token từ localStorage
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/${id}`, // API để lấy chi tiết đơn hàng
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrder(response.data); // Lưu thông tin đơn hàng vào state
      } catch (error) {
        console.error("Error fetching order details:", error);
        alert("Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
        navigate("/orders-management"); // Điều hướng về OrdersManagement nếu lỗi
      }
    };

    fetchOrder();
  }, [id, navigate]);

  // Hàm xử lý cập nhật thông tin đơn hàng
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/update/${id}`, // API cập nhật đơn hàng
        order,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Cập nhật thông tin thành công!");
      setIsEditing(false); // Đóng chế độ chỉnh sửa
    } catch (error) {
      console.error("Error updating order details:", error);
      alert("Không thể cập nhật thông tin đơn hàng. Vui lòng thử lại.");
    }
  };

  // Xử lý khi chỉnh sửa thông tin đơn hàng
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder({ ...order, [name]: value });
  };

  if (!order) {
    return <p>Đang tải thông tin đơn hàng...</p>;
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="order-detail-container">
          <h2>Thông tin chi tiết của Đơn hàng</h2>

          <div className="top-buttons">
            <button
              className="back-button"
              onClick={() => navigate("/orders-management")}
            >
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

          <div className="order-info">
            <div>
              <label>ID Đơn hàng:</label>
              <p>{order.orderId}</p>
            </div>

            <div>
              <label>ID Người dùng:</label>
              <p>{order.userId}</p>
            </div>

            <div>
              <label>Tổng giá (VNĐ):</label>
              {isEditing ? (
                <input
                  type="number"
                  name="totalPrice"
                  value={order.totalPrice}
                  onChange={handleChange}
                />
              ) : (
                <p>{order.totalPrice} VNĐ</p>
              )}
            </div>

            <div>
              <label>Ngày đặt hàng:</label>
              {isEditing ? (
                <input
                  type="date"
                  name="orderDate"
                  value={order.orderDate}
                  onChange={handleChange}
                />
              ) : (
                <p>{order.orderDate}</p>
              )}
            </div>

            <div>
              <label>Địa chỉ giao hàng:</label>
              {isEditing ? (
                <textarea
                  name="deliveryAddress"
                  value={order.deliveryAddress}
                  onChange={handleChange}
                />
              ) : (
                <p>{order.deliveryAddress}</p>
              )}
            </div>

            <div>
              <label>Phí giao hàng:</label>
              {isEditing ? (
                <input
                  type="number"
                  name="deliveryFee"
                  value={order.deliveryFee}
                  onChange={handleChange}
                />
              ) : (
                <p>{order.deliveryFee} VNĐ</p>
              )}
            </div>

            <div>
              <label>Trạng thái:</label>
              {isEditing ? (
                <select
                  name="status"
                  value={order.status}
                  onChange={handleChange}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="delivering">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancel">Đã hủy</option>
                  <option value="failed">Giao hàng thất bại</option>
                </select>
              ) : (
                <p>{order.status}</p>
              )}
            </div>

            <div>
              <label>Thời gian hoàn thành:</label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  name="completedTime"
                  value={order.completedTime || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{order.completedTime || "Chưa hoàn thành"}</p>
              )}
            </div>

            <div>
              <label>Ghi chú:</label>
              {isEditing ? (
                <textarea
                  name="note"
                  value={order.note}
                  onChange={handleChange}
                />
              ) : (
                <p>{order.note}</p>
              )}
            </div>
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

// Sidebar component
const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("roleId");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => navigate("/orders-management")}
      >
        Quản lý đơn hàng
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default OrderDetail;
