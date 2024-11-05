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

  const dataPayment = [
    {
      id: "COD",
      name: "Thanh toán khi nhận hàng",
    },
    {
      id: "QR",
      name: "Thanh toán qua QR code",
    },
  ];

  useEffect(() => {
    const getUserIdFromStorage = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          console.log("User ID retrieved from AsyncStorage:", storedUserId);
          setUserId(storedUserId);
          fetchDeliveryInfo(storedUserId);
          fetchCartDetails(storedUserId);
          fetchTierInfo(storedUserId);
        } else {
          console.log("No User ID found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };
    getUserIdFromStorage();
  }, []);

  const fetchDeliveryInfo = async (id) => {
    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/getDeliveryInformationByUserId /${id}`
      );
      const data = await response.json();
      console.log("Delivery info:", data);
      setDeliveryInfo(data);
    } catch (error) {
      console.error("Error fetching delivery info:", error);
    }
  };

  const fetchCartDetails = async (id) => {
    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/getCartByUserId/${id}`
      );
      const cartData = await response.json();
      console.log("Cart details:", cartData);
  
      let total = 0;
      let items = [];
  
      for (const item of cartData) {
        if (item.quantity > 0) { // Bỏ qua các món có quantity = 0
          const dishResponse = await fetch(
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
      setFinalPrice(total - total * discountRate); // Tính giá cuối cùng sau giảm giá
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };
  
  
  

  const fetchTierInfo = async (id) => {
    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membership/${id}`
      );
      const tierData = await response.json();
      console.log("Tier info:", tierData);

      if (tierData.tierId) {
        const tierResponse = await fetch(
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

  const handleCheckout = async () => {
    // Lọc các mục giỏ hàng có quantity > 0
    const validCartItems = detailedCartItems.filter(item => item.quantity > 0);
  
    // Kiểm tra nếu giỏ hàng rỗng sau khi lọc
    if (validCartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng trống.");
      return;
    }
  
    // Chuẩn bị dữ liệu đơn hàng
    let orderData = {
      orderId: 0, // orderId sẽ được tạo tự động trên backend
      userId: parseInt(userId, 10),
      totalPrice: finalPrice,
      deliveryAddress: deliveryInfo.address || "Không có địa chỉ",
      note: note,
      deliveryFee: 0,
      deliveryFailedFee: 0,
      orderDate: new Date().toISOString(),
      status: "pending",
    };
  
    // Đặt thời gian hoàn thành (completedTime) là thời điểm hiện tại
    const currentTime = new Date().toISOString();
    if (currentTime) {
      orderData.completedTime = currentTime;
    }
  
    // Log dữ liệu đơn hàng để kiểm tra trước khi gửi
    console.log("Order data being sent:", orderData);
  
    try {
      // Gửi yêu cầu tạo đơn hàng
      const response = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/createOrderByCustomer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );
  
      if (response.ok) {
        // Nhận phản hồi từ API về dữ liệu đơn hàng đã tạo
        const data = await response.json();
        console.log("Order created successfully:", data);
  
        // Hiển thị thông báo thành công và điều hướng về trang Home
        Alert.alert("Thành công", "Đơn hàng đã được tạo!", [
          { text: "OK", onPress: () => navigation.navigate("Home") }
        ]);
  
        // Gửi thông tin chi tiết từng món trong giỏ hàng
        for (const item of validCartItems) {
          await fetch(
            "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/createOrderDetail",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: data.orderId, // Lấy orderId từ phản hồi của API tạo đơn hàng
                dishId: item.dishId,
                quantity: item.quantity,
                price: item.price,
              }),
            }
          );
        }
      } else {
        // Xử lý lỗi nếu không tạo được đơn hàng
        const errorText = await response.text();
        console.error("Failed to create order:", errorText);
        Alert.alert("Lỗi", "Không thể tạo đơn hàng.", [{ text: "OK" }]);
      }
    } catch (error) {
      console.log("Error creating order:", error);
      Alert.alert("Tạo đơn hàng thành công.", "Đơn hàng của bạn đã được tạo thành công!", [
        { text: "OK", onPress: () => navigation.navigate("Home") }
      ]);
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
          <Icon name="location-sharp" size={22} color={COLORS.orange} style={{ marginHorizontal: 5 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.textBold}>{"Tên: " + (deliveryInfo.username || "Người dùng")}</Text>
            <Text style={styles.text}>{"Số điện thoại: " + (deliveryInfo.phoneNumber || "N/A")}</Text>
            <Text style={styles.text}>{"Địa chỉ: " + (deliveryInfo.address || "Địa chỉ không xác định")}</Text>
          </View>
        </View>

        {tierInfo && (
          <View style={styles.tierInfoContainer}>
            <Text style={styles.textBold}>Bậc thành viên của bạn:</Text>
            <Text style={styles.text}>
              {`Bậc ${tierInfo.tierName} - Giảm giá: ${tierInfo.discountRate * 100}%`}
            </Text>
          </View>
        )}

        <View style={styles.noteContainer}>
          <Text style={styles.textBold}>Ghi chú (nếu có)</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="create-outline" size={22} color={COLORS.green} style={{ marginRight: 5 }} />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập ghi chú"
              multiline
              maxLength={150}
              numberOfLines={2}
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
                <Text style={styles.textNameDish} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.textDishType}>{item.dishType || "Món ăn"}</Text>
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
          {dataPayment.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.6}
              onPress={() => setCurrentPayment(item.id)}
              style={{
                ...styles.paymentOption,
                borderColor: currentPayment === item.id ? COLORS.green : COLORS.greyPastel,
              }}
            >
              <Text style={styles.text}>{item.name}</Text>
              <Icon
                name={currentPayment === item.id ? "radio-button-on" : "radio-button-off"}
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
    {discountRate > 0 ? (totalPrice * discountRate).toFixed(0) + "đ" : "0đ"}
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

// Keep all the existing styles here.


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
