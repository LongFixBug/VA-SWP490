import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrdersManagement.css";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

// Dữ liệu giả cho các đơn hàng
const mockOrders = [
  {
    orderId: 1,
    userId: 101,
    totalPrice: 500000,
    orderDate: "2024-10-01",
    deliveryAddress: "123 Đường ABC, TP.HCM",
    deliveryFee: 15000,
    status: "processing",
    completedTime: null,
    note: "Giao hàng trước 12 giờ trưa",
  },
  {
    orderId: 2,
    userId: 102,
    totalPrice: 300000,
    orderDate: "2024-10-02",
    deliveryAddress: "456 Đường DEF, TP.HCM",
    deliveryFee: 10000,
    status: "delivered",
    completedTime: "2024-10-03 14:00",
    note: "Không có ghi chú",
  },
  // Thêm dữ liệu giả khác nếu cần
];
const itemsPerPage = 2;

const OrdersManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrders = mockOrders.filter(
    (order) =>
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrdersPage = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

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
    <div className="Orders-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th></th>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Total Price</th>
              <th>Order Date</th>
              <th>Delivery Address</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {currentOrdersPage.map((order) => (
              <tr key={order.orderId}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{order.orderId}</td>
                <td>{order.userId}</td>
                <td>{order.totalPrice} VNĐ</td>
                <td>{order.orderDate}</td>
                <td>{order.deliveryAddress}</td>
                <td>{order.status}</td>
                <td>
                  <button
                    className="detail-button"
                    onClick={() => navigate(`/order-detail/${order.orderId}`)}
                  >
                    Xem thêm
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
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

export default OrdersManagement;
