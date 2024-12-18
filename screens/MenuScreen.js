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
  const [menuLoading, setMenuLoading] = useState({});
  const [favoriteLoading, setFavoriteLoading] = useState({});
  // Mảng boolean đánh dấu trạng thái yêu thích theo index
  const [favoriteMenusByIndex, setFavoriteMenusByIndex] = useState([]);

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

  const handleFavoriteMenu = async (menu, index) => {
    if (!userId) {
      console.error("User ID không tồn tại.");
      return;
    }

    // Nếu menu này đã được yêu thích rồi thì không làm gì
    if (favoriteMenusByIndex[index]) {
      return;
    }

    const key = `fav-loading-${index}`;
    setFavoriteLoading((prevLoading) => ({ ...prevLoading, [key]: true }));

    try {
      await createFavoriteMenu(menu);
      // Thành công thì đánh dấu menu tại index này đã yêu thích
      setFavoriteMenusByIndex((prev) => {
        const newArr = [...prev];
        newArr[index] = true;
        return newArr;
      });
    } catch (error) {
      console.error("Lỗi khi thêm menu vào yêu thích:", error);
      Toast.show({
        type: "error",
        text1: "Thất bại",
        text2: "Đã xảy ra lỗi khi thêm menu vào yêu thích.",
      });
    } finally {
      setFavoriteLoading((prevLoading) => ({ ...prevLoading, [key]: false }));
    }
  };

  const createFavoriteMenu = async (menu) => {
    try {
      const totalCalories = menu.menuItems.reduce(
        (sum, item) => sum + (item.calories || 0),
        0
      );
      const totalProtein = menu.menuItems.reduce(
        (sum, item) => sum + (item.protein || 0),
        0
      );
      const totalFat = menu.menuItems.reduce(
        (sum, item) => sum + (item.fat || 0),
        0
      );
      const totalCarbs = menu.menuItems.reduce(
        (sum, item) => sum + (item.carbs || 0),
        0
      );

      const createMenuResponse = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/createFavoriteMenu",
        {
          method: "POST",
          body: JSON.stringify({
            userId: parseInt(userId),
            menuName: menu.title,
            menuDescription: `Calories: ${totalCalories} kcal, Protein: ${totalProtein}g, Fat: ${totalFat}g, Carbs: ${totalCarbs}g`,
          }),
        }
      );
      if (!createMenuResponse.ok) {
        console.error("Failed to create favorite menu.");
        return;
      }

      const allMenuResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/allMenuByUserId/${userId}`
      );

      if (!allMenuResponse.ok) {
        console.error("Failed to fetch all favorite menus after creating.");
        return;
      }

      const allMenuData = await allMenuResponse.json();
      const newMenuId = allMenuData.reduce((maxId, m) => {
        return Math.max(maxId, m.menuId);
      }, 0);

      const addDishPromises = menu.menuItems.map(async (item) => {
        const dishData = {
          menuId: newMenuId,
          dishId: item.dish?.dishId || item.dishId,
        };
        const response = await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/createDishForFavoriteMenu",
          {
            method: "POST",
            body: JSON.stringify(dishData),
          }
        );
        if (!response.ok) {
          console.error(
            `Lỗi khi thêm món ${
              item.dish?.name || "Không rõ"
            } vào menu yêu thích`,
            response.status
          );
          throw new Error(
            `Không thể thêm món ${
              item.dish?.name || "Không rõ"
            } vào menu yêu thích`
          );
        }
      });
      await Promise.all(addDishPromises);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Menu đã được thêm vào yêu thích!",
      });
    } catch (error) {
      console.error("Lỗi khi tạo menu yêu thích:", error);
      throw error;
    }
  };

  const refetchMenu = async (menuType, index, menuId) => {
    setMenuLoading({ ...menuLoading, [index]: true });
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("Không tìm thấy userId trong AsyncStorage.");
        return;
      }

      let apiUrl;
      switch (menuType) {
        case "Sáng":
          apiUrl = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuBreakfastForUser/${userId}`;
          break;
        case "Trưa":
          apiUrl = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuLunchForUser/${userId}`;
          break;
        case "Tối":
          apiUrl = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuDinnerForUser/${userId}`;
          break;
        default:
          console.error("Loại menu không hợp lệ.");
          return;
      }
      const response = await fetchWithAuth(apiUrl);
      if (response.ok) {
        const data = await response.json();
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
        setMenus((prevMenus) =>
          prevMenus.map((m, i) =>
            i === index
              ? {
                  ...m,
                  menuItems: validMenuItems,
                  totalCalories,
                  menuId: data[0]?.menuId,
                }
              : m
          )
        );
      } else {
        console.log(`Không thể lấy dữ liệu cho menu ${menuType}.`);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lại menu:", error);
    } finally {
      setMenuLoading({ ...menuLoading, [index]: false });
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

      const menuTitles = ["Sáng", "Trưa", "Tối"];
      const menusData = [];

      for (let i = 0; i < apiEndpoints.length; i++) {
        const response = await fetchWithAuth(apiEndpoints[i]);
        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            menusData.push({
              title: `Menu ${menuTitles[i]}`,
              menuItems: [],
              totalCalories: 0,
              menuId: -1,
            });
            continue;
          }
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
            menuId: data[0]?.menuId || -1,
          });
        } else {
          console.log(`Không thể lấy dữ liệu cho menu ${menuTitles[i]}.`);
        }
      }

      setMenus(menusData);
      // Tạo mảng đánh dấu yêu thích mặc định
      setFavoriteMenusByIndex(menusData.map(() => false));
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
          setUserId(storedUserId);
        } else {
          console.error("Không tìm thấy User ID trong AsyncStorage.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy User ID:", error);
      }
    };

    fetchUserId();
    fetchMenus();
  }, []);

  const handleAddMenuToCart = async (menuItems) => {
    if (!userId) {
      console.error("User ID không tồn tại.");
      return;
    }

    try {
      const addDishPromises = menuItems.map(async (dish) => {
        const dishData = {
          userId: parseInt(userId),
          dishId: dish.dish?.dishId || dish.dishId,
          quantity: 1,
        };

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

      await Promise.all(addDishPromises);

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
        {menus.map((menu, index) => {
          const favLoadingKey = `fav-loading-${index}`;
          return (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() =>
                      refetchMenu(menu.title.split(" ")[1], index, menu.menuId)
                    }
                    style={{ marginRight: 10 }}
                  >
                    {menuLoading[index] ? (
                      <ActivityIndicator size="small" color={COLORS.green} />
                    ) : (
                      <Icon name="reload" size={25} color={COLORS.green} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleFavoriteMenu(menu, index)}
                  >
                    {!favoriteMenusByIndex[index] &&
                    !favoriteLoading[favLoadingKey] ? (
                      <Icon
                        name="heart-outline"
                        size={30}
                        color={COLORS.lightGrey}
                      />
                    ) : favoriteLoading[favLoadingKey] ? (
                      <ActivityIndicator size="small" color={COLORS.red} />
                    ) : null}
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.menuCalories}>
                Tổng calories: {menu.totalCalories} kcal
              </Text>

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

              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleAddMenuToCart(menu.menuItems)}
              >
                <Icon1 name="cart-plus" size={20} color={COLORS.white} />
                <Text style={{ color: COLORS.white, marginLeft: 5 }}>
                  Thêm vào giỏ
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
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
