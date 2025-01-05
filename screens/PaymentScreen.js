import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import { ButtonFloatBottom } from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PaymentScreen = ({ navigation, route }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentPayment } = route.params || {};
  const [userId, setUserId] = useState(null);
  const [latestOrderId, setLatestOrderId] = useState(null);

  // Hàm fetch kèm token
  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("Không tìm thấy token.");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };
    console.log(`API Request: ${url}`); // Log API request URL
    return fetch(url, { ...options, headers });
  };

  // Lấy thông tin giỏ hàng từ AsyncStorage (pendingOrder)
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

  // Lấy userId và thông tin đơn hàng
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

  // Hàm confirm thanh toán chính
  const handleConfirmPayment = async () => {
    try {
      // Chặn double-click
      if (loading) return;
      setLoading(true);

      if (!userId) throw new Error("Không tìm thấy User ID.");
      if (!orderDetails) throw new Error("Không tìm thấy thông tin đơn hàng.");

      // Bước 1: Tạo Order (code cũ giữ nguyên)
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
        status: "pending_payment",
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

      // Bước 2: Lấy Order mới tạo
      const getOrdersResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
      );
      if (!getOrdersResponse.ok) {
        throw new Error("Không thể lấy thông tin đơn hàng từ server.");
      }

      const orders = await getOrdersResponse.json();
      const latestOrder = orders.reduce((maxOrder, order) =>
        order.orderId > maxOrder.orderId ? order : maxOrder
      );
      const newOrderId = latestOrder.orderId;
      setLatestOrderId(newOrderId);

      // Bước 3: Tạo OrderDetail cho từng món ăn (code cũ giữ nguyên)
      const detailedCartItems = orderDetails.items || [];
      for (const item of detailedCartItems) {
        const orderDetailData = {
          orderId: newOrderId,
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

      // Bước 4: Tùy theo phương thức thanh toán
      if (currentPayment === "Wallet") {
        // Với WALLET: KHÔNG gọi /payment/create nữa
        // -> Gọi hàm xử lý ví (logic mới)
        await processWalletPayment(newOrderId);
      } else {
        // Trường hợp COD, VnPay, QR -> Vẫn tạo PaymentDetail như cũ
        const paymentDetailData = {
          orderId: newOrderId,
          paymentMethod: currentPayment, // COD, VnPay, QR
          paymentStatus: "pending",
          transactionId: "",
          paymentDate: new Date().toISOString(),
          amount: orderDetails.totalPrice,
          refundAmount: 0,
          returnUrl: "",
          cancelUrl: "",
        };

        // Tạo PaymentDetail
        const createPaymentDetailResponse = await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/create",
          {
            method: "POST",
            body: JSON.stringify(paymentDetailData),
          }
        );
        if (!createPaymentDetailResponse.ok) {
          throw new Error("Không thể tạo thông tin thanh toán");
        }

        // Logic cũ cho từng loại thanh toán
        if (currentPayment === "COD") {
          Alert.alert(
            "Thanh toán thành công",
            "Đơn hàng của bạn sẽ được xử lý. Cảm ơn bạn!",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate("Order"),
              },
            ]
          );
        } else if (currentPayment === "QR") {
          // Tạo Payment Link cho QR
          const paymentData = {
            orderId: newOrderId,
            decryptionKey: "Sav3CtqBonMF3f41HaoxABIi8NKVUMBU1MOHBi1qmf0=",
          };
          const paymentResponse = await fetchWithAuth(
            "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/pay-os",
            {
              method: "POST",
              body: JSON.stringify(paymentData),
            }
          );
          if (!paymentResponse.ok) {
            throw new Error("Không thể tạo mã QR.");
          }
          const paymentLink = await paymentResponse.text();
          navigation.navigate("WebViewScreen", { url: paymentLink });
        } else if (currentPayment === "VnPay") {
          // Tạo Payment Link cho VnPay
          const paymentData = { orderId: newOrderId };
          const paymentResponse = await fetchWithAuth(
            "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/vnpay",
            {
              method: "POST",
              body: JSON.stringify(paymentData),
            }
          );
          if (!paymentResponse.ok) {
            throw new Error("Không thể chuyển sang trang thanh toán VnPay.");
          }
          const paymentLink = await paymentResponse.text();
          navigation.navigate("WebViewScreen", { url: paymentLink });
        }
      }
    } catch (error) {
      console.error("Lỗi:", error.message);
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý thanh toán ví (Wallet) - LOGIC MỚI
  const processWalletPayment = async (orderId) => {
    try {
      // 1. Gọi /payment/wallet để tạo PaymentDetail
      const walletPaymentResponse = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/wallet",
        {
          method: "POST",
          body: JSON.stringify({
            orderId: orderId,
            userId: parseInt(userId, 10),
          }),
        }
      );
      if (!walletPaymentResponse.ok) {
        throw new Error("Không thể tạo paymentDetail cho ví.");
      }
      const walletPaymentData = await walletPaymentResponse.json();
      console.log("walletPaymentData:", walletPaymentData);

      // Lấy paymentId từ response
      const paymentId = walletPaymentData?.content?.paymentId;
      if (!paymentId) {
        throw new Error("Không tìm thấy paymentId từ API /payment/wallet.");
      }

      // 2. Gọi /payment/wallet/result để confirm thanh toán
      const walletResultBody = {
        userId: parseInt(userId, 10),
        paymentId: paymentId,
        statusCode: 1, // Hardcode 1 = “thanh toán thành công”
      };
      console.log("API Request Body (wallet/result):", walletResultBody);

      const walletResultResponse = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/wallet/result",
        {
          method: "POST",
          body: JSON.stringify(walletResultBody),
        }
      );
      if (!walletResultResponse.ok) {
        throw new Error("Không thể hoàn tất thanh toán ví.");
      }

      // Thành công -> Thông báo & điều hướng
      Alert.alert(
        "Thanh toán thành công",
        "Đơn hàng của bạn đã được thanh toán bằng ví thành công!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Order"),
          },
        ]
      );
    } catch (error) {
      console.error("Lỗi:", error.message);
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi thanh toán ví.");
    }
  };

  // Kiểm tra phương thức thanh toán (nếu null -> báo lỗi)
  useEffect(() => {
    if (!currentPayment) {
      console.error("Phương thức thanh toán không xác định!");
      Alert.alert(
        "Lỗi",
        "Không xác định được phương thức thanh toán. Vui lòng quay lại và thử lại."
      );
      navigation.goBack();
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
        {/* Code cũ phần hiển thị điều khoản (rules) */}
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesHeader}>Quy định thanh toán:</Text>
          {currentPayment === "QR" && (
            <>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>1</Text>
                <Text style={styles.rulesText}>
                  Khi bạn chọn thanh toán QR CODE, nếu hủy đơn hàng sau khi
                  thanh toán thành công, vui lòng liên hệ VA qua trang "Liên hệ"
                  để được hỗ trợ hoàn tiền kịp thời.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>2</Text>
                <Text style={styles.rulesText}>
                  Nếu không liên hệ, việc xử lý hoàn tiền có thể mất vài ngày.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>3</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ContactUs")}
                >
                  <Text style={styles.rulesLink}>
                    Liên hệ VA qua đường dẫn này nếu có thắc mắc.
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {currentPayment === "COD" && (
            <>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>1</Text>
                <Text style={styles.rulesText}>
                  Món ăn đã giao không được hoàn trả.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>2</Text>
                <Text style={styles.rulesText}>
                  Quý khách thanh toán cho shipper sau khi nhận món.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>3</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ContactUs")}
                >
                  <Text style={styles.rulesLink}>
                    Liên hệ VA qua đường dẫn này nếu có thắc mắc.
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {currentPayment === "VnPay" && (
            <>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>1</Text>
                <Text style={styles.rulesText}>
                  Bạn sẽ được chuyển đến trang thanh toán an toàn của VnPay.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>2</Text>
                <Text style={styles.rulesText}>
                  Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi xác nhận
                  thanh toán trên VnPay.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>3</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ContactUs")}
                >
                  <Text style={styles.rulesLink}>
                    Liên hệ VA qua đường dẫn này nếu có thắc mắc.
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {currentPayment === "Wallet" && (
            <>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>1</Text>
                <Text style={styles.rulesText}>
                  Bạn đã chọn thanh toán bằng ví của VA.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>2</Text>
                <Text style={styles.rulesText}>
                  Sau khi xác nhận, số dư ví sẽ được trừ và không thể hoàn trả
                  tự động (nếu có thắc mắc vui lòng liên hệ).
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>3</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ContactUs")}
                >
                  <Text style={styles.rulesLink}>
                    Liên hệ VA qua đường dẫn này nếu có thắc mắc.
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {!["QR", "COD", "VnPay", "Wallet"].includes(currentPayment) && (
            <Text style={styles.rulesText}>
              Không xác định được phương thức thanh toán. Vui lòng quay lại và
              thử lại.
            </Text>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} />
        ) : (
          <Text style={styles.confirmText}>
            Nhấn "Xác nhận thanh toán" để thực hiện thanh toán
          </Text>
        )}
        <Text style={styles.totalText}>
          Số tiền thanh toán: {orderDetails?.totalPrice?.toLocaleString()} đ
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
    padding: 20,
    backgroundColor: COLORS.white,
  },
  rulesContainer: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rulesHeader: {
    fontSize: 22,
    fontFamily: FONTS.semiBold,
    color: COLORS.green,
    marginBottom: 15,
    textAlign: "center",
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  ruleNumber: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.green,
    marginRight: 8,
    width: 20,
    textAlign: "center",
  },
  rulesText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    flex: 1,
    lineHeight: 24,
    textAlign: "left",
  },
  rulesLink: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    textDecorationLine: "underline",
    flex: 1,
    lineHeight: 24,
    textAlign: "left",
  },
  confirmText: {
    fontSize: 16,
    color: COLORS.grey,
    marginVertical: 20,
    textAlign: "center",
  },
  totalText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
    marginBottom: 30,
  },
});

// import React, { useEffect, useState } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import COLORS from "../constants/color";
// import FONTS from "../constants/font";
// import Header from "../components/Header";
// import { ButtonFloatBottom } from "../components/Button";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const PaymentScreen = ({ navigation, route }) => {
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const { currentPayment } = route.params || {};
//   const [userId, setUserId] = useState(null);
//   const [latestOrderId, setLatestOrderId] = useState(null);

//   const fetchWithAuth = async (url, options = {}) => {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Không tìm thấy token.");
//     const headers = {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//       ...options.headers,
//     };
//     console.log(`API Request: ${url}`); // Log API request URL
//     return fetch(url, { ...options, headers });
//   };

//   const fetchOrderDetails = async () => {
//     try {
//       const storedOrder = await AsyncStorage.getItem("pendingOrder");
//       if (!storedOrder) {
//         throw new Error("Không tìm thấy thông tin đơn hàng.");
//       }
//       const parsedOrder = JSON.parse(storedOrder);
//       if (!parsedOrder.cartDetails || parsedOrder.cartDetails.length === 0) {
//         throw new Error("Giỏ hàng trống hoặc không hợp lệ.");
//       }
//       setOrderDetails({
//         ...parsedOrder,
//         items: parsedOrder.cartDetails,
//       });
//     } catch (error) {
//       console.error("Lỗi khi lấy thông tin đơn hàng:", error.message);
//       Alert.alert("Lỗi", error.message || "Không thể lấy thông tin đơn hàng.");
//       navigation.goBack();
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const storedUserId = await AsyncStorage.getItem("userId");
//         if (!storedUserId) throw new Error("Không tìm thấy User ID.");
//         setUserId(storedUserId);
//         await fetchOrderDetails();
//       } catch (error) {
//         console.error("Lỗi khi tải dữ liệu:", error.message);
//         Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu.");
//         navigation.goBack();
//       }
//     };
//     fetchData();
//   }, []);

//   const handleConfirmPayment = async () => {
//     try {
//       setLoading(true);

//       if (!userId) throw new Error("Không tìm thấy User ID.");
//       if (!orderDetails) throw new Error("Không tìm thấy thông tin đơn hàng.");

//       const orderData = {
//         userId: parseInt(userId, 10),
//         totalPrice: orderDetails.totalPrice,
//         deliveryAddress: orderDetails.deliveryAddress || "Không có địa chỉ",
//         note: orderDetails.note || "Không có ghi chú",
//         deliveryFee: orderDetails.deliveryFee || 0,
//         discountRate: orderDetails.discountRate || 0,
//         discountPrice: orderDetails.discountPrice || 0,
//         phoneNumber: orderDetails.phoneNumber || "Không có số điện thoại",
//         receiverName: orderDetails.receiverName || "Không có tên người nhận",
//         orderDate: new Date().toISOString(),
//         status: "pending_payment",
//       };

//       // Tạo Order
//       const createOrderResponse = await fetchWithAuth(
//         "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/createOrderByCustomer",
//         {
//           method: "POST",
//           body: JSON.stringify(orderData),
//         }
//       );

//       if (!createOrderResponse.ok) {
//         throw new Error("Không thể tạo đơn hàng.");
//       }
//       // Step 2: Lấy Order ID mới nhất
//       const getOrdersResponse = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
//       );

//       if (!getOrdersResponse.ok) {
//         throw new Error("Không thể lấy thông tin đơn hàng từ server.");
//       }

//       const orders = await getOrdersResponse.json();
//       const latestOrder = orders.reduce((maxOrder, order) =>
//         order.orderId > maxOrder.orderId ? order : maxOrder
//       );
//       const latestOrderId = latestOrder.orderId;
//       setLatestOrderId(latestOrderId);

//       // Tạo OrderDetail cho từng món ăn
//       const detailedCartItems = orderDetails.items || [];
//       for (const item of detailedCartItems) {
//         const orderDetailData = {
//           orderId: latestOrderId,
//           dishId: item.dishId,
//           quantity: item.quantity,
//           price: item.price,
//         };

//         const createOrderDetailResponse = await fetchWithAuth(
//           "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/createOrderDetail",
//           {
//             method: "POST",
//             body: JSON.stringify(orderDetailData),
//           }
//         );

//         if (!createOrderDetailResponse.ok) {
//           throw new Error(
//             `Không thể tạo chi tiết đơn hàng cho món: ${item.dishId}`
//           );
//         }
//       }
//       // Create PaymentDetail
//       const paymentDetailData = {
//         orderId: latestOrderId,
//         paymentMethod: currentPayment, // Set Payment Method depend on current payment method
//         paymentStatus: "pending",
//         transactionId: "",
//         paymentDate: new Date().toISOString(),
//         amount: orderDetails.totalPrice,
//         refundAmount: 0,
//         returnUrl: "",
//         cancelUrl: "",
//       };

//       const createPaymentDetailResponse = await fetchWithAuth(
//         "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/create",
//         {
//           method: "POST",
//           body: JSON.stringify(paymentDetailData),
//         }
//       );
//       if (!createPaymentDetailResponse.ok) {
//         throw new Error("Không thể tạo thông tin thanh toán");
//       }
//       // Xử lý thanh toán theo phương thức
//       if (currentPayment === "COD") {
//         // Hiển thị popup thành công
//         Alert.alert(
//           "Thanh toán thành công",
//           "Đơn hàng của bạn sẽ được xử lý. Cảm ơn bạn!",
//           [
//             {
//               text: "OK",
//               onPress: () => navigation.navigate("Order"),
//             },
//           ]
//         );
//       } else if (currentPayment === "QR") {
//         // Tạo Payment Link cho QR
//         const paymentData = {
//           orderId: latestOrderId,
//           decryptionKey: "Sav3CtqBonMF3f41HaoxABIi8NKVUMBU1MOHBi1qmf0=",
//         };

//         const paymentResponse = await fetchWithAuth(
//           "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/pay-os",
//           {
//             method: "POST",
//             body: JSON.stringify(paymentData),
//           }
//         );

//         if (!paymentResponse.ok) {
//           throw new Error("Không thể tạo mã QR.");
//         }

//         const paymentLink = await paymentResponse.text();
//         navigation.navigate("WebViewScreen", { url: paymentLink });
//       } else if (currentPayment === "VnPay") {
//         // Tạo Payment Link cho VnPay
//         const paymentData = {
//           orderId: latestOrderId,
//         };

//         const paymentResponse = await fetchWithAuth(
//           "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/vnpay",
//           {
//             method: "POST",
//             body: JSON.stringify(paymentData),
//           }
//         );

//         if (!paymentResponse.ok) {
//           throw new Error("Không thể chuyển sang trang thanh toán VnPay.");
//         }

//         const paymentLink = await paymentResponse.text();
//         navigation.navigate("WebViewScreen", { url: paymentLink });
//       } else if (currentPayment === "Wallet") {
//         // Gọi API getPaymentDetailByOrderId ngay sau khi tạo đơn hàng thành công và có latestOrderId
//         await processWalletPayment(latestOrderId);
//       }
//     } catch (error) {
//       console.error("Lỗi:", error.message);
//       Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi thanh toán.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processWalletPayment = async (orderId) => {
//     try {
//       // 1. Get PaymentDetailByOrderId
//       const paymentDetailResponse = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${orderId}`
//       );

//       if (!paymentDetailResponse.ok) {
//         throw new Error("Không thể lấy thông tin thanh toán.");
//       }

//       const paymentDetail = await paymentDetailResponse.json();
//       const paymentId = paymentDetail[0]?.paymentId;

//       if (!paymentId) {
//         throw new Error("Không tìm thấy Payment ID.");
//       }
//       // 2. Call /payment/wallet
//       const walletPaymentResponse = await fetchWithAuth(
//         "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/wallet",
//         {
//           method: "POST",
//           body: JSON.stringify({
//             orderId: orderId,
//             userId: parseInt(userId, 10),
//           }),
//         }
//       );
//       if (!walletPaymentResponse.ok) {
//         throw new Error("Không thể thực hiện thanh toán ví.");
//       }
//       const walletPaymentData = await walletPaymentResponse.json();

//       // 3. Call /payment/wallet/result
//       const walletResultBody = {
//         userId: parseInt(userId, 10),
//         paymentId: paymentId,
//         statusCode: 1, // Hardcode status code as 1
//       };
//       console.log("API Request Body (wallet/result):", walletResultBody);

//       const walletResultResponse = await fetchWithAuth(
//         "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payment/wallet/result",
//         {
//           method: "POST",
//           body: JSON.stringify(walletResultBody),
//         }
//       );

//       if (!walletResultResponse.ok) {
//         throw new Error("Không thể hoàn tất thanh toán ví.");
//       }
//       // Thành công, điều hướng người dùng
//       Alert.alert(
//         "Thanh toán thành công",
//         "Đơn hàng của bạn đã được thanh toán bằng ví thành công!",
//         [
//           {
//             text: "OK",
//             onPress: () => navigation.navigate("Order"),
//           },
//         ]
//       );
//     } catch (error) {
//       console.error("Lỗi:", error.message);
//       Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi thanh toán ví.");
//     }
//   };

//   useEffect(() => {
//     if (!currentPayment) {
//       console.error("Phương thức thanh toán không xác định!");
//       Alert.alert(
//         "Lỗi",
//         "Không xác định được phương thức thanh toán. Vui lòng quay lại và thử lại."
//       );
//       navigation.goBack();
//     }
//   }, [currentPayment]);

//   return (
//     <View style={{ flex: 1, backgroundColor: COLORS.white }}>
//       <Header
//         title={"Xác nhận thanh toán"}
//         colorBackground={"transparent"}
//         colorText={COLORS.green}
//         onPress={() => navigation.goBack()}
//       />
//       <View style={styles.content}>
//         <View style={styles.rulesContainer}>
//           <Text style={styles.rulesHeader}>Quy định thanh toán:</Text>
//           {currentPayment === "QR" && (
//             <>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>1</Text>
//                 <Text style={styles.rulesText}>
//                   Khi bạn chọn thanh toán QR CODE, nếu hủy đơn hàng sau khi
//                   thanh toán thành công, vui lòng liên hệ VA qua trang "Liên hệ"
//                   để được hỗ trợ hoàn tiền kịp thời.
//                 </Text>
//               </View>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>2</Text>
//                 <Text style={styles.rulesText}>
//                   Nếu không liên hệ, việc xử lý hoàn tiền có thể mất vài ngày.
//                 </Text>
//               </View>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>3</Text>
//                 <TouchableOpacity
//                   onPress={() => navigation.navigate("ContactUs")}
//                 >
//                   <Text style={styles.rulesLink}>
//                     Liên hệ VA qua đường dẫn này nếu có thắc mắc.
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </>
//           )}

//           {currentPayment === "COD" && (
//             <>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>1</Text>
//                 <Text style={styles.rulesText}>
//                   Món ăn đã giao không được hoàn trả.
//                 </Text>
//               </View>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>2</Text>
//                 <Text style={styles.rulesText}>
//                   Quý khách thanh toán cho shipper sau khi nhận món.
//                 </Text>
//               </View>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>3</Text>
//                 <TouchableOpacity
//                   onPress={() => navigation.navigate("ContactUs")}
//                 >
//                   <Text style={styles.rulesLink}>
//                     Liên hệ VA qua đường dẫn này nếu có thắc mắc.
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </>
//           )}

//           {currentPayment === "VnPay" && (
//             <>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>1</Text>
//                 <Text style={styles.rulesText}>
//                   Bạn sẽ được chuyển đến trang thanh toán an toàn của VnPay.
//                 </Text>
//               </View>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>2</Text>
//                 <Text style={styles.rulesText}>
//                   Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi xác nhận
//                   thanh toán trên VnPay.
//                 </Text>
//               </View>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>3</Text>
//                 <TouchableOpacity
//                   onPress={() => navigation.navigate("ContactUs")}
//                 >
//                   <Text style={styles.rulesLink}>
//                     Liên hệ VA qua đường dẫn này nếu có thắc mắc.
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </>
//           )}

//           {currentPayment === "Wallet" && (
//             <>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>1</Text>
//                 <Text style={styles.rulesText}>
//                   Bạn đã chọn thanh toán bằng ví của VA.
//                 </Text>
//               </View>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>2</Text>
//                 <Text style={styles.rulesText}>
//                   Bạn sẽ không thể hoàn trả sau khi thanh toán.
//                 </Text>
//               </View>
//               <View style={styles.ruleItem}>
//                 <Text style={styles.ruleNumber}>3</Text>
//                 <TouchableOpacity
//                   onPress={() => navigation.navigate("ContactUs")}
//                 >
//                   <Text style={styles.rulesLink}>
//                     Liên hệ VA qua đường dẫn này nếu có thắc mắc.
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </>
//           )}

//           {!["QR", "COD", "VnPay", "Wallet"].includes(currentPayment) && (
//             <Text style={styles.rulesText}>
//               Không xác định được phương thức thanh toán. Vui lòng quay lại và
//               thử lại.
//             </Text>
//           )}
//         </View>

//         {loading ? (
//           <ActivityIndicator size="large" color={COLORS.green} />
//         ) : (
//           <Text style={styles.confirmText}>
//             Nhấn "Xác nhận thanh toán" để thực hiện thanh toán
//           </Text>
//         )}
//         <Text style={styles.totalText}>
//           Số tiền thanh toán: {orderDetails?.totalPrice?.toLocaleString()} đ
//         </Text>
//       </View>
//       <ButtonFloatBottom
//         title="Xác nhận thanh toán"
//         buttonColor={COLORS.green}
//         onPress={handleConfirmPayment}
//       />
//     </View>
//   );
// };

// export default PaymentScreen;

// const styles = StyleSheet.create({
//   content: {
//     flex: 1,
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: COLORS.white,
//   },
//   rulesContainer: {
//     width: "100%",
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 20,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   rulesHeader: {
//     fontSize: 22,
//     fontFamily: FONTS.semiBold,
//     color: COLORS.green,
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   ruleItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 12,
//   },
//   ruleNumber: {
//     fontSize: 16,
//     fontFamily: FONTS.bold,
//     color: COLORS.green,
//     marginRight: 8,
//     width: 20,
//     textAlign: "center",
//   },
//   rulesText: {
//     fontSize: 16,
//     fontFamily: FONTS.regular,
//     color: COLORS.black,
//     flex: 1,
//     lineHeight: 24,
//     textAlign: "left",
//   },
//   rulesLink: {
//     fontSize: 16,
//     fontFamily: FONTS.medium,
//     color: COLORS.primary,
//     textDecorationLine: "underline",
//     flex: 1,
//     lineHeight: 24,
//     textAlign: "left",
//   },
//   confirmText: {
//     fontSize: 16,
//     color: COLORS.grey,
//     marginVertical: 20,
//     textAlign: "center",
//   },
//   totalText: {
//     fontSize: 18,
//     fontFamily: FONTS.semiBold,
//     color: COLORS.primary,
//     marginBottom: 30,
//   },
// });
