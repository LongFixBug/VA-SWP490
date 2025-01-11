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
  Modal, // Import Modal
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

  // State mới cho filter
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilterOption, setSelectedFilterOption] = useState(null); // Giá trị null cho lần đầu

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

        // Lọc các món ăn có status là "active"
        const activeDishes = jsonData.filter(
          (dish) => dish.status && dish.status.toLowerCase() === "active"
        );

        // Thêm dummy dish nếu cần
        if (activeDishes.length % 2 !== 0) {
          activeDishes.push({ dishId: "dummy" });
        }

        setAllDishes(activeDishes);
        setFilteredDishes(activeDishes);

        // Lấy toàn bộ rating cho tất cả món ăn
        const dishIds = activeDishes
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
      // Hiển thị tất cả món ăn có status là "active"
      setFilteredDishes(allDishes);
    } else {
      const selectedType = dataDishType.find((type) => type.id === typeId);

      let filteredDishesByType = [];

      if (selectedType.dishType) {
        filteredDishesByType = allDishes.filter((dish) => {
          if (!dish.dishType) return false;

          const dishTypeLower = dish.dishType.toLowerCase();
          if (selectedType.dishType === "Món chính") {
            return dishTypeLower.includes("món chính");
          } else if (selectedType.dishType === "Khai vị") {
            return dishTypeLower.includes("khai vị");
          } else if (selectedType.dishType === "Tráng miệng") {
            return dishTypeLower.includes("tráng miệng");
          }
          return dishTypeLower === selectedType.dishType.toLowerCase();
        });
      }

      if (filteredDishesByType.length % 2 !== 0) {
        filteredDishesByType.push({ dishId: "dummy" });
      }

      setFilteredDishes(filteredDishesByType);

      // Lấy danh sách dishId và fetch ratings
      const dishIds = filteredDishesByType
        .filter((dish) => dish.dishId !== "dummy")
        .map((dish) => dish.dishId);

      if (dishIds.length > 0) {
        fetchAllDishRatings(dishIds);
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

        // Lọc các món ăn có status là "active"
        const activeDishes = dishes.filter(
          (dish) => dish.status && dish.status.toLowerCase() === "active"
        );

        // Tạo danh sách các Promise để lấy nguyên liệu
        const ingredientPromises = activeDishes.map(async (dish) => {
          try {
            // Gọi API getIngredientByDishId
            const ingredientResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${dish.dishId}`
            );

            if (!ingredientResponse.ok) {
              console.log(
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
                console.log(
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
    { id: 5, name: "Canh", dishType: "Canh" },
  ];

  // Hàm xử lý khi chọn filter option
  const handleFilterOptionSelect = (option) => {
    setSelectedFilterOption(option);
    setIsFilterModalVisible(false); // Đóng modal khi chọn xong
    sortDishes(option); // Gọi hàm sắp xếp
  };

  const sortDishes = (option) => {
    let sortedDishes = [...filteredDishes];
    switch (option) {
      case "rating_high_to_low":
        sortedDishes.sort((a, b) => {
          const ratingA = ratings[a.dishId] || 0;
          const ratingB = ratings[b.dishId] || 0;
          return ratingB - ratingA; // Sắp xếp giảm dần theo rating
        });
        break;
      case "rating_low_to_high":
        sortedDishes.sort((a, b) => {
          const ratingA = ratings[a.dishId] || 0;
          const ratingB = ratings[b.dishId] || 0;
          return ratingA - ratingB; // Sắp xếp tăng dần theo rating
        });
        break;
      case "price_low_to_high":
        sortedDishes.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceA - priceB;
        }); // Sắp xếp tăng dần theo giá
        break;
      case "price_high_to_low":
        sortedDishes.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceB - priceA; // Sắp xếp giảm dần theo giá
        });
        break;
      case "a-z":
        sortedDishes.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "z-a":
        sortedDishes.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      default:
        break; // Không sắp xếp nếu không có option nào được chọn
    }
    setFilteredDishes(sortedDishes);
  };

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
            onPress={() => setIsFilterModalVisible(true)} // Mở modal
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

      {/* Modal chứa các option filter */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setIsFilterModalVisible(false)} // Close modal when tap outside
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleFilterOptionSelect("rating_high_to_low")}
            >
              <Text style={styles.filterOptionText}>Rating: Cao đến thấp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleFilterOptionSelect("rating_low_to_high")}
            >
              <Text style={styles.filterOptionText}>Rating: Thấp đến cao</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleFilterOptionSelect("price_low_to_high")}
            >
              <Text style={styles.filterOptionText}>Giá: Thấp đến cao</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleFilterOptionSelect("price_high_to_low")}
            >
              <Text style={styles.filterOptionText}>Giá: Cao đến thấp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleFilterOptionSelect("a-z")}
            >
              <Text style={styles.filterOptionText}>A-Z</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleFilterOptionSelect("z-a")}
            >
              <Text style={styles.filterOptionText}>Z-A</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  filterOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  filterOptionText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
});
