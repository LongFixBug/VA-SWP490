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

const menuList = [
  {
    id: "1",
    name: "Menu 1",
    calo: "950 kcal",
  },
  {
    id: "2",
    name: "Menu 2",
    calo: "1250 kcal",
  },
  {
    id: "3",
    name: "Menu 3",
    calo: "1000 kcal",
  },
  {
    id: "4",
    name: "Menu 4",
    calo: "4000 kcal",
  },
];

const FavouriteScreen = ({ navigation }) => {
  const [currentTabView, setCurrentTabView] = useState(1);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  const [userId, setUserId] = useState(null);

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
      }
    }, [userId])
  );
  const fetchFavoriteDishes = async (userId) => {
    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/allDishFavoriteByUserId/${userId}`
      );
      const favoriteIds = await response.json();

      // Kiểm tra xem có món ăn yêu thích nào không
      console.log("Danh sách món ăn yêu thích từ API:", favoriteIds);

      const dishes = await Promise.all(
        favoriteIds.map(async (favorite) => {
          const dishResponse = await fetch(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${favorite.dishId}`
          );
          return await dishResponse.json();
        })
      );

      // Lọc bỏ các món ăn không tìm thấy
      const validDishes = dishes.filter((dish) => dish !== null && dish.dishId);

      console.log("Danh sách món ăn yêu thích hợp lệ:", validDishes);
      setFavoriteDishes(validDishes);
    } catch (error) {
      console.error("Error fetching favorite dishes:", error);
    }
  };

  const handleDeleteFavorite = async (dishId) => {
    try {
      await fetch(
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
    } catch (error) {
      console.error("Error deleting favorite dish:", error);
    }
  };

  return (
    <View>
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
                <Icon name="trash-outline" color={COLORS.orange} size={24} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.dishId.toString()}
          style={{ backgroundColor: COLORS.white, paddingTop: 10 }}
        />
      )}
      {currentTabView === 2 && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={menuList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              key={index}
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
                  {item.calo}
                </Text>
              </View>
              <Icon
                name="trash-outline"
                color={COLORS.orange}
                size={24}
                style={{ alignSelf: "flex-end" }}
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          style={{ backgroundColor: COLORS.white, paddingTop: 10 }}
        />
      )}
    </View>
  );
};

export default FavouriteScreen;

const styles = StyleSheet.create({});
