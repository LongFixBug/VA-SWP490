import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import { ButtonFloatBottom } from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PaymentScreen = ({ navigation }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("Chuyển tiền cho đơn hàng tại VA");
  const [userId, setUserId] = useState(null);

  // Hàm gọi API có thêm token
  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("Không tìm thấy token.");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  // Lấy thông tin đơn hàng từ AsyncStorage
  const fetchOrderDetails = async () => {
    try {
      const storedOrder = await AsyncStorage.getItem("pendingOrder");
      if (!storedOrder) {
        throw new Error("Không tìm thấy thông tin đơn hàng.");
      }
      const parsedOrder = JSON.parse(storedOrder);
      if (!parsedOrder.cartDetails || parsedOrder.cartDetails.length === 0) {
        throw new Error("Giỏ hàng trống hoặc không hợp lệ.");
      }
      setOrderDetails({
        ...parsedOrder,
        items: parsedOrder.cartDetails,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đơn hàng:", error.message);
      Alert.alert("Lỗi", error.message || "Không thể lấy thông tin đơn hàng.");
      navigation.goBack();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) throw new Error("Không tìm thấy User ID.");
        setUserId(storedUserId);
        await fetchOrderDetails();
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error.message);
        Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu.");
        navigation.goBack();
      }
    };
    fetchData();
  }, []);

  // Xử lý thanh toán
  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      if (!userId) throw new Error("Không tìm thấy User ID.");
      if (!orderDetails) throw new Error("Không tìm thấy thông tin đơn hàng.");

      // Tạo đơn hàng
      const orderData = {
        userId: parseInt(userId, 10),
        totalPrice: orderDetails.totalPrice,
        deliveryAddress: orderDetails.deliveryAddress || "Không có địa chỉ",
        note: note || "Không có ghi chú",
        deliveryFee: orderDetails.deliveryFee || 0,
        orderDate: new Date().toISOString(),
        status: "paid",
      };

      const createOrderResponse = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/createOrderByCustomer",
        {
          method: "POST",
          body: JSON.stringify(orderData),
        }
      );
      if (!createOrderResponse.ok) throw new Error("Không thể tạo đơn hàng.");

      // Lấy ID đơn hàng mới nhất
      const getOrdersResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
      );
      const orders = await getOrdersResponse.json();
      const latestOrder = orders.reduce((maxOrder, order) =>
        order.orderId > maxOrder.orderId ? order : maxOrder
      );
      const latestOrderId = latestOrder.orderId;

      // Tạo chi tiết đơn hàng
      const detailedCartItems = orderDetails.items || [];
      for (const item of detailedCartItems) {
        const orderDetailData = {
          orderId: latestOrderId,
          dishId: item.dishId,
          quantity: item.quantity,
          price: item.price,
        };
        const createOrderDetailResponse = await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/createOrderDetail",
          {
            method: "POST",
            body: JSON.stringify(orderDetailData),
          }
        );

        if (!createOrderDetailResponse.ok) {
          console.error(
            `Không thể tạo chi tiết đơn hàng cho món: ${item.dishId}.`
          );
        }
      }

      // Gọi API thanh toán
      const paymentData = {
        orderId: latestOrderId,
        decryptionKey: "Sav3CtqBonMF3f41HaoxABIi8NKVUMBU1MOHBi1qmf0=", // Key truyền trực tiếp
      };

      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) throw new Error("Không tìm thấy authToken.");

      // Log dữ liệu trước khi gửi
      console.log("Dữ liệu gửi đến API thanh toán:", paymentData);
      console.log("Token Authorization:", authToken);

      const paymentResponse = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      // Log trạng thái phản hồi
      console.log(
        "Trạng thái phản hồi từ API thanh toán:",
        paymentResponse.status
      );

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error("Phản hồi lỗi từ API thanh toán:", errorText);

        if (errorText.includes("Padding is invalid and cannot be removed")) {
          throw new Error("Key không hợp lệ hoặc không đúng định dạng Base64.");
        }

        throw new Error("Lỗi khi gọi API thanh toán.");
      }

      // Lấy đường link thanh toán
      const paymentLink = await paymentResponse.text();
      console.log("Đường link thanh toán nhận được:", paymentLink);

      if (!paymentLink.startsWith("http")) {
        throw new Error("Không nhận được liên kết thanh toán hợp lệ.");
      }

      // Điều hướng đến liên kết thanh toán
      navigation.navigate("WebViewScreen", { url: paymentLink });

      // Xóa đơn hàng đang chờ
      await AsyncStorage.removeItem("pendingOrder");
    } catch (error) {
      console.error("Lỗi:", error.message);
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header
        title={"Mã QR"}
        leftIcon={"arrow-back-outline"}
        colorBackground={"transparent"}
        colorText={COLORS.white}
        onPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} />
        ) : (
          <Text style={styles.loadingText}>
            Nhấn "Xác nhận thanh toán" để tạo mã QR
          </Text>
        )}
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Nhập ghi chú..."
        />
        <Text style={styles.totalText}>
          Số tiền thanh toán: {orderDetails?.totalPrice?.toLocaleString()}đ
        </Text>
      </View>
      <ButtonFloatBottom
        title="Xác nhận thanh toán"
        buttonColor={COLORS.green}
        onPress={handleConfirmPayment}
      />
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.grey,
    marginVertical: 20,
  },
  totalText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.green,
    marginVertical: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 8,
    fontFamily: FONTS.regular,
  },
});
