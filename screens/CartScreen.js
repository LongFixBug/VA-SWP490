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
import axios from "axios";

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedCart = await AsyncStorage.getItem("cart"); // Đọc từ key "cart" thay vì "addedDish"
    
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("User ID từ AsyncStorage:", storedUserId);
        }
    
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(parsedCart); // Đưa toàn bộ mảng vào state
          console.log("Dữ liệu giỏ hàng từ AsyncStorage:", parsedCart);
        } else {
          console.log("Không tìm thấy dữ liệu giỏ hàng trong AsyncStorage.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu giỏ hàng từ AsyncStorage:", error);
      }
    };
    
  
    fetchCartData();
  }, []);
  

  const handleQuantityChange = (item, increment) => {
    const updatedCart = cartItems
      .map((cartItem) => {
        if (cartItem.dishId === item.dishId) {
          const newQuantity = increment
            ? cartItem.quantity + 1
            : cartItem.quantity - 1;

          if (newQuantity <= 0) {
            console.log("Removing item:", item.dishId);
            return null; // Đánh dấu để xóa
          }

          return { ...cartItem, quantity: newQuantity };
        }
        return cartItem;
      })
      .filter(Boolean); // Loại bỏ các mục null

    setCartItems(updatedCart);
    AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleContinue = async () => {
    try {
      for (const item of cartItems) {
        const response = await axios.post(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/cart/addToCart",
          {
            userId: userId,
            dishId: item.dishId,
            quantity: item.quantity,
          }
        );
  
        if (response.status === 200 || response.status === 201) {
          console.log(`Đã thêm món ăn có dishId ${item.dishId} với số lượng ${item.quantity}`);
        } else {
          console.error(`Lỗi khi thêm món ăn có dishId ${item.dishId}`);
          Alert.alert("Lỗi", `Không thể cập nhật món ăn có dishId ${item.dishId}. Vui lòng thử lại.`);
        }
      }
  
      Alert.alert("Thành công", "Giỏ hàng đã được cập nhật!");
      navigation.navigate("Checkout");
    } catch (error) {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật giỏ hàng.");
    }
  };
  

  const handleRemoveItem = async (item) => {
    try {
      const updatedCart = cartItems.filter(cartItem => cartItem.dishId !== item.dishId);
  
      setCartItems(updatedCart);
      await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
      console.log(`Đã xóa món ăn có dishId ${item.dishId} khỏi giỏ hàng.`);
    } catch (error) {
      console.error("Lỗi khi xóa món ăn khỏi AsyncStorage:", error);
    }
  };
  

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
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: 110, height: "100%", resizeMode: "cover" }}
            />
            <View style={{ padding: 5, marginLeft: 5, flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.textNameDish} numberOfLines={1}>{item.name}</Text>
                <Icon
  name="trash-outline"
  size={22}
  color={COLORS.red}
  onPress={() => handleRemoveItem(item)}
/>
              </View>
              <Text style={styles.textDishType}>{item.dishType}</Text>
              <Text style={styles.textDishPrice}>{item.price}đ</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => handleQuantityChange(item, false)}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => handleQuantityChange(item, true)}>
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
              {cartItems.reduce((total, item) => total + item.price * item.quantity, 0)}đ
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
