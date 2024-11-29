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

const MenuScreen = ({ navigation }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

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
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuAfternoonSnackForUser/${userId}`,
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
    fetchMenus();
  }, []);

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
});
