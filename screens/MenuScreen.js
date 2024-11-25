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

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenu/${userId}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.length === 0) {
          console.log("Không có món ăn nào phù hợp với quý khách.");
          setMenus([]); // Đặt menus thành rỗng để hiển thị thông báo
          return;
        }

        // Chia các món ăn thành các nhóm 5 món (menu)
        const groupedMenus = [];
        for (let i = 0; i < data.length; i += 5) {
          const menuItems = data.slice(i, i + 5); // Lấy 5 món
          const totalCalories = menuItems.reduce(
            (sum, item) => sum + item.calories,
            0
          ); // Tổng calories của menu

          // Đảm bảo các món có imageUrl hợp lệ
          const validMenuItems = menuItems.map((item) => ({
            ...item,
            dish: {
              ...item.dish,
              imageUrl: item.dish?.imageUrl || "https://via.placeholder.com/70", // URL mặc định nếu thiếu
            },
          }));

          groupedMenus.push({
            menuItems: validMenuItems,
            totalCalories,
          });
        }

        setMenus(groupedMenus);
      } else {
        console.log("Không có món ăn nào phù hợp với quý khách.");
      }
    } catch (groupedMenus) {
      console.log("Không có món ăn nào phù hợp với quý khách.");
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
            {/* Vùng thông tin menu có thể bấm */}
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
                <Text style={styles.menuTitle}>Menu {index + 1}</Text>
                <Icon name="heart-outline" size={30} color={COLORS.lightGrey} />
              </View>
              <Text style={styles.menuCalories}>
                Tổng calories: {menu.totalCalories} kcal
              </Text>
            </TouchableOpacity>

            {/* Vùng hiển thị ảnh cuộn ngang */}
            <ScrollView
              horizontal
              contentContainerStyle={{
                marginTop: 5,
              }}
              showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn ngang
            >
              {menu.menuItems.map((dish, dishIndex) => (
                <Image
                  key={dishIndex}
                  source={{
                    uri:
                      dish.dish?.imageUrl || "https://via.placeholder.com/70", // URL mặc định nếu imageUrl là null
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
