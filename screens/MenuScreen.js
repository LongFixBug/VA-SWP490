import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
const MenuScreen = ({ navigation }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchMenus = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("Không tìm thấy userId trong AsyncStorage.");
        return;
      }

      const apiEndpoints = [
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuBreakfastForUser/${userId}`,
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuLunchForUser/${userId}`,

        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuDinnerForUser/${userId}`,
      ];

      const menuTitles = ["Sáng", "Trưa", "Chiều", "Tối"];
      const menusData = [];

      for (let i = 0; i < apiEndpoints.length; i++) {
        const response = await fetchWithAuth(apiEndpoints[i]);
        if (response.ok) {
          const data = await response.json();

          if (data.length === 0) {
            console.log(
              `Không có món ăn nào phù hợp cho menu ${menuTitles[i]}.`
            );
            menusData.push({
              title: `Menu ${menuTitles[i]}`,
              menuItems: [],
              totalCalories: 0,
            });
            continue;
          }

          // Tính tổng calories và xử lý ảnh
          const totalCalories = data.reduce(
            (sum, item) => sum + (item.calories || 0),
            0
          );
          const validMenuItems = data.map((item) => ({
            ...item,
            dish: {
              ...item.dish,
              imageUrl: item.dish?.imageUrl || "https://via.placeholder.com/70",
            },
          }));

          menusData.push({
            title: `Menu ${menuTitles[i]}`,
            menuItems: validMenuItems,
            totalCalories,
          });
        } else {
          console.log(`Không thể lấy dữ liệu cho menu ${menuTitles[i]}.`);
        }
      }

      setMenus(menusData);
    } catch (error) {
      console.error("Lỗi khi lấy menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId); // Lưu `userId` vào state
        } else {
          console.error("Không tìm thấy User ID trong AsyncStorage.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy User ID:", error);
      }
    };

    fetchUserId();
    fetchMenus(); // Lấy danh sách menus
  }, []);

  const handleAddMenuToCart = async (menuItems) => {
    if (!userId) {
      console.error("User ID không tồn tại.");
      return;
    }

    try {
      const addDishPromises = menuItems.map(async (dish) => {
        const dishData = {
          userId: parseInt(userId), // Chuyển thành số nguyên
          dishId: dish.dish?.dishId || dish.dishId,
          quantity: 1, // Số lượng mặc định là 1
        };

        // Gọi API thêm món vào giỏ hàng
        const response = await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/addToCart",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dishData),
          }
        );

        if (!response.ok) {
          console.error(
            `Lỗi khi thêm món ${dish.dish?.name || "Không rõ"} vào giỏ hàng`,
            response.status
          );
          throw new Error(
            `Không thể thêm món ${dish.dish?.name || "Không rõ"} vào giỏ hàng`
          );
        }
      });

      // Thực hiện tất cả các API call song song
      await Promise.all(addDishPromises);

      // Hiển thị thông báo thành công
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Tất cả món ăn trong menu đã được thêm vào giỏ hàng!",
      });
    } catch (error) {
      console.error("Lỗi khi thêm menu vào giỏ hàng:", error);
      Toast.show({
        type: "error",
        text1: "Thất bại",
        text2: "Đã xảy ra lỗi khi thêm menu vào giỏ hàng.",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text>Đang tải menu...</Text>
      </View>
    );
  }

  return (
    <>
      <Header
        title={"Menu"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"menu"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white }}
        contentContainerStyle={{ padding: 10 }}
      >
        {menus.map((menu, index) => (
          <View key={index} style={styles.menuCard}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate("DetailMenu", { menu })}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.menuTitle}>{menu.title}</Text>
                <Icon name="heart-outline" size={30} color={COLORS.lightGrey} />
              </View>
              <Text style={styles.menuCalories}>
                Tổng calories: {menu.totalCalories} kcal
              </Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              contentContainerStyle={{
                marginTop: 5,
              }}
              showsHorizontalScrollIndicator={false}
            >
              {menu.menuItems.map((dish, dishIndex) => (
                <Image
                  key={dishIndex}
                  source={{
                    uri:
                      dish.dish?.imageUrl || "https://via.placeholder.com/70",
                  }}
                  style={styles.dishImage}
                />
              ))}
            </ScrollView>

            {/* Add to Cart Button */}
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddMenuToCart(menu.menuItems)}
            >
              <Icon1 name="cart-plus" size={20} color={COLORS.white} />
              <Text style={{ color: COLORS.white, marginLeft: 5 }}>
                Thêm vào giỏ
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default MenuScreen;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  menuCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  menuTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  menuCalories: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.grey,
    marginVertical: 3,
  },
  dishImage: {
    width: 70,
    height: 60,
    resizeMode: "cover",
    borderRadius: 8,
    marginLeft: 10,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.green,
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  addToCartText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginLeft: 5,
  },
});
