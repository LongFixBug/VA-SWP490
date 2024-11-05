import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
import "../styles/OrderDetail.css";
import editIcon from "../assets/icons/edit-icon.png";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Tạo dữ liệu giả cho đơn hàng
        const fakeOrder = {
          orderId: id,
          userId: 1,
          totalPrice: 200000,
          orderDate: "2024-10-01",
          deliveryAddress: "123 Đường ABC, TP.HCM",
          deliveryFee: 15000,
          status: "processing",
          completedTime: null,
          note: "Giao hàng trước 12 giờ trưa",
        };
        setOrder(fakeOrder);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) {
    return <p>Đang tải thông tin đơn hàng...</p>;
  }

  const handleUpdate = () => {
    alert("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder({ ...order, [name]: value });
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="order-detail-container">
          <h2>Thông tin chi tiết của Đơn hàng</h2>

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
                  <option value="canceled">Đã hủy</option>
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
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => navigate("/orders-management")}
      >
        Quản lý order
      </div>

      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default OrderDetail;
