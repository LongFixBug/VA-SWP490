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
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("User ID từ AsyncStorage:", storedUserId);
  
          // Gọi API để lấy giỏ hàng theo userId
          const response = await axios.get(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/getCartByUserId/${storedUserId}`
          );
  
          if (response.status === 200) {
            const cartData = response.data;
            
            // Lọc các mục có quantity > 0 và lấy chi tiết cho từng món ăn từ `GetDishByID` API
            const detailedCartItems = await Promise.all(
              cartData
                .filter(item => item.quantity > 0)  // Chỉ giữ lại các mục có quantity > 0
                .map(async (item) => {
                  const dishResponse = await axios.get(
                    `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${item.dishId}`
                  );
                  
                  return dishResponse.status === 200
                    ? { ...item, ...dishResponse.data }
                    : item;
                })
            );
  
            setCartItems(detailedCartItems);
            console.log("Dữ liệu chi tiết giỏ hàng:", detailedCartItems);
          } else {
            console.log("Lỗi khi lấy dữ liệu giỏ hàng từ API:", response.status);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu giỏ hàng từ API:", error);
      }
    };
  
    fetchCartData();
  }, []);
  

  const handleQuantityChange = async (item, increment) => {
    const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;
    console.log("New Quantity:", newQuantity);
  
    // Kiểm tra không cho phép quantity nhỏ hơn 0
    if (newQuantity < 0) {
      return;
    }
  
    try {
      // Sử dụng phương thức PUT và truyền cartId trong URL
      const response = await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/updateDishQuantityByCartId/${item.cartId}`,
        newQuantity, // Truyền trực tiếp quantity vào body
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200 || response.status === 201) {
        // Cập nhật quantity trong state để phản ánh đúng số lượng sau khi lưu
        if (newQuantity === 0) {
          setCartItems((prevItems) =>
            prevItems.filter((cartItem) => cartItem.cartId !== item.cartId)
          );
        } else {
          setCartItems((prevItems) =>
            prevItems.map((cartItem) =>
              cartItem.cartId === item.cartId
                ? { ...cartItem, quantity: newQuantity }
                : cartItem
            )
          );
        }
      } else {
        console.error(`Lỗi khi cập nhật số lượng cho món ${item.dishId}`);
      }
    } catch (error) {
      console.error(
        `Lỗi khi cập nhật số lượng món ăn: [AxiosError: Request failed with status code ${error.response?.status || 'Unknown'}] - cartId: ${item.cartId}, quantity mới: ${newQuantity}`
      );
    }
  };
  
  
  
  
  const handleRemoveItem = async (item) => {
    try {
      // Đặt quantity về 0 qua API để xóa món ăn
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/updateDishQuantityByCartId/${item.cartId}`, // Đưa cartId vào URL
        0, // Truyền quantity trực tiếp vào body
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      // Loại bỏ món ăn khỏi cartItems trong state
      setCartItems((prevItems) =>
        prevItems.filter((cartItem) => cartItem.cartId !== item.cartId)
      );
    } catch (error) {
      console.error("Lỗi khi xóa món ăn khỏi giỏ hàng:", error);
    }
  };
  
  
  
  
  

  const handleContinue = () => {
    Alert.alert("Thành công", "Giỏ hàng đã được cập nhật!");
    navigation.navigate("Checkout");
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
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DishDetail', { dishId: item.dishId })}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 110, height: "100%", resizeMode: "cover" }}
              />
            </TouchableOpacity>
            <View style={{ padding: 5, marginLeft: 5, flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('DishDetail', { dishId: item.dishId })}
                >
                  <Text style={styles.textNameDish} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
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
