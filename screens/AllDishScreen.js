import {
  StyleSheet,
  View,
  Image,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AllDishScreen = ({ navigation, route }) => {
  const fromSearch = route.params?.fromSearch;
  const [currentDishType, setCurrentDishType] = useState(0);
  const [allDishes, setAllDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratings, setRatings] = useState({});

  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/alldish"
        );
        const jsonData = await response.json();

        // Thêm dummy dish nếu cần
        if (jsonData.length % 2 !== 0) {
          jsonData.push({ dishId: "dummy" });
        }

        setAllDishes(jsonData);
        setFilteredDishes(jsonData);

        // Lấy toàn bộ rating cho tất cả món ăn
        const dishIds = jsonData
          .filter((dish) => dish.dishId !== "dummy")
          .map((dish) => dish.dishId);

        if (dishIds.length > 0) {
          fetchAllDishRatings(dishIds);
        }
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    };

    fetchDishes();
  }, []);

  // Hàm lấy đánh giá trung bình cho từng món
  const fetchAllDishRatings = async (dishIds) => {
    try {
      // Gọi API song song cho tất cả dishId
      const ratingPromises = dishIds.map(async (dishId) => {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/getFeedbackByDishID/${dishId}`
        );

        if (!response.ok) {
          console.error(
            `Error fetching rating for dishId ${dishId}:`,
            response.status
          );
          return { dishId, averageRating: 0 }; // Giá trị mặc định nếu lỗi
        }

        const feedbackData = await response.json();
        const averageRating =
          feedbackData.length > 0
            ? feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0) /
              feedbackData.length
            : 0;

        return { dishId, averageRating };
      });

      // Chờ tất cả các API hoàn thành
      const ratingsData = await Promise.all(ratingPromises);

      // Chuyển đổi dữ liệu trả về thành object { dishId: rating }
      const ratingsMap = ratingsData.reduce((acc, item) => {
        acc[item.dishId] = item.averageRating;
        return acc;
      }, {});

      setRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching all dish ratings:", error);
    }
  };

  const filterDishesByType = async (typeId) => {
    setCurrentDishType(typeId);

    if (typeId === 0) {
      // Hiển thị tất cả món ăn
      setFilteredDishes(allDishes);
    } else {
      const selectedType = dataDishType.find((type) => type.id === typeId);
      try {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/getDishByDishType/${selectedType.dishType}`
        );

        const jsonData = await response.json();

        if (jsonData.length % 2 !== 0) {
          jsonData.push({ dishId: "dummy" });
        }

        setFilteredDishes(jsonData);

        // Lấy danh sách dishId và fetch ratings
        const dishIds = jsonData
          .filter((dish) => dish.dishId !== "dummy")
          .map((dish) => dish.dishId);

        if (dishIds.length > 0) {
          fetchAllDishRatings(dishIds);
        }
      } catch (error) {
        console.error("Error fetching filtered dishes:", error);
      }
    }
  };

  useEffect(() => {
    const fetchDishesAndIngredients = async () => {
      try {
        // Gọi API để lấy danh sách món ăn
        const dishResponse = await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/alldish"
        );

        if (!dishResponse.ok) {
          throw new Error(`Error fetching dishes: ${dishResponse.status}`);
        }

        const dishes = await dishResponse.json();

        // Tạo danh sách các Promise để lấy nguyên liệu
        const ingredientPromises = dishes.map(async (dish) => {
          try {
            // Gọi API getIngredientByDishId
            const ingredientResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${dish.dishId}`
            );

            if (!ingredientResponse.ok) {
              console.warn(
                `Failed to fetch ingredients for dish ${dish.dishId}`
              );
              return { ...dish, ingredients: [] };
            }

            const ingredients = await ingredientResponse.json();

            // Gọi API getIngredientByIngredientId cho từng nguyên liệu
            const ingredientDetailsPromises = ingredients.map(async (ing) => {
              const ingredientDetailResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${ing.ingredientId}`
              );

              if (!ingredientDetailResponse.ok) {
                console.warn(
                  `Failed to fetch ingredient details for ingredientId ${ing.ingredientId}`
                );
                return null;
              }

              return await ingredientDetailResponse.json();
            });

            // Chờ tất cả các lời gọi API getIngredientByIngredientId hoàn thành
            const detailedIngredients = await Promise.all(
              ingredientDetailsPromises
            );

            // Lọc bỏ các giá trị null nếu có lỗi
            const validIngredients = detailedIngredients.filter((item) => item);

            return { ...dish, ingredients: validIngredients };
          } catch (error) {
            console.error(
              `Error fetching ingredients for dish ${dish.dishId}`,
              error
            );
            return { ...dish, ingredients: [] };
          }
        });

        // Chờ tất cả các lời gọi API hoàn thành
        const dishesWithIngredients = await Promise.all(ingredientPromises);

        setAllDishes(dishesWithIngredients);
        setFilteredDishes(dishesWithIngredients);
      } catch (error) {
        console.error("Error fetching dishes or ingredients:", error);
      }
    };

    fetchDishesAndIngredients();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);

    const cleanedQuery = text.trim().toLowerCase();

    const filtered = allDishes.filter((dish) => {
      const dishName = dish.name?.toLowerCase() || "";
      const ingredientNames =
        dish.ingredients
          ?.map((ingredient) => ingredient.name.toLowerCase()) // Lấy `name` từ thông tin nguyên liệu
          .join(" ") || "";

      return (
        dishName.includes(cleanedQuery) ||
        ingredientNames.includes(cleanedQuery)
      );
    });

    setFilteredDishes(filtered);
  };

  const dataDishType = [
    { id: 0, name: "Tất cả", dishType: null },
    { id: 1, name: "Món khai vị", dishType: "Khai vị" },
    { id: 2, name: "Món chính", dishType: "Món chính" },
    { id: 3, name: "Món tráng miệng", dishType: "Tráng miệng" },
    { id: 4, name: "Đồ uống", dishType: "Đồ uống" },
  ];

  return (
    <>
      <View style={styles.top}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <View
            style={{
              height: 50,
              width: 50,
              marginLeft: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.white,
              borderRadius: 10,
              elevation: 0,
            }}
          >
            <Icon name="arrow-back-outline" size={28} color={COLORS.green} />
          </View>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Tìm kiếm món ăn..."
            autoFocus={fromSearch === true} // Bật tự động focus nếu được chuyển từ trang Home
            style={{
              fontFamily: FONTS.medium,
              fontSize: 19,
              paddingVertical: 5,
              paddingHorizontal: 10,
            }}
          />
        </View>
      </View>
      <View style={{ backgroundColor: COLORS.white, paddingBottom: 10 }}>
        <View style={{ flexDirection: "row", marginLeft: 20 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              borderWidth: 1,
              borderColor: COLORS.grey,
              borderRadius: 8,
              paddingHorizontal: 10,
              justifyContent: "center",
              backgroundColor: COLORS.grey,
              marginRight: 10,
            }}
          >
            <Icon name="filter" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dataDishType.map((item, index) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => filterDishesByType(item.id)}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor:
                    item.id === currentDishType
                      ? COLORS.green
                      : COLORS.lightGrey,
                  marginRight: 10,
                  borderRadius: 8,
                  backgroundColor:
                    item.id === currentDishType ? COLORS.green : COLORS.white,
                }}
                key={index}
              >
                <Text
                  style={{
                    fontFamily:
                      item.id === currentDishType
                        ? FONTS.semiBold
                        : FONTS.medium,
                    fontSize: 15,
                    color:
                      item.id === currentDishType
                        ? COLORS.white
                        : COLORS.greySolid,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={filteredDishes}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.dishId.toString()}
        numColumns={2}
        renderItem={({ item }) =>
          item.dishId === "dummy" ? (
            <View style={styles.dummyItem}></View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                console.log("Dish ID được truyền:", item.dishId);
                navigation.navigate("DishDetail", { dishId: item.dishId });
              }}
              style={styles.gridItem}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: item.imageUrl || "https://picsum.photos/300",
                  }}
                  style={styles.dishImage}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.textNameDish} numberOfLines={1}>
                  {item.name || "Tên món ăn"}
                </Text>
                <Text style={styles.textDishType}>
                  {item.dishType || "Loại món ăn"}
                </Text>
                <View style={styles.ratingAndPrice}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon name="star" size={16} color={COLORS.star} />
                    <Text style={styles.textDishType}>
                      {ratings[item.dishId]?.toFixed(1) || "0.0"}
                    </Text>
                  </View>
                  <Text style={styles.price}>
                    {item.price
                      ? `${item.price.toLocaleString()} đ`
                      : "0.000 đ"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        }
        contentContainerStyle={{ paddingHorizontal: 10 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        style={{
          paddingTop: 10,
          backgroundColor: COLORS.white,
        }}
      />
    </>
  );
};

export default AllDishScreen;

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    height: 80,
    marginTop: StatusBar.currentHeight,
    backgroundColor: COLORS.white,
  },
  gridItem: {
    flex: 1,
    margin: 10,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    overflow: "hidden",
    maxWidth: "48%", // Đảm bảo các item có cùng chiều rộng
  },
  imageContainer: {
    width: "100%",
    height: 120, // Đặt chiều cao cố định cho hình ảnh
    overflow: "hidden",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  dishImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Đảm bảo hình ảnh lấp đầy không gian
  },
  textContainer: {
    padding: 5,
    backgroundColor: COLORS.white,
  },
  textNameDish: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
    height: 20, // Đặt chiều cao cố định để tránh thay đổi bố cục
  },
  textDishType: {
    color: COLORS.grey,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
    height: 15, // Đặt chiều cao cố định
  },
  ratingAndPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  dummyItem: {
    flex: 1,
    margin: 10,
    backgroundColor: "transparent",
  },
  price: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: FONTS.bold,
  },
});
