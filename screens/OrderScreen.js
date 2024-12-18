import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchLatestOrderId,
  fetchOrderDetailsAndUpdateStatus,
  fetchAndUpdateDiscountHistory,
} from "../utils/checkoutLogic"; // Đường dẫn file logic

const dataTabViewOrder = [
  { id: 0, name: "Tất cả" },
  { id: 1, name: "Chờ xác nhận" },
  { id: 2, name: "Đang xử lí" },
  { id: 3, name: "Đang giao hàng" },
  { id: 4, name: "Đã giao" },
  { id: 5, name: "Đã hủy" },
];

const OrderScreen = ({ navigation }) => {
  const [currentTabViewOrder, setCurrentTabViewOrder] = useState(0);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // State để theo dõi trạng thái refresh
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' or 'oldest'
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [showSortButton, setShowSortButton] = useState(false);

  const orderStatus = {
    pending: { color: COLORS.yellow, text: "Chờ xác nhận" },
    processing: { color: COLORS.orange, text: "Đang xử lí" },
    delivering: { color: COLORS.blue, text: "Đang giao hàng" },
    delivered: { color: COLORS.green, text: "Đã giao" },
    cancel: { color: COLORS.red, text: "Đã hủy" },
  };

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
      if (response.status === 401) {
        console.error("Token hết hạn hoặc không hợp lệ.");
      }
      return response;
    } catch (error) {
      console.error("Error fetching with auth:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Get userId from AsyncStorage on component mount
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("User ID from AsyncStorage:", storedUserId);
          fetchOrders(storedUserId); // Pass the userId to fetchOrders function
        } else {
          console.error("User ID is not available in AsyncStorage");
        }
      } catch (error) {
        console.error("Error retrieving userId:", error);
      }
    };
    getUserId();
  }, []);

  const clearCart = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("[DEBUG] Không tìm thấy userId.");
        return;
      }

      console.log("[DEBUG] userId:", userId);

      // Step 1: Get the latest order for the user
      const ordersResponse = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!ordersResponse.ok) {
        const errorText = await ordersResponse.text();
        console.error("[DEBUG] Lỗi khi lấy danh sách đơn hàng:", errorText);
        throw new Error("Không thể lấy danh sách đơn hàng.");
      }

      const orders = await ordersResponse.json();

      // Find the latest order
      const latestOrder = orders.reduce((latest, current) => {
        return new Date(current.orderDate) > new Date(latest.orderDate)
          ? current
          : latest;
      }, orders[0]);

      if (!latestOrder) {
        console.log("[DEBUG] Không tìm thấy đơn hàng mới nhất.");
        return;
      }

      console.log("[DEBUG] Đơn hàng mới nhất:", latestOrder);

      // Step 2: Get order details for the latest order
      const orderDetailResponse = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderDetailByOrderId/${latestOrder.orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!orderDetailResponse.ok) {
        const errorText = await orderDetailResponse.text();
        console.error("[DEBUG] Lỗi khi lấy chi tiết đơn hàng:", errorText);
        throw new Error("Không thể lấy chi tiết đơn hàng.");
      }

      const orderDetails = await orderDetailResponse.json();
      const paidDishIds = orderDetails.map((detail) => detail.dishId);
      console.log("[DEBUG] Danh sách dishId đã thanh toán:", paidDishIds);

      // Step 3: Get cart items for the user
      const cartResponse = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/getCartByUserId/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!cartResponse.ok) {
        const errorText = await cartResponse.text();
        console.error("[DEBUG] Lỗi khi lấy giỏ hàng:", errorText);
        throw new Error("Không thể lấy danh sách giỏ hàng.");
      }

      const cartItems = await cartResponse.json();
      console.log("[DEBUG] Danh sách giỏ hàng:", cartItems);

      // Step 4: Filter cart items to delete based on paid dishId
      const cartIdsToDelete = cartItems
        .filter((cart) => paidDishIds.includes(cart.dishId))
        .map((cart) => cart.cartId);

      console.log("[DEBUG] Danh sách cartId cần xóa:", cartIdsToDelete);

      // Step 5: Delete each cart item and check response
      for (const cartId of cartIdsToDelete) {
        const response = await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/removeCartByUserId/${cartId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem(
                "authToken"
              )}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[DEBUG] Lỗi khi xóa cartId ${cartId}:`, errorText);
        } else {
          const contentType = response.headers.get("Content-Type");
          const result =
            contentType && contentType.includes("application/json")
              ? await response.json()
              : await response.text(); // Read as text if not JSON

          if (result === "Cart deleted successfully") {
            console.log(`[DEBUG] Xóa cartId ${cartId} thành công.`);
          } else {
            console.error(
              `[DEBUG] Phản hồi không mong đợi khi xóa cartId ${cartId}:`,
              result
            );
          }
        }
      }

      console.log("[DEBUG] Hoàn tất xóa giỏ hàng.");
    } catch (error) {
      console.error("[DEBUG] Lỗi khi xóa giỏ hàng:", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchDataOnFocus = async () => {
        try {
          // Lấy userId từ AsyncStorage
          const storedUserId = await AsyncStorage.getItem("userId");

          if (!storedUserId) {
            console.log("Không tìm thấy User ID.");
            Alert.alert("Thông báo", "Bạn cần đăng nhập lại để tiếp tục.", [
              {
                text: "OK",
                onPress: () => navigation.navigate("Login"), // Điều hướng về màn hình đăng nhập
              },
            ]);
            return; // Dừng logic tại đây nếu không có userId
          }

          // Nếu có userId, cập nhật state và tiếp tục xử lý
          setUserId(storedUserId);

          // Lấy orderId mới nhất
          const latestOrderId = await fetchLatestOrderId(storedUserId);

          if (latestOrderId) {
            console.log(
              "[DEBUG] Bắt đầu kiểm tra trạng thái đơn hàng. Order ID:",
              latestOrderId
            );

            // Kiểm tra chi tiết thanh toán
            const paymentDetailResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${latestOrderId}`
            );

            if (!paymentDetailResponse.ok) {
              const errorText = await paymentDetailResponse.text();
              console.error(
                "[DEBUG] Lỗi từ API kiểm tra thanh toán:",
                errorText
              );
              throw new Error("Không thể kiểm tra trạng thái thanh toán.");
            }

            const paymentDetails = await paymentDetailResponse.json();
            console.log("[DEBUG] Kết quả thanh toán từ API:", paymentDetails);

            const paymentDetail = paymentDetails[0];

            if (
              (paymentDetail?.paymentMethod === "PayOS" &&
                paymentDetail?.paymentStatus === "completed") ||
              (paymentDetail?.paymentMethod === "COD" &&
                paymentDetail?.paymentStatus === "pending")
            ) {
              console.log("[DEBUG] Thanh toán thành công. Xóa giỏ hàng...");

              // Gọi hàm xóa giỏ hàng
              await clearCart();

              //  Alert.alert(
              //    "Thông báo",
              //    "Thanh toán thành công! Giỏ hàng đã được xóa."
              //  );
            }

            if (paymentDetail?.paymentMethod === "COD") {
              console.log("[DEBUG] Phương thức thanh toán là COD.");

              // Cập nhật trạng thái đơn hàng thành "pending"
              await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${latestOrderId}?newStatus=pending`,
                { method: "PUT", headers: { Accept: "*/*" } }
              );

              console.log(
                "[DEBUG] Trạng thái đơn hàng đã được cập nhật thành công."
              );
            } else if (
              paymentDetail?.paymentMethod === "PayOS" &&
              paymentDetail?.paymentStatus === "completed"
            ) {
              console.log("[DEBUG] Thanh toán PayOS đã hoàn tất.");

              // Cập nhật trạng thái đơn hàng thành "pending"
              await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${latestOrderId}?newStatus=pending`,
                { method: "PUT", headers: { Accept: "*/*" } }
              );

              console.log(
                "[DEBUG] Trạng thái đơn hàng đã được cập nhật thành công."
              );
            } else {
              console.log(
                "[DEBUG] Trạng thái thanh toán chưa hoàn tất hoặc phương thức không hợp lệ."
              );
              return;
            }

            // Xử lý giảm giá
            const ordersResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${storedUserId}`
            );

            if (ordersResponse.ok) {
              const orders = await ordersResponse.json();

              // Tìm đơn hàng trạng thái 'pending'
              const latestOrder = orders
                .filter((order) => order.status === "pending")
                .reduce((latest, current) => {
                  return new Date(current.orderDate) >
                    new Date(latest.orderDate)
                    ? current
                    : latest;
                }, orders[0]);

              if (latestOrder) {
                const discountRate = latestOrder.discountRate;
                let tierId = 0;

                if (discountRate === 0.1) tierId = 2;
                else if (discountRate === 0.2) tierId = 3;
                else if (discountRate === 0.3) tierId = 4;

                if (tierId > 0) {
                  console.log(
                    `[DEBUG] Đơn hàng sử dụng giảm giá ${discountRate * 100}%.`
                  );

                  // Cập nhật lịch sử giảm giá
                  await fetchWithAuth(
                    `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/inactive/${storedUserId}/${tierId}`,
                    { method: "PUT", headers: { Accept: "*/*" } }
                  );

                  console.log("[DEBUG] Trạng thái giảm giá đã được cập nhật.");
                }
              }
            }
          }
          // Gọi lại hàm tải danh sách đơn hàng
          await fetchOrders(storedUserId);
        } catch (error) {
          console.log("[DEBUG] Lỗi trong quá trình xử lý:", error.message);
          Alert.alert(
            "Lỗi",
            error.message || "Có lỗi xảy ra trong quá trình xử lý đơn hàng."
          );
        }
      };

      // Gọi hàm tải dữ liệu
      fetchDataOnFocus();
    }, [navigation, currentTabViewOrder]) // Lắng nghe sự thay đổi của navigation và currentTabViewOrder
  );

  const fetchOrders = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error fetching orders:", errorData);
        return;
      }
      const data = await response.json();

      // Chỉ giữ lại đơn hàng có trạng thái hợp lệ
      const validStatuses = [
        "pending",
        "processing",
        "delivering",
        "delivered",
        "cancel",
      ];
      const filteredData = data.filter((order) =>
        validStatuses.includes(order.status)
      );

      const ordersWithDetails = await Promise.all(
        filteredData.map(async (order) => {
          const orderDetailResponse = await fetchWithAuth(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderDetailByOrderId/${order.orderId}`
          );
          if (!orderDetailResponse.ok) {
            console.error(
              "Error fetching order details for orderId:",
              order.orderId
            );
            return { ...order, orderDetails: [] }; // Fallback to an empty array if orderDetails cannot be fetched
          }
          const orderDetails = await orderDetailResponse.json();

          const dishesWithDetails = await Promise.all(
            (orderDetails || []).map(async (detail) => {
              const dishResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${detail.dishId}`
              );
              if (!dishResponse.ok) {
                console.error(
                  "Error fetching dish details for dishId:",
                  detail.dishId
                );
                return { ...detail, dish: {} }; // Fallback to an empty object if dish details cannot be fetched
              }
              const dish = await dishResponse.json();
              return { ...detail, dish };
            })
          );

          return { ...order, orderDetails: dishesWithDetails };
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const saveOrderToStorage = async (order) => {
    try {
      console.log("Order selected:", order); // Log order details
      await AsyncStorage.setItem("selectedOrder", JSON.stringify(order));
    } catch (error) {
      console.error("Error saving order to AsyncStorage:", error);
    }
  };

  const filterOrdersByStatus = (status, allOrders) => {
    let filtered = [...allOrders]; // Create a copy to avoid mutating the original array

    if (status !== 0) {
      filtered = allOrders.filter(
        (order) =>
          orderStatus[order.status]?.text === dataTabViewOrder[status].name
      );
    }

    // Sort the filtered orders based on the sortOrder state.
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        // Sort by orderId in descending order for 'newest'
        return b.orderId - a.orderId;
      } else {
        // Sort by orderId in ascending order for 'oldest'
        return a.orderId - b.orderId;
      }
    });

    // Group the filtered orders by month
    const grouped = groupOrdersByMonth(filtered);

    setFilteredOrders(filtered);
    setGroupedOrders(grouped);
  };

  const groupOrdersByMonth = (orders) => {
    const grouped = {};
    orders.forEach((order) => {
      const orderDate = new Date(order.orderDate);
      const monthYear = `${
        orderDate.getMonth() + 1
      }/${orderDate.getFullYear()}`;
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(order);
    });
    return Object.entries(grouped).sort(([, ordersA], [, ordersB]) => {
      const dateA = new Date(ordersA[0].orderDate);
      const dateB = new Date(ordersB[0].orderDate);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  useEffect(() => {
    filterOrdersByStatus(currentTabViewOrder, orders);
    setShowSortButton(currentTabViewOrder === 0);
  }, [currentTabViewOrder, orders, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };

  // Automatically refresh orders when the screen is focused
  // useFocusEffect(
  //   useCallback(() => {
  //     if (userId) {
  //       fetchOrders(userId);
  //     }
  //   }, [userId, currentTabViewOrder])
  // );

  const handleRefresh = async () => {
    setRefreshing(true); // Bắt đầu trạng thái loading
    if (userId) {
      await fetchOrders(userId); // Gọi lại hàm tải dữ liệu đơn hàng
    }
    setRefreshing(false); // Kết thúc trạng thái loading
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerText}>Đơn hàng</Text>
        <Icon name="menu" size={28} color={COLORS.green} />
      </View>
      <View style={{ height: "auto" }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dataTabViewOrder.map((tabView, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentTabViewOrder(tabView.id)}
              style={{
                ...styles.tabView,
                borderBottomColor:
                  currentTabViewOrder === tabView.id
                    ? COLORS.green
                    : COLORS.greyPastel,
              }}
            >
              <Text
                style={{
                  ...styles.tabText,
                  color:
                    currentTabViewOrder === tabView.id
                      ? COLORS.green
                      : COLORS.black,
                }}
              >
                {tabView.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {showSortButton && (
          <TouchableOpacity
            style={styles.sortButton}
            onPress={handleSortToggle}
          >
            <Text style={styles.sortButtonText}>
              {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}
            </Text>
            <Icon
              name={sortOrder === "newest" ? "arrow-down" : "arrow-up"}
              size={18}
              color={COLORS.green}
            />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={groupedOrders}
        renderItem={({ item }) => {
          const [monthYear, ordersInMonth] = item;
          return (
            <View>
              <View style={styles.monthHeaderContainer}>
                <View style={styles.monthHeaderLine} />
                <Text style={styles.monthHeader}>Tháng {monthYear}</Text>
                <View style={styles.monthHeaderLine} />
              </View>
              {ordersInMonth.map((order) => (
                <TouchableOpacity
                  key={order.orderId}
                  onPress={() => {
                    saveOrderToStorage(order);
                    navigation.navigate("OrderDetail", { orderId: order });
                  }}
                  style={styles.orderContainer}
                >
                  <Image
                    source={{ uri: order.orderDetails[0]?.dish.imageUrl }}
                    style={styles.orderImage}
                  />
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderName} numberOfLines={1}>
                      {order.orderDetails
                        .map((detail) => detail.dish.name)
                        .join(", ")}
                    </Text>
                    <Text style={styles.orderQuantity}>
                      Số lượng:{" "}
                      {order.orderDetails.reduce(
                        (acc, detail) => acc + detail.quantity,
                        0
                      )}
                    </Text>
                    <Text style={styles.orderTotal}>
                      Tổng tiền:{" "}
                      {order.totalPrice
                        ? `${order.totalPrice.toLocaleString()} vnđ`
                        : "0.000 đ"}
                    </Text>

                    <Text
                      style={{
                        ...styles.orderStatus,
                        color: orderStatus[order.status]?.color,
                      }}
                    >
                      {orderStatus[order.status]?.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        }}
        keyExtractor={(item) => item[0]}
        style={styles.flatList}
        onRefresh={handleRefresh} // Thêm hàm xử lý refresh
        refreshing={refreshing} // Kiểm tra trạng thái refresh
      />
    </>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  header: {
    marginTop: StatusBar.currentHeight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
  },
  headerText: {
    fontFamily: FONTS.bold,
    fontSize: 25,
    color: COLORS.green,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    alignSelf: "flex-end",
    position: "absolute",
    right: 20,
    top: 0,
  },
  sortButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    marginRight: 5,
  },
  tabView: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyPastel,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  monthHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
  },
  monthHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grey,
  },
  monthHeader: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.green,
    marginHorizontal: 10,
    textAlign: "center",
    width: 150,
  },
  orderContainer: {
    backgroundColor: COLORS.white,
    padding: 10,
    marginHorizontal: 5,
    marginBottom: 5,
    flexDirection: "row",
    borderWidth: 2,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
  },
  orderImage: {
    height: "auto",
    width: 100,
    borderRadius: 5,
  },
  orderDetails: {
    flex: 1,
    paddingLeft: 15,
    paddingTop: 5,
  },
  orderName: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  orderQuantity: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 5,
  },
  orderTotal: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.green,
    marginTop: 5,
  },
  orderStatus: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  flatList: {
    backgroundColor: COLORS.white,
    paddingTop: 5,
  },
});
