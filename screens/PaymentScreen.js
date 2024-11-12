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

const windowHeight = Dimensions.get("window").height;

const PaymentScreen = ({ navigation }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("Chuyển tiền cho đơn hàng tại VA");
  const [userId, setUserId] = useState(null);

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

  // Lấy thông tin đơn hàng từ AsyncStorage
  const fetchOrderDetails = async () => {
    try {
      const storedOrder = await AsyncStorage.getItem("pendingOrder");
      console.log("Dữ liệu từ AsyncStorage:", storedOrder);

      if (storedOrder) {
        const parsedOrder = JSON.parse(storedOrder);
        console.log("Dữ liệu sau khi parse:", parsedOrder);

        // Kiểm tra và gán giá trị cho items từ cartDetails
        if (!parsedOrder.cartDetails || parsedOrder.cartDetails.length === 0) {
          throw new Error("Giỏ hàng trống hoặc không hợp lệ.");
        }

        setOrderDetails({
          ...parsedOrder,
          items: parsedOrder.cartDetails, // Gán cartDetails vào items
        });

        // Tạo QR code
        generateQrCodeUrl(parsedOrder.totalPrice);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy thông tin đơn hàng.");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đơn hàng:", error.message);
      Alert.alert("Lỗi", "Không thể lấy thông tin đơn hàng.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          await fetchOrderDetails();
        } else {
          Alert.alert("Lỗi", "Không tìm thấy User ID.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error.message);
      }
    };
    fetchData();
  }, []);

  // Tạo URL QR Code
  const generateQrCodeUrl = (amount) => {
    setLoading(true);
    const bankId = "970422";
    const accountNo = "0975899130";
    const accountName = "NGUYEN HAI LONG";
    const template = "sapwdeR";

    const qrUrl = `https://api.vietqr.io/image/${bankId}-${accountNo}-${template}.jpg?accountName=${encodeURIComponent(
      accountName
    )}&amount=${amount}&addInfo=${encodeURIComponent(note)}`;

    setQrCodeUrl(qrUrl);
    setLoading(false);
  };

  // Xác nhận thanh toán
  const handleConfirmPayment = async () => {
    try {
      setLoading(true);

      if (!userId) {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) throw new Error("Không tìm thấy User ID.");
        setUserId(storedUserId);
      }

      if (!orderDetails) throw new Error("Không tìm thấy thông tin đơn hàng.");

      const orderData = {
        userId: parseInt(userId, 10),
        totalPrice: orderDetails.totalPrice,
        deliveryAddress: orderDetails.deliveryAddress || "Không có địa chỉ",
        note: note || "Không có ghi chú",
        deliveryFee: orderDetails.deliveryFee || 0,
        orderDate: new Date().toISOString(),
        status: "paid",
      };

      // Tạo mới đơn hàng
      const createOrderResponse = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/createOrderByCustomer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

      // Log để kiểm tra `latestOrderId`
      console.log("Order ID mới nhất:", latestOrderId);

      // Gửi từng chi tiết đơn hàng
      const detailedCartItems = orderDetails.items || [];
      for (const item of detailedCartItems) {
        try {
          const orderDetailData = {
            orderId: latestOrderId,
            dishId: item.dishId,
            quantity: item.quantity,
            price: item.price,
          };

          // Log dữ liệu trước khi gửi API
          console.log(
            "Dữ liệu gửi vào API createOrderDetail:",
            orderDetailData
          );

          const createOrderDetailResponse = await fetchWithAuth(
            "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/createOrderDetail",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(orderDetailData),
            }
          );

          const responseJson = await createOrderDetailResponse
            .json()
            .catch(() => null);
          console.log("Phản hồi API createOrderDetail:", {
            status: createOrderDetailResponse.status,
            body: responseJson,
          });

          if (!createOrderDetailResponse.ok) {
            console.error(
              `Không thể tạo chi tiết đơn hàng cho món: ${item.dishId}. Status: ${createOrderDetailResponse.status}, Response: ${responseJson}`
            );
          }
        } catch (error) {
          console.error("Lỗi khi tạo chi tiết đơn hàng:", error.message);
        }
      }

      // Xóa đơn hàng đang chờ
      await AsyncStorage.removeItem("pendingOrder");

      Alert.alert("Thành công", "Đơn hàng đã được thanh toán!", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (error) {
      console.error("Lỗi:", error.message);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header
        title={"Mã QR"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"qr-code-outline"}
        colorBackground={"transparent"}
        colorText={COLORS.white}
        onPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} />
        ) : qrCodeUrl ? (
          <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
        ) : (
          <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
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
  qrImage: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grey,
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
