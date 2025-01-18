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
    return null; // Return null when any errors occur
  }
};

// Lấy orderId mới nhất
export const fetchLatestOrderId = async (userId) => {
  try {
    const response = await fetchWithAuth(
      `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
    );

    if (!response) {
      // Check if response is null due to error in fetchWithAuth
      return null;
    }

    if (!response.ok) {
      return null; // Return null instead of throwing error
    }

    const orders = await response.json();

    if (!orders || orders.length === 0) {
      return null; // Return null if no orders
    }

    const latestOrder = orders.reduce((maxOrder, order) =>
      order.orderId > maxOrder.orderId ? order : maxOrder
    );

    return latestOrder?.orderId || null; // Return null if latestOrder is null
  } catch (error) {
    return null; // Return null for any errors during the process
  }
};

// Kiểm tra và cập nhật trạng thái thanh toán
export const fetchOrderDetailsAndUpdateStatus = async (latestOrderId) => {
  try {
    const paymentDetailResponse = await fetchWithAuth(
      `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${latestOrderId}`
    );

    if (!paymentDetailResponse) {
      return null; // Return null if response is null from fetchWithAuth
    }

    if (!paymentDetailResponse.ok) {
      return null; // Return null instead of throwing error
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
    return null;
  } catch (error) {
    return null;
  }
};

// Lấy lịch sử giảm giá và cập nhật trạng thái
export const fetchAndUpdateDiscountHistory = async (userId) => {
  try {
    const response = await fetchWithAuth(
      `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/${userId}`
    );
    if (!response) {
      return null; // Return null if response is null from fetchWithAuth
    }

    if (!response.ok) {
      return null; // Return null instead of throwing error
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
    return null;
  } catch (error) {
    return null;
  }
};
