import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CheckoutScreen = ({ navigation }) => {
  const [currentPayment, setCurrentPayment] = useState("COD");
  const [userId, setUserId] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({});
  const [cartDetails, setCartDetails] = useState([]);
  const [detailedCartItems, setDetailedCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [tierInfo, setTierInfo] = useState(null);
  const [note, setNote] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false); // Ensure setLoading exist
  const [orderId, setOrderId] = useState(null); // Initialize orderId stat

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

  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { province: "", district: "", address: "" };
    const parts = fullAddress.split(", ");
    return {
      province: parts[0] || "",
      district: parts[1] || "",
      address: parts[2] || "",
    };
  };

  const { province, district, address } = parseAddress(deliveryInfo.address);

  const dataPayment = [
    { id: "COD", name: "Thanh toán khi nhận hàng" },
    { id: "QR", name: "Thanh toán qua QR code" },
  ];

  useEffect(() => {
    const getUserIdFromStorage = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          await fetchDeliveryInfo(storedUserId);
          await fetchCartDetails(storedUserId);
          await fetchTierInfo(storedUserId);
        } else {
          console.log("Không tìm thấy User ID trong AsyncStorage");
        }
      } catch (error) {
        console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
      }
    };
    getUserIdFromStorage();
  }, []);

  const fetchDeliveryInfo = async (id) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/getDeliveryInformationByUserId /${id}`
      );
      const data = await response.json();
      console.log("Delivery info:", data);
      setDeliveryInfo(data);
      fetchDeliveryFee(data); // Tính phí giao hàng sau khi nhận được thông tin
    } catch (error) {
      console.error("Error fetching delivery info:", error);
    }
  };

  const fetchCartDetails = async (id) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/getCartByUserId/${id}`
      );
      const cartData = await response.json();
      console.log("Cart details:", cartData);

      let total = 0;
      let items = [];

      for (const item of cartData) {
        if (item.quantity > 0) {
          const dishResponse = await fetchWithAuth(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${item.dishId}`
          );
          const dishData = await dishResponse.json();
          console.log("Dish data:", dishData);

          items.push({ ...dishData, quantity: item.quantity });
          total += dishData.price * item.quantity;
        }
      }

      setDetailedCartItems(items);
      setTotalPrice(total);
      setFinalPrice(total - total * discountRate); // Tính tổng sau chiết khấu
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  const fetchTierInfo = async (id) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membership/${id}`
      );
      const tierData = await response.json();
      console.log("Tier info:", tierData);

      if (tierData.tierId) {
        const tierResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membershipTier/${tierData.tierId}`
        );
        const tierDetails = await tierResponse.json();
        console.log("Tier details:", tierDetails);

        setTierInfo(tierDetails);
        setDiscountRate(tierDetails.discountRate);
        setFinalPrice(totalPrice - totalPrice * tierDetails.discountRate);
      }
    } catch (error) {
      console.log("Error fetching tier info:", error);
    }
  };

  const fetchDeliveryFee = async () => {
    try {
      const queryParams = new URLSearchParams({
        pick_province: "Hồ Chí Minh",
        pick_district: "Quận 9",
        province: deliveryInfo.province || "Hồ Chí Minh",
        district: deliveryInfo.district || "Quận 12",
        address: deliveryInfo.address || "338/10 Đ. Lê Thị Riêng",
        weight: 1000,
        value: totalPrice,
      }).toString();

      const response = await fetchWithAuth(
        `https://services.giaohangtietkiem.vn/services/shipment/fee?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: "35j4uHBQNjODAEOrWBlA23Sscp3TicIQ0k4mN2",
          },
        }
      );

      const data = await response.json();
      console.log("Dữ liệu phí giao hàng:", data);

      if (data && data.fee) {
        setDeliveryFee(data.fee.fee);
        setFinalPrice(totalPrice - totalPrice * discountRate + data.fee.fee);
      } else {
        Alert.alert("Lỗi", "Không thể lấy phí giao hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy phí giao hàng:", error);
    }
  };

  const handleCheckout = async () => {
    const validCartItems = detailedCartItems.filter(
      (item) => item.quantity > 0
    );

    if (validCartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng trống.");
      return;
    }

    const orderData = {
      userId,
      totalPrice: finalPrice,
      deliveryAddress: deliveryInfo.address || "Không có địa chỉ",
      note,
      deliveryFee,
      cartDetails: validCartItems,
    };

    try {
      console.log("Lưu thông tin đơn hàng vào AsyncStorage:", orderData); // Ghi log để kiểm tra
      await AsyncStorage.setItem("pendingOrder", JSON.stringify(orderData));
      console.log("Chuyển sang trang PaymentScreen với giá:", finalPrice); // Ghi log
      navigation.navigate("Payment", { finalPrice });
    } catch (error) {
      console.error("Lỗi khi lưu đơn hàng vào AsyncStorage:", error);
      Alert.alert("Lỗi", "Không thể lưu thông tin đơn hàng.");
    }
  };

  useEffect(() => {
    const discountAmount = totalPrice * discountRate;
    const adjustedFinalPrice = totalPrice - discountAmount + deliveryFee;
    setFinalPrice(adjustedFinalPrice);
  }, [totalPrice, discountRate, deliveryFee]);

  //chẹck

  const fetchLatestOrderId = async (userId) => {
    try {
      console.log("[DEBUG] Gọi API lấy danh sách đơn hàng...");
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] Lỗi từ API getOrderByUserId:", errorText);
        throw new Error("Không thể lấy danh sách đơn hàng.");
      }

      const orders = await response.json();
      console.log("[DEBUG] Danh sách đơn hàng nhận được:", orders);

      if (orders.length === 0) {
        console.log("[DEBUG] Không có đơn hàng nào.");
        return null;
      }

      // Tìm orderId mới nhất
      const latestOrder = orders.reduce((maxOrder, order) =>
        order.orderId > maxOrder.orderId ? order : maxOrder
      );

      console.log("[DEBUG] Order mới nhất:", latestOrder);
      return latestOrder.orderId;
    } catch (error) {
      console.error("Lỗi khi lấy orderId mới nhất:", error.message);
      Alert.alert("Lỗi", error.message || "Không thể lấy thông tin đơn hàng.");
      return null;
    }
  };

  //check

  const fetchOrderDetailsAndUpdateStatus = async (latestOrderId) => {
    try {
      console.log("[DEBUG] Kiểm tra trạng thái đơn hàng:", latestOrderId);

      // Gọi API kiểm tra thanh toán
      const paymentDetailResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${latestOrderId}`
      );

      if (!paymentDetailResponse.ok) {
        throw new Error("Không thể kiểm tra trạng thái thanh toán.");
      }

      const paymentDetails = await paymentDetailResponse.json();
      console.log("[DEBUG] Kết quả thanh toán:", paymentDetails);

      // Đảm bảo dữ liệu là một mảng và lấy phần tử đầu tiên
      const paymentDetail = paymentDetails[0];
      if (paymentDetail?.paymentStatus === "completed") {
        console.log("[DEBUG] Thanh toán đã hoàn tất, cập nhật trạng thái...");

        // Gọi API cập nhật trạng thái
        const updateResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${latestOrderId}`,
          {
            method: "PUT",
            body: JSON.stringify("pending"),
          }
        );

        if (updateResponse.ok) {
          console.log(
            "[DEBUG] Trạng thái đơn hàng đã được cập nhật thành công."
          );
          Alert.alert("Thông báo", "Trạng thái đơn hàng đã được cập nhật.");
        } else {
          const errorText = await updateResponse.text();
          console.error(
            "[DEBUG] Lỗi khi cập nhật trạng thái đơn hàng:",
            errorText
          );
          throw new Error("Không thể cập nhật trạng thái đơn hàng.");
        }
      } else {
        console.log("[DEBUG] Trạng thái thanh toán chưa hoàn tất.");
      }
    } catch (error) {
      console.error(
        "[DEBUG] Lỗi khi kiểm tra và cập nhật trạng thái:",
        error.message
      );
      Alert.alert(
        "Lỗi",
        error.message || "Có lỗi xảy ra trong quá trình xử lý đơn hàng."
      );
    }
  };

  const checkAndUpdateOrderStatus = async (orderId) => {
    try {
      console.log(`[DEBUG] Kiểm tra trạng thái đơn hàng: ${orderId}`);

      // Gọi API lấy thông tin thanh toán
      const paymentDetailResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${orderId}`
      );

      if (!paymentDetailResponse.ok) {
        console.error("[DEBUG] Lỗi khi gọi API lấy thông tin thanh toán.");
        throw new Error("Không thể kiểm tra trạng thái thanh toán.");
      }

      const paymentDetails = await paymentDetailResponse.json();
      console.log("[DEBUG] Kết quả thanh toán:", paymentDetails);

      // Đảm bảo dữ liệu là mảng và lấy phần tử đầu tiên
      const paymentDetail = paymentDetails[0];
      if (paymentDetail?.paymentStatus === "completed") {
        console.log("[DEBUG] Thanh toán đã hoàn tất, cập nhật trạng thái...");

        // Gọi API cập nhật trạng thái đơn hàng
        const updateResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${orderId}`,
          {
            method: "PUT",
            body: JSON.stringify("pending"), // Cập nhật trạng thái thành "pending"
          }
        );

        if (updateResponse.ok) {
          console.log(
            "[DEBUG] Trạng thái đơn hàng đã được cập nhật thành công."
          );
          Alert.alert(
            "Thông báo",
            "Trạng thái đơn hàng đã được cập nhật thành công."
          );
        } else {
          const errorText = await updateResponse.text();
          console.error(
            "[DEBUG] Lỗi khi cập nhật trạng thái đơn hàng:",
            errorText
          );
          throw new Error("Không thể cập nhật trạng thái đơn hàng.");
        }
      } else {
        console.log("[DEBUG] Trạng thái thanh toán chưa hoàn tất.");
      }
    } catch (error) {
      console.error(
        "[DEBUG] Lỗi trong quá trình kiểm tra và cập nhật trạng thái:",
        error.message
      );
      Alert.alert(
        "Lỗi",
        error.message || "Có lỗi xảy ra khi cập nhật trạng thái."
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy userId từ AsyncStorage
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) {
          console.error("[DEBUG] Không tìm thấy User ID.");
          return;
        }
        setUserId(storedUserId);

        // Lấy orderId mới nhất
        const latestOrderId = await fetchLatestOrderId(storedUserId);
        if (latestOrderId) {
          setOrderId(latestOrderId);

          // Kiểm tra và cập nhật trạng thái đơn hàng
          await fetchOrderDetailsAndUpdateStatus(latestOrderId);
        }
      } catch (error) {
        console.error("[DEBUG] Lỗi khi tải dữ liệu:", error.message);
      } finally {
        setLoading(false);
      }
    };

    // Gọi fetchData khi màn hình được focus
    const unsubscribe = navigation.addListener("focus", fetchData);

    return unsubscribe;
  }, [navigation]);

  return (
    <>
      <Header
        title={"Thanh toán"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"menu"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: COLORS.white, marginBottom: 120 }}
        contentContainerStyle={{ padding: 10 }}
      >
        <View style={styles.deliveryInfoContainer}>
          <Icon
            name="location-sharp"
            size={22}
            color={COLORS.orange}
            style={{ marginHorizontal: 5 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.textBold}>
              Tên: {deliveryInfo.username || "Người dùng"}
            </Text>
            <Text style={styles.text}>
              Số điện thoại: {deliveryInfo.phoneNumber || "N/A"}
            </Text>
            <Text style={styles.text}>
              Địa chỉ: {deliveryInfo.address || "Không xác định"}
            </Text>
          </View>
        </View>

        {tierInfo && (
          <View style={styles.tierInfoContainer}>
            <Text style={styles.textBold}>Bậc thành viên:</Text>
            <Text style={styles.text}>
              {`Bậc ${tierInfo.tierName} - Giảm giá: ${
                tierInfo.discountRate * 100
              }%`}
            </Text>
          </View>
        )}

        <View style={styles.noteContainer}>
          <Text style={styles.textBold}>Ghi chú</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              name="create-outline"
              size={22}
              color={COLORS.green}
              style={{ marginRight: 5 }}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập ghi chú"
              multiline
              value={note}
              onChangeText={(text) => setNote(text)}
            />
          </View>
        </View>

        <View style={styles.cartDetailsContainer}>
          {detailedCartItems.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.textNameDish}>{item.name}</Text>
                <Text style={styles.textDishType}>
                  {item.dishType || "Món ăn"}
                </Text>
                <Text style={styles.textDishPrice}>{item.price}đ</Text>
                <View style={styles.quantityContainer}>
                  <Text style={styles.textBold}>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.paymentMethodContainer}>
          <Text style={styles.textBold}>Phương thức thanh toán</Text>
          {dataPayment.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setCurrentPayment(item.id)}
              style={{
                ...styles.paymentOption,
                borderColor:
                  currentPayment === item.id ? COLORS.green : COLORS.greyPastel,
              }}
            >
              <Text style={styles.text}>{item.name}</Text>
              <Icon
                name={
                  currentPayment === item.id
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={currentPayment === item.id ? COLORS.green : COLORS.grey}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.totalContainer}>
          <Text style={styles.textBold}>Số tiền đã giảm:</Text>
          <Text style={{ ...styles.textBold, color: COLORS.green }}>
            {discountRate > 0
              ? (totalPrice * discountRate).toFixed(0) + "đ"
              : "0đ"}
          </Text>
        </View>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity style={styles.totalButton}>
            <Text style={styles.textBold}>Tổng thanh toán:</Text>
            <Text style={{ ...styles.textBold, color: COLORS.green }}>
              {finalPrice.toFixed(0)}đ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.textButton}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  deliveryInfoContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    flexDirection: "row",
    marginBottom: 10,
  },
  tierInfoContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: COLORS.lightGrey,
  },
  textBold: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginTop: 3,
  },
  noteContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  textInput: {
    fontFamily: FONTS.medium,
    height: 60,
    flex: 1,
  },
  cartDetailsContainer: {
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
  },
  itemImage: {
    width: 110,
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  },
  itemDetails: {
    padding: 5,
    marginLeft: 5,
    flex: 1,
  },
  textNameDish: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishType: {
    color: COLORS.grey,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishPrice: {
    color: COLORS.green,
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  quantityContainer: {
    flexDirection: "row",
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  paymentMethodContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  containerButtonFloatBottom: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
  },
  totalContainer: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 20,
  },
  boxButtonFloatBottom: {
    backgroundColor: COLORS.white,
    height: 80,
    flexDirection: "row",
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGrey,
  },
  totalButton: {
    width: "40%",
    backgroundColor: COLORS.white,
    alignItems: "flex-end",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  textButton: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.white,
  },
});
