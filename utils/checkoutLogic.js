import AsyncStorage from "@react-native-async-storage/async-storage";

// Hàm gọi API với token
const fetchWithAuth = async (url, options = {}) => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) {
    console.error("Không tìm thấy token.");
    throw new Error("Unauthorized: Missing token");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    return response;
  } catch (error) {
    console.error("Error fetching with auth:", error);
    throw error;
  }
};

// Lấy orderId mới nhất
export const fetchLatestOrderId = async (userId) => {
  try {
    const response = await fetchWithAuth(
      `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Không thể lấy danh sách đơn hàng: " + errorText);
    }

    const orders = await response.json();
    const latestOrder = orders.reduce((maxOrder, order) =>
      order.orderId > maxOrder.orderId ? order : maxOrder
    );

    return latestOrder.orderId;
  } catch (error) {
    console.error("Lỗi khi lấy orderId mới nhất:", error.message);
    throw error;
  }
};

// Kiểm tra và cập nhật trạng thái thanh toán
export const fetchOrderDetailsAndUpdateStatus = async (latestOrderId) => {
  try {
    const paymentDetailResponse = await fetchWithAuth(
      `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${latestOrderId}`
    );

    if (!paymentDetailResponse.ok) {
      const errorText = await paymentDetailResponse.text();
      throw new Error("Không thể kiểm tra trạng thái thanh toán: " + errorText);
    }

    const paymentDetails = await paymentDetailResponse.json();
    const paymentDetail = paymentDetails[0];

    if (paymentDetail?.paymentStatus === "completed") {
      // Cập nhật trạng thái đơn hàng
      await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${latestOrderId}?newStatus=pending`,
        { method: "PUT" }
      );
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái thanh toán:", error.message);
    throw error;
  }
};

// Lấy lịch sử giảm giá và cập nhật trạng thái
export const fetchAndUpdateDiscountHistory = async (userId) => {
  try {
    const response = await fetchWithAuth(
      `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/${userId}`
    );

    if (!response.ok) {
      throw new Error("Không thể lấy lịch sử giảm giá.");
    }

    const data = await response.json();
    const activeDiscount = data.find(
      (discount) => discount.status === "active"
    );

    if (activeDiscount) {
      await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/inactive/${userId}/${activeDiscount.tierId}`,
        { method: "PUT" }
      );
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái giảm giá:", error.message);
    throw error;
  }
};
