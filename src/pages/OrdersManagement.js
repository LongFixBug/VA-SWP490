import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrdersManagement.css";
import SearchBar from "../components/SearchBar";
import OrderTable from "../components/OrderTable";
import axios from "axios";

const OrdersManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const roleId = localStorage.getItem("roleId");

        if (!token || roleId !== "2") {
          alert("Bạn không có quyền truy cập trang này!");
          navigate("/");
          return;
        }

        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/allOrder",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Filter orders by status and search term
  useEffect(() => {
    let filtered = orders;

    if (filterStatus === "completed") {
      filtered = orders.filter((order) => order.status === "delivered");
    } else if (filterStatus === "cancelled") {
      filtered = orders.filter((order) => order.status === "cancel");
    } else if (filterStatus === "pending") {
      filtered = orders.filter((order) =>
        ["pending", "processing", "delivering"].includes(order.status)
      );
    }

    filtered = filtered.filter(
      (order) =>
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredOrders(filtered);
  }, [filterStatus, searchTerm, orders]);

  // Handle delete order (dummy implementation for now)
  const handleDeleteClick = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.orderId !== orderId)
      );

      alert("Đơn hàng đã được xóa thành công.");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Không thể xóa đơn hàng. Vui lòng thử lại.");
    }
  };

  return (
    <div className="Orders-container">
      <Sidebar />
      <div className="content">
        <div>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="filter-buttons">
            <button
              className={filterStatus === "all" ? "active" : ""}
              onClick={() => setFilterStatus("all")}
            >
              Tất cả
            </button>
            <button
              className={filterStatus === "completed" ? "active" : ""}
              onClick={() => setFilterStatus("completed")}
            >
              Đã hoàn thành
            </button>
            <button
              className={filterStatus === "pending" ? "active" : ""}
              onClick={() => setFilterStatus("pending")}
            >
              Chưa hoàn thành
            </button>
            <button
              className={filterStatus === "cancelled" ? "active" : ""}
              onClick={() => setFilterStatus("cancelled")}
            >
              Đã hủy
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-data">Không có đơn hàng nào để hiển thị.</div>
        ) : (
          <OrderTable
            rows={filteredOrders}
            handleDeleteClick={handleDeleteClick}
          />
        )}
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

export default OrdersManagement;
