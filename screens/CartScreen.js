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
import CheckBox from "@react-native-community/checkbox";

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  // State mới để theo dõi trạng thái chọn tất cả
  const [selectAll, setSelectAll] = useState(false);

  const fetchCartData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("Không tìm thấy userId");
        return;
      }

      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/getCartByUserId/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Lỗi khi fetch giỏ hàng:", response.status);
        return;
      }

      const data = await response.json();
      const filteredCart = data.filter((item) => item.quantity > 0);

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

          if (!dishResponse.ok) {
            console.error("Lỗi khi fetch chi tiết món:", dishResponse.status);
            return null; // Skip this item
          }

          const dishDetails = await dishResponse.json();
          const storedItem = await AsyncStorage.getItem(`cart_${item.cartId}`);
          const quantity = storedItem
            ? JSON.parse(storedItem).quantity
            : item.quantity;

          return {
            ...item,
            ...dishDetails,
            quantity,
            selected: false, // Initialize with default value
          };
        })
      );
      // Remove any null values from the mapping due to error fetching dish details
      const validCartItems = detailedCartItems.filter((item) => item != null);
      setCartItems(validCartItems);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
    }
  };

  const handleQuantityChange = async (item, increment) => {
    const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;

    if (newQuantity === 0) {
      try {
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

        await AsyncStorage.removeItem(`cart_${item.cartId}`);

        setCartItems((prevItems) =>
          prevItems.filter((cartItem) => cartItem.cartId !== item.cartId)
        );
        setSelectedItems((prevSelected) => {
          const { [item.cartId]: removed, ...rest } = prevSelected;
          return rest;
        });
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

    await AsyncStorage.setItem(
      `cart_${item.cartId}`,
      JSON.stringify({ ...item, quantity: newQuantity })
    );
  };

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

      await AsyncStorage.removeItem(`cart_${item.cartId}`);

      setSelectedItems((prevSelected) => {
        const { [item.cartId]: removed, ...rest } = prevSelected;
        return rest;
      });
    } catch (error) {
      console.error("Lỗi khi xóa món ăn:", error);
    }
  };

  const handleCheckboxChange = (item) => {
    setSelectedItems((prevSelected) => ({
      ...prevSelected,
      [item.cartId]: !prevSelected[item.cartId],
    }));
  };

  // Hàm để chọn tất cả
  const handleSelectAll = () => {
    const newSelectedItems = {};
    if (!selectAll) {
      cartItems.forEach((item) => {
        newSelectedItems[item.cartId] = true;
      });
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(!selectAll);
  };
  // Hàm xóa tất cả
  const handleRemoveAllItems = async () => {
    try {
      const promises = cartItems.map(async (item) => {
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
        await AsyncStorage.removeItem(`cart_${item.cartId}`);
      });

      await Promise.all(promises);
      setCartItems([]);
      setSelectedItems({});
      setSelectAll(false);
    } catch (error) {
      console.error("Lỗi khi xóa tất cả món ăn:", error);
    }
  };

  const handleContinue = async () => {
    const selectedCartItems = cartItems.filter(
      (item) => selectedItems[item.cartId]
    );

    if (selectedCartItems.length === 0) {
      Alert.alert(
        "Thông báo",
        "Bạn chưa chọn món ăn nào để thanh toán, hãy chọn những món bạn muốn nhé!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Cart"),
          },
        ]
      );
      return;
    }

    try {
      const promises = selectedCartItems.map(async (item) => {
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
      navigation.navigate("Checkout", { selectedItems: selectedCartItems });
    } catch (error) {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);
  useEffect(() => {
    // Cập nhật trạng thái selected của item khi selectAll thay đổi
    if (selectAll) {
      const newSelectedItems = {};
      cartItems.forEach((item) => {
        newSelectedItems[item.cartId] = true;
      });
      setSelectedItems(newSelectedItems);
    }
  }, [selectAll, cartItems]);
  return (
    <>
      <Header
        title={"Giỏ hàng"}
        leftIcon={"arrow-back-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity onPress={handleSelectAll}>
          <Text style={styles.actionButtonText}>
            {selectAll ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRemoveAllItems}>
          <Text style={styles.actionButtonText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.dishId.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <CheckBox
              value={selectedItems[item.cartId] || false}
              onValueChange={() => handleCheckboxChange(item)}
              style={styles.checkbox}
            />
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
                .filter((item) => selectedItems[item.cartId])
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
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.green,
  },
  checkbox: {
    marginRight: 5,
  },
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
    alignItems: "center",
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
