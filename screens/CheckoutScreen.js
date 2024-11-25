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
import { Dropdown } from "react-native-element-dropdown";

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
  const [discountOptions, setDiscountOptions] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(0);

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

  const discountColors = {
    0: { color: COLORS.grey, text: "Không sử dụng giảm giá" },
    0.1: { color: COLORS.green, text: "Giảm giá 10%" },
    0.2: { color: COLORS.star, text: "Giảm giá 20%" },
    0.3: { color: COLORS.orange, text: "Giảm giá 30%" },
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
          // await fetchTierInfo(storedUserId);
          await fetchDiscountHistory(storedUserId);
        } else {
          console.log("Không tìm thấy User ID trong AsyncStorage");
        }
      } catch (error) {
        console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
      }
    };
    getUserIdFromStorage();
  }, []);

  const fetchCoordinates = async (address) => {
    if (!address) {
      console.error("Địa chỉ không hợp lệ.");
      return null;
    }

    try {
      // Gọi OpenCage Geocoder API
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          address
        )}&key=8c52d2ca976a45b08c2b774e6167ca75`
      );

      if (!response.ok) {
        throw new Error("Không thể gọi OpenCage API.");
      }

      const data = await response.json();
      console.log("OpenCage API response:", data);

      // Kiểm tra kết quả và lấy tọa độ
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        console.log("Tọa độ:", { latitude: lat, longitude: lng });
        return { latitude: lat, longitude: lng };
      } else {
        console.error("Không tìm thấy tọa độ cho địa chỉ này.");
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi gọi OpenCage API:", error.message);
      return null;
    }
  };

  const fetchDeliveryFee = async (customerAddress) => {
    try {
      console.log("Địa chỉ khách hàng:", customerAddress);

      // Store's fixed location (FPT University, District 9)
      const shopLocation = {
        latitude: 10.84102,
        longitude: 106.80606,
      };

      // Get customer coordinates from their address
      const customerLocation = await fetchCoordinates(customerAddress);
      if (!customerLocation) {
        Alert.alert("Lỗi", "Không thể lấy tọa độ từ địa chỉ khách hàng.");
        return;
      }
      console.log("Tọa độ khách hàng:", customerLocation);

      const shippingFeePayload = {
        shopLocation,
        customerLocation,
        shippingFeeUnit: 100,
      };
      console.log(
        "Payload gửi đến API tính phí giao hàng:",
        shippingFeePayload
      );

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/calculate-shipping-fee`,
        {
          method: "POST",
          body: JSON.stringify(shippingFeePayload),
        }
      );

      // Lấy phản hồi dạng text
      const responseText = await response.text();
      console.log("Phản hồi từ API:", responseText);

      if (!response.ok) {
        console.error("Response status:", response.status);
        throw new Error("Không thể tính phí giao hàng.");
      }

      // Xử lý nếu phản hồi là một số
      const shippingFee = parseFloat(responseText); // Chuyển thành số thực
      if (!isNaN(shippingFee)) {
        console.log("Phí giao hàng:", shippingFee);
        setDeliveryFee(shippingFee);
        setFinalPrice(totalPrice - totalPrice * discountRate + shippingFee);
      } else {
        console.error("Phản hồi không phải là số hợp lệ:", responseText);
        throw new Error("Phản hồi không hợp lệ từ API tính phí.");
      }
    } catch (error) {
      console.error("Lỗi khi tính phí giao hàng:", error.message);
      Alert.alert("Lỗi", "Không thể tính phí giao hàng.");
    }
  };

  const fetchDeliveryInfo = async (id) => {
    try {
      // Gọi API để lấy thông tin giao hàng
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/getDeliveryInformationByUserId /${id}`
      );

      if (!response.ok) {
        console.error("API trả về trạng thái không hợp lệ:", response.status);
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // Kiểm tra dữ liệu phản hồi
      const data = await response.json();
      if (!data) {
        console.error("API không trả về dữ liệu hợp lệ.");
        return;
      }

      console.log("Delivery info:", data);
      setDeliveryInfo(data);

      // Tính phí giao hàng sau khi nhận được thông tin
      if (data.address) {
        await fetchDeliveryFee(data.address);
      }
    } catch (error) {
      console.error("Error fetching delivery info:", error.message);
      Alert.alert(
        "Lỗi",
        "Không thể lấy thông tin giao hàng. Vui lòng thử lại sau."
      );
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

  useEffect(() => {
    // Tính toán tổng tiền sau khi chọn mức giảm giá
    const selectedOption = discountOptions.find(
      (option) => option.id === selectedDiscount
    );
    const discountRate = selectedOption ? selectedOption.rate : 0;
    setFinalPrice(totalPrice - totalPrice * discountRate + deliveryFee);
  }, [selectedDiscount, totalPrice, deliveryFee]);

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
      await AsyncStorage.setItem("pendingOrder", JSON.stringify(orderData));
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
      console.log(
        "[DEBUG] Bắt đầu kiểm tra trạng thái đơn hàng. Order ID:",
        latestOrderId
      );

      // Gọi API kiểm tra thanh toán
      console.log("[DEBUG] Gọi API kiểm tra chi tiết thanh toán...");
      const paymentDetailResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${latestOrderId}`
      );

      console.log(
        "[DEBUG] Phản hồi API kiểm tra chi tiết thanh toán. Status:",
        paymentDetailResponse.status
      );

      if (!paymentDetailResponse.ok) {
        const errorText = await paymentDetailResponse.text();
        console.error("[DEBUG] Lỗi từ API kiểm tra thanh toán:", errorText);
        throw new Error("Không thể kiểm tra trạng thái thanh toán.");
      }

      const paymentDetails = await paymentDetailResponse.json();
      console.log("[DEBUG] Kết quả thanh toán từ API:", paymentDetails);

      // Đảm bảo dữ liệu là một mảng và lấy phần tử đầu tiên
      const paymentDetail = paymentDetails[0];
      console.log("[DEBUG] Chi tiết thanh toán đầu tiên:", paymentDetail);

      if (paymentDetail?.paymentStatus === "completed") {
        console.log(
          "[DEBUG] Thanh toán đã hoàn tất. Tiến hành cập nhật trạng thái đơn hàng..."
        );

        // Gọi API cập nhật trạng thái đơn hàng
        const updateResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${latestOrderId}`,
          {
            method: "PUT",
            body: JSON.stringify("pending"),
          }
        );

        console.log(
          "[DEBUG] Phản hồi API cập nhật trạng thái đơn hàng. Status:",
          updateResponse.status
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

        // Cập nhật trạng thái của discount history nếu có selectedDiscount
        console.log(
          "[DEBUG] Kiểm tra điều kiện cập nhật trạng thái giảm giá. selectedDiscount:",
          selectedDiscount
        );
        console.log("[DEBUG] userId hiện tại:", userId);

        if (selectedDiscount > 0) {
          console.log(
            "[DEBUG] Bắt đầu gọi API cập nhật trạng thái giảm giá..."
          );
          const discountUpdateResponse = await fetchWithAuth(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/inactive/${userId}/${selectedDiscount}`,
            { method: "GET" }
          );

          console.log(
            "[DEBUG] Phản hồi API cập nhật trạng thái giảm giá. Status:",
            discountUpdateResponse.status
          );

          if (discountUpdateResponse.ok) {
            console.log("[DEBUG] Giảm giá đã được cập nhật thành inactive.");
          } else {
            const errorText = await discountUpdateResponse.text();
            console.error("[DEBUG] Lỗi khi cập nhật giảm giá:", errorText);
          }
        } else {
          console.log(
            "[DEBUG] Không có selectedDiscount hoặc không hợp lệ. Không cập nhật trạng thái giảm giá."
          );
        }
      } else {
        console.log(
          "[DEBUG] Trạng thái thanh toán chưa hoàn tất. Không cập nhật đơn hàng hoặc giảm giá."
        );
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
        await fetchDiscountHistory(storedUserId);

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

  const fetchDiscountHistory = async (id) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/${id}`
      );

      if (!response.ok) {
        console.error(
          `Lỗi khi lấy lịch sử giảm giá: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const data = await response.json();

      const activeDiscounts = data.filter(
        (discount) =>
          discount.status === "active" &&
          new Date(discount.expirationDate) > new Date()
      );

      const mappedDiscounts = activeDiscounts.map((discount) => ({
        id: discount.tierId,
        name: `Giảm giá ${discount.discountRate * 100}%`,
        rate: discount.discountRate,
      }));

      const options = [
        { id: 0, name: "Không sử dụng giảm giá", rate: 0 },
        ...mappedDiscounts,
      ];

      setDiscountOptions(options);
      setSelectedDiscount(0);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử giảm giá:", error);
    }
  };

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

        <View style={styles.discountContainer}>
          <Text style={styles.textBold}>Chọn mức giảm giá:</Text>

          <Dropdown
            data={discountOptions}
            labelField="name"
            valueField="id"
            value={selectedDiscount}
            onChange={(item) => {
              console.log(
                "[DEBUG] Giá trị selectedDiscount được chọn:",
                item.id
              );
              setSelectedDiscount(item.id);
            }}
            placeholder="Chọn mức giảm giá"
            style={styles.dropdown}
          />

          <View
            style={[
              styles.discountDisplay,
              {
                backgroundColor:
                  discountColors[
                    discountOptions.find((opt) => opt.id === selectedDiscount)
                      ?.rate
                  ]?.color || COLORS.white,
              },
            ]}
          >
            <Text style={[styles.textBold, { color: COLORS.white }]}>
              {discountColors[
                discountOptions.find((opt) => opt.id === selectedDiscount)?.rate
              ]?.text || "Không có mức giảm giá"}
            </Text>
          </View>
        </View>

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
        <View style={styles.deliveryFeeContainer}>
          <Text style={styles.textBold}>Phí giao hàng:</Text>
          <Text style={{ ...styles.textBold, color: COLORS.green }}>
            {deliveryFee > 0
              ? `${deliveryFee.toLocaleString()}vnđ`
              : "Đang tính..."}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.totalContainer}>
          <Text style={styles.textBold}>Số tiền đã giảm:</Text>
          <Text style={{ ...styles.textBold, color: COLORS.green }}>
            {selectedDiscount > 0
              ? (
                  totalPrice *
                  discountOptions.find((opt) => opt.id === selectedDiscount)
                    .rate
                ).toFixed(0) + "vnđ"
              : "0vnđ"}
          </Text>
        </View>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity style={styles.totalButton}>
            <Text style={styles.textBold}>Tổng thanh toán:</Text>
            <Text style={{ ...styles.textBold, color: COLORS.green }}>
              {finalPrice.toLocaleString()}vnđ
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
  discountContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 10,
  },
  discountDisplay: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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
  deliveryFeeContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
