import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);

  // Hàm lấy giỏ hàng từ API
  // Hàm lấy giỏ hàng từ API
  const fetchCartData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return console.error("Không tìm thấy userId");

      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/getCartByUserId/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      const filteredCart = data.filter((item) => item.quantity > 0); // Chỉ lấy món có số lượng > 0

      // Lấy thông tin chi tiết từng món ăn từ API GetDishByID
      const detailedCartItems = await Promise.all(
        filteredCart.map(async (item) => {
          const dishResponse = await fetch(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${item.dishId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${await AsyncStorage.getItem(
                  "authToken"
                )}`,
              },
            }
          );

          const dishDetails = await dishResponse.json();

          // Kiểm tra và lấy dữ liệu từ AsyncStorage (ưu tiên số lượng đã lưu trước đó)
          const storedItem = await AsyncStorage.getItem(`cart_${item.cartId}`);
          const quantity = storedItem
            ? JSON.parse(storedItem).quantity
            : item.quantity;

          return {
            ...item,
            ...dishDetails, // Thêm thông tin từ GetDishByID
            quantity, // Sử dụng số lượng từ AsyncStorage nếu có
          };
        })
      );

      setCartItems(detailedCartItems);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
    }
  };

  // Xử lý thay đổi số lượng món ăn
  const handleQuantityChange = async (item, increment) => {
    const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;

    if (newQuantity === 0) {
      try {
        // Xóa món khỏi server thông qua API
        await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/removeCartByUserId/${item.cartId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem(
                "authToken"
              )}`,
            },
          }
        );

        // Xóa món khỏi AsyncStorage
        await AsyncStorage.removeItem(`cart_${item.cartId}`);

        // Xóa món khỏi danh sách cartItems
        setCartItems((prevItems) =>
          prevItems.filter((cartItem) => cartItem.cartId !== item.cartId)
        );
      } catch (error) {
        console.error("Lỗi khi xóa món ăn:", error);
      }
      return;
    }

    if (newQuantity > 100) {
      Alert.alert("Thông báo", "Số lượng tối đa là 100.");
      return;
    }

    const updatedCart = cartItems.map((cartItem) =>
      cartItem.cartId === item.cartId
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );

    setCartItems(updatedCart);

    // Cập nhật số lượng mới vào AsyncStorage
    await AsyncStorage.setItem(
      `cart_${item.cartId}`,
      JSON.stringify({ ...item, quantity: newQuantity })
    );
  };

  // Xóa món ăn
  const handleRemoveItem = async (item) => {
    try {
      await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/removeCartByUserId/${item.cartId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        }
      );

      setCartItems((prevItems) =>
        prevItems.filter((cartItem) => cartItem.cartId !== item.cartId)
      );

      // Xóa món khỏi AsyncStorage
      await AsyncStorage.removeItem(`cart_${item.cartId}`);
    } catch (error) {
      console.error("Lỗi khi xóa món ăn:", error);
    }
  };

  // Xử lý khi bấm "Tiếp tục"
  const handleContinue = async () => {
    try {
      const promises = cartItems.map(async (item) => {
        const quantityData = JSON.parse(
          await AsyncStorage.getItem(`cart_${item.cartId}`)
        );

        if (quantityData) {
          await fetch(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/updateDishQuantityByCartId/${item.cartId}?newQuantity=${quantityData.quantity}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${await AsyncStorage.getItem(
                  "authToken"
                )}`,
              },
            }
          );
        }
      });

      await Promise.all(promises);
      Alert.alert("Thông báo", "Cập nhật giỏ hàng thành công.");
      navigation.navigate("Checkout");
    } catch (error) {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  return (
    <>
      <Header
        title={"Giỏ hàng"}
        leftIcon={"arrow-back-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.dishId.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate("DishDetail", { dishId: item.dishId })
              }
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 110, height: "100%", resizeMode: "cover" }}
              />
            </TouchableOpacity>
            <View style={{ padding: 5, marginLeft: 5, flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("DishDetail", { dishId: item.dishId })
                  }
                >
                  <Text style={styles.textNameDish} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
                <Icon
                  name="trash-outline"
                  size={22}
                  color={COLORS.red}
                  onPress={() => handleRemoveItem(item)}
                />
              </View>
              <Text style={styles.textDishType}>{item.dishType}</Text>
              <Text style={styles.textDishPrice}>
                {item.price ? `${item.price.toLocaleString()} vnđ` : "0.000 đ"}
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => handleQuantityChange(item, false)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => handleQuantityChange(item, true)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        style={{ backgroundColor: COLORS.white, marginBottom: 77 }}
      />
      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.totalAmountContainer}
          >
            <Text style={styles.totalAmountText}>Tổng số tiền:</Text>
            <Text style={styles.totalAmountValue}>
              {cartItems
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toLocaleString()}
              vnđ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleContinue}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  containerButtonFloatBottom: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
  },
  boxButtonFloatBottom: {
    backgroundColor: COLORS.white,
    height: 80,
    flexDirection: "row",
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGrey,
  },
  listItem: {
    flex: 1,
    margin: 10,
    marginHorizontal: 15,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 5,
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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.darkGrey,
  },
  quantityButtonText: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: COLORS.green,
    paddingHorizontal: 10,
  },
  quantityText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    width: 50,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.darkGrey,
  },
  totalAmountContainer: {
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
  totalAmountText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.black,
  },
  totalAmountValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.green,
  },
  continueButton: {
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
  continueButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.white,
  },
});
