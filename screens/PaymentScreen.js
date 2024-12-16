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
  TouchableOpacity,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import { ButtonFloatBottom } from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PaymentScreen = ({ navigation, route }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentPayment } = route.params || {}; // Lấy từ params
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

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);

      if (!userId) throw new Error("Không tìm thấy User ID.");
      if (!orderDetails) throw new Error("Không tìm thấy thông tin đơn hàng.");

      // Step 1: Tạo Order
      const orderData = {
        userId: parseInt(userId, 10),
        totalPrice: orderDetails.totalPrice,
        deliveryAddress: orderDetails.deliveryAddress || "Không có địa chỉ",
        note: orderDetails.note || "Không có ghi chú",
        deliveryFee: orderDetails.deliveryFee || 0,
        discountRate: orderDetails.discountRate || 0,
        discountPrice: orderDetails.discountPrice || 0,
        phoneNumber: orderDetails.phoneNumber || "Không có số điện thoại",
        receiverName: orderDetails.receiverName || "Không có tên người nhận",
        orderDate: new Date().toISOString(),
        status: "pending_payment", // Trạng thái mặc định ban đầu
      };

      const createOrderResponse = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/createOrderByCustomer",
        {
          method: "POST",
          body: JSON.stringify(orderData),
        }
      );

      if (!createOrderResponse.ok) {
        throw new Error("Không thể tạo đơn hàng.");
      }

      // Step 2: Lấy Order ID mới nhất
      const getOrdersResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
      );

      const orders = await getOrdersResponse.json();
      const latestOrder = orders.reduce((maxOrder, order) =>
        order.orderId > maxOrder.orderId ? order : maxOrder
      );
      const latestOrderId = latestOrder.orderId;

      // Step 3: Tạo OrderDetail
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
          throw new Error(
            `Không thể tạo chi tiết đơn hàng cho món: ${item.dishId}`
          );
        }
      }

      // Step 4: Xử lý thanh toán theo phương thức
      if (currentPayment === "COD") {
        // Tạo PaymentDetail cho COD
        const paymentDetailData = {
          orderId: latestOrderId,
          paymentMethod: "COD",
          paymentStatus: "pending", // Thanh toán COD sẽ ở trạng thái pending
          transactionId: "",
          paymentDate: new Date().toISOString(),
          amount: orderDetails.totalPrice,
          refundAmount: 0,
          returnUrl: "",
          cancelUrl: "",
        };

        const createPaymentDetailResponse = await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/create-payment-detail",
          {
            method: "POST",
            body: JSON.stringify(paymentDetailData),
          }
        );

        if (!createPaymentDetailResponse.ok) {
          throw new Error("Không thể tạo thông tin thanh toán COD.");
        }

        // Hiển thị popup thành công
        Alert.alert(
          "Thanh toán thành công",
          "Đơn hàng của bạn sẽ được xử lý. Cảm ơn bạn!",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Order"), // Quay lại CheckoutScreen
            },
          ]
        );
      } else if (currentPayment === "QR") {
        // Tạo Payment Link cho QR
        const paymentData = {
          orderId: latestOrderId,
          decryptionKey: "Sav3CtqBonMF3f41HaoxABIi8NKVUMBU1MOHBi1qmf0=",
        };

        const paymentResponse = await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/checkout",
          {
            method: "POST",
            body: JSON.stringify(paymentData),
          }
        );

        if (!paymentResponse.ok) {
          throw new Error("Không thể tạo mã QR.");
        }

        const paymentLink = await paymentResponse.text();

        // Điều hướng đến WebViewScreen để hiển thị QR Code
        navigation.navigate("WebViewScreen", { url: paymentLink });
      }
    } catch (error) {
      console.error("Lỗi:", error.message);
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentPayment) {
      console.error("Phương thức thanh toán không xác định!");
      Alert.alert(
        "Lỗi",
        "Không xác định được phương thức thanh toán. Vui lòng quay lại và thử lại."
      );
      navigation.goBack(); // Quay lại màn hình trước đó
    }
  }, [currentPayment]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header
        title={"Xác nhận thanh toán"}
        colorBackground={"transparent"}
        colorText={COLORS.green}
        onPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesHeader}>Quy định thanh toán:</Text>
          {currentPayment === "QR" ? (
            <>
              <Text style={styles.rulesText}>
                1/ Khi bạn chọn thanh toán QR CODE cho đơn hàng này, sau khi
                thanh toán thành công nếu bạn hủy đơn hàng thì phải liên hệ cho
                VA qua những phương thức ở trang "Contact Us" để VA kịp thời hỗ
                trợ việc hoàn tiền.
              </Text>
              <Text style={styles.rulesText}>
                2/ Nếu bạn không liên hệ cho VA thì sẽ mất vài ngày để có thể xử
                lý.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("ContactUs")}
              >
                <Text
                  style={[
                    styles.rulesText,
                    { color: COLORS.green, textDecorationLine: "underline" },
                  ]}
                >
                  3/ Truy cập "Contact Us" ở đây.
                </Text>
              </TouchableOpacity>
            </>
          ) : currentPayment === "COD" ? (
            <>
              <Text style={styles.rulesText}>
                1/ Món ăn giao tới khách hàng sẽ không thể hoàn trả.
              </Text>
              <Text style={styles.rulesText}>
                2/ Shipper giao tới, khách hàng nhận món ăn xong mới thanh toán
                cho shipper.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("ContactUs")}
              >
                <Text
                  style={[
                    styles.rulesText,
                    { color: COLORS.green, textDecorationLine: "underline" },
                  ]}
                >
                  3/ Nếu có vấn đề , thắc mắc về thanh hãy truy cập "Contact Us"
                  ở đây để liên hệ với VA.
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.rulesText}>
              Không xác định được phương thức thanh toán. Vui lòng quay lại và
              thử lại.
            </Text>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} />
        ) : (
          <Text style={styles.loadingText}>
            Nhấn "Xác nhận thanh toán" để thực hiện thanh toán
          </Text>
        )}
        <Text style={styles.totalText}>
          Số tiền thanh toán: {orderDetails?.totalPrice?.toLocaleString()}vnđ
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
  rulesContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey,
    paddingTop: 10,
  },
  rulesHeader: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: COLORS.green,
    marginBottom: 5,
  },
  rulesText: {
    fontSize: 20,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginBottom: 10,
    textAlign: "justify",
  },
});
