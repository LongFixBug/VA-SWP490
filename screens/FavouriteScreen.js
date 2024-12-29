import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";

// Define dataTabView to display tab options
const dataTabView = [
  {
    id: 1,
    name: "Món ăn",
  },
  {
    id: 2,
    name: "Menu",
  },
];

const FavouriteScreen = ({ navigation }) => {
  const [currentTabView, setCurrentTabView] = useState(1);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  const [favoriteMenus, setFavoriteMenus] = useState([]);
  const [userId, setUserId] = useState(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [dishLoading, setDishLoading] = useState(false);

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

  useEffect(() => {
    const getUserIdFromStorage = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error getting userId from AsyncStorage:", error);
      }
    };

    getUserIdFromStorage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchFavoriteDishes(userId);
        fetchFavoriteMenus(userId);
      }
    }, [userId])
  );
  const fetchFavoriteDishes = async (userId) => {
    setDishLoading(true);
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/allDishFavoriteByUserId/${userId}`
      );
      if (response.ok) {
        const favoriteIds = await response.json();
        // Kiểm tra xem có món ăn yêu thích nào không
        console.log("Danh sách món ăn yêu thích từ API:", favoriteIds);

        const dishes = await Promise.all(
          favoriteIds.map(async (favorite) => {
            const dishResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${favorite.dishId}`
            );
            const dish = await dishResponse.json();
            return { ...dish, favoriteDate: favorite.favoriteDate };
          })
        );

        // Lọc bỏ các món ăn không tìm thấy
        const validDishes = dishes.filter(
          (dish) => dish !== null && dish.dishId
        );

        console.log("Danh sách món ăn yêu thích hợp lệ:", validDishes);
        setFavoriteDishes(validDishes);
      }
    } catch (error) {
      console.error("Error fetching favorite dishes:", error);
    } finally {
      setDishLoading(false);
    }
  };

  const fetchFavoriteMenus = async (userId) => {
    setMenuLoading(true);
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/allMenuByUserId/${userId}`
      );
      if (response.ok) {
        const favoriteMenusData = await response.json();
        // Lấy chi tiết từng menu
        const menusWithDetails = await Promise.all(
          favoriteMenusData.map(async (favMenu) => {
            const allDishResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/allDishByMenuId/${favMenu.menuId}`
            );
            if (allDishResponse.ok) {
              const allDishData = await allDishResponse.json();
              const dishes = await Promise.all(
                allDishData.map(async (dishItem) => {
                  const dishResponse = await fetchWithAuth(
                    `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${dishItem.dishId}`
                  );
                  return await dishResponse.json();
                })
              );
              return {
                ...favMenu,
                dishes: dishes.filter((dish) => dish !== null && dish.dishId),
              };
            } else {
              return { ...favMenu, dishes: [] };
            }
          })
        );

        setFavoriteMenus(menusWithDetails);
      }
    } catch (error) {
      console.error("Error fetching favorite menus:", error);
    } finally {
      setMenuLoading(false);
    }
  };

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

  const handleDeleteFavorite = async (dishId) => {
    try {
      await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/deleteFavoriteDish",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            favoriteId: 0,
            userId: parseInt(userId),
            dishId: dishId,
            favoriteDate: new Date().toISOString(),
          }),
        }
      );
      setFavoriteDishes(
        favoriteDishes.filter((dish) => dish.dishId !== dishId)
      );
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã xóa món ăn yêu thích!",
      });
    } catch (error) {
      console.error("Error deleting favorite dish:", error);
      Toast.show({
        type: "error",
        text1: "Thất bại",
        text2: "Đã xảy ra lỗi khi xóa món ăn yêu thích.",
      });
    }
  };
  const handleDeleteFavoriteMenu = async (menuId) => {
    try {
      // Xóa tất cả món ăn trong menu
      await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/deleteAllDishByMenuId/${menuId}`,
        {
          method: "DELETE",
        }
      );

      // Xóa menu sau khi xóa món ăn
      await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/deleteMenuByMenuId/${menuId}`,
        {
          method: "DELETE",
        }
      );

      setFavoriteMenus(favoriteMenus.filter((menu) => menu.menuId !== menuId));
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã xóa menu yêu thích!",
      });
    } catch (error) {
      console.error("Error deleting favorite menu:", error);
      Toast.show({
        type: "error",
        text1: "Thất bại",
        text2: "Đã xảy ra lỗi khi xóa menu yêu thích.",
      });
    }
  };

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const transformMenuData = (menu) => {
    // console.log("Received Menu for transformation:", menu);
    const transformedMenuItems = menu.dishes.map((dish) => ({
      dish: {
        ...dish,
        imageUrl: dish.imageUrl || "https://via.placeholder.com/70",
      },
      calories: dish.calories,
    }));
    const totalCalories = transformedMenuItems.reduce(
      (sum, item) => sum + (item.calories || 0),
      0
    );

    const transformedMenu = {
      title: menu.menuName,
      menuItems: transformedMenuItems,
      totalCalories: totalCalories,
      menuId: menu.menuId,
    };
    //  console.log("Transformed Menu:", transformedMenu);
    return transformedMenu;
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={"Yêu thích"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"menu"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <View style={{ flexDirection: "row" }}>
        {dataTabView.map((tabView, index) => (
          <TouchableOpacity
            activeOpacity={0.8}
            key={index}
            onPress={() => setCurrentTabView(tabView.id)}
            style={{
              flex: 1,
              alignItems: "center",
              alignSelf: "center",
              paddingVertical: 20,
              borderBottomWidth: 3,
              borderBottomColor:
                currentTabView === tabView.id
                  ? COLORS.green
                  : COLORS.greyPastel,
              backgroundColor: COLORS.white,
              borderTopWidth: 1,
              borderTopColor: COLORS.greyPastel,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.bold,
                fontSize: 16,
                color:
                  currentTabView === tabView.id ? COLORS.green : COLORS.black,
              }}
            >
              {tabView.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {currentTabView === 1 && (
        <View style={{ flex: 1 }}>
          {dishLoading ? (
            <Text style={styles.text_emty}>Đang tải dữ liệu...</Text>
          ) : favoriteDishes.length === 0 ? (
            <Text style={styles.text_emty}>
              Bạn chưa có món ăn yêu thích nào.
            </Text>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={favoriteDishes}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("DishDetail", { dishId: item.dishId });
                  }}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: COLORS.white,
                    padding: 10,
                    marginHorizontal: 15,
                    marginBottom: 5,
                    flexDirection: "row",
                    borderBottomWidth: 2,
                    borderBottomColor: COLORS.greyPastel,
                  }}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ height: 100, width: 120, borderRadius: 5 }}
                  />
                  <View
                    style={{
                      flex: 1,
                      padding: 10,
                      paddingLeft: 20,
                      paddingTop: 5,
                    }}
                  >
                    <Text
                      style={{ fontFamily: FONTS.semiBold, fontSize: 15 }}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: FONTS.semiBold,
                        fontSize: 13,
                        color: COLORS.grey,
                        marginTop: 5,
                      }}
                    >
                      {item.dishType}
                    </Text>
                    <Text
                      style={{
                        fontFamily: FONTS.semiBold,
                        fontSize: 13,
                        color: COLORS.grey,
                        marginTop: 5,
                      }}
                    >
                      Ngày yêu thích: {formatDate(item.favoriteDate)}
                    </Text>
                    <Text
                      style={{
                        fontFamily: FONTS.semiBold,
                        fontSize: 15,
                        color: COLORS.green,
                        marginTop: 5,
                      }}
                    >
                      {item.price} đ
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteFavorite(item.dishId)}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Icon
                      name="trash-outline"
                      color={COLORS.orange}
                      size={24}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.dishId.toString()}
              style={{ backgroundColor: COLORS.white, paddingTop: 10 }}
            />
          )}
        </View>
      )}

      {currentTabView === 2 && (
        <View style={{ flex: 1 }}>
          {menuLoading ? (
            <Text style={styles.text_emty}>Đang tải dữ liệu...</Text>
          ) : favoriteMenus.length === 0 ? (
            <Text style={styles.text_emty}>
              Bạn chưa có menu yêu thích nào.
            </Text>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={favoriteMenus}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={index}
                  onPress={() =>
                    navigation.navigate("DetailMenu", {
                      menu: transformMenuData(item),
                    })
                  }
                  style={{
                    backgroundColor: COLORS.white,
                    padding: 10,
                    marginHorizontal: 15,
                    marginBottom: 5,
                    borderBottomWidth: 2,
                    borderBottomColor: COLORS.greyPastel,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        padding: 10,
                        paddingLeft: 0,
                        paddingTop: 0,
                      }}
                    >
                      <Text
                        style={{ fontFamily: FONTS.semiBold, fontSize: 15 }}
                        numberOfLines={2}
                      >
                        {item.menuName}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.semiBold,
                          fontSize: 13,
                          color: COLORS.grey,
                          marginTop: 5,
                        }}
                      >
                        {item.menuDescription}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.semiBold,
                          fontSize: 13,
                          color: COLORS.grey,
                          marginTop: 5,
                        }}
                      >
                        Ngày yêu thích: {formatDate(item.createdAt)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddMenuToCart(item.dishes)}
                      style={{ alignSelf: "flex-end", marginRight: 10 }}
                    >
                      <Icon1 name="cart-plus" size={25} color={COLORS.green} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteFavoriteMenu(item.menuId)}
                      style={{ alignSelf: "flex-end" }}
                    >
                      <Icon
                        name="trash-outline"
                        color={COLORS.orange}
                        size={24}
                      />
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={item.dishes}
                    keyExtractor={(dish) => dish.dishId.toString()}
                    renderItem={({ item: dishItem }) => (
                      <Image
                        source={{ uri: dishItem.imageUrl }}
                        style={{
                          width: 70,
                          height: 70,
                          marginRight: 10,
                          borderRadius: 5,
                        }}
                      />
                    )}
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.menuId.toString()}
              style={{ backgroundColor: COLORS.white, paddingTop: 10, flex: 1 }}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default FavouriteScreen;

const styles = StyleSheet.create({
  text_emty: {
    flex: 1,
    alignSelf: "center",
    textAlign: "center",
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.grey,
    opacity: 0.7,
  },
});
