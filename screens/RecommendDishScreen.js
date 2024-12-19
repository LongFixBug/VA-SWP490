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

const RecommedDishScreen = ({ navigation, route }) => {
  const fromSearch = route.params?.fromSearch;
  const [currentDishType, setCurrentDishType] = useState(6);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [allDishes, setAllDishes] = useState([]); // Để lưu tất cả dữ liệu món ăn
  const [searchQuery, setSearchQuery] = useState("");
  // State mới cho filter
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilterOption, setSelectedFilterOption] = useState(null); // Giá trị null cho lần đầu

  // Hàm gọi API có token
  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  // Hàm lấy dữ liệu từ API recommend và API feedback
  const fetchRecommendedDishesWithRatings = async (userId, selectedType) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendDishes/${userId}?dishType=${
          selectedType || ""
        }`
      );

      if (!response.ok) {
        return [];
      }

      const recommendData = await response.json();

      // Kết hợp dữ liệu feedback để lấy rating và nguyên liệu
      const detailedDishes = await Promise.all(
        recommendData.map(async (dish) => {
          try {
            // Lấy đánh giá (feedback)
            const feedbackResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/getFeedbackByDishID/${dish.dishId}`
            );
            const feedbackData = await feedbackResponse.json();
            const ratings = feedbackData.map((feedback) => feedback.rating);
            const averageRating =
              ratings.length > 0
                ? (
                    ratings.reduce((acc, rating) => acc + rating, 0) /
                    ratings.length
                  ).toFixed(1)
                : "0.0";

            // Lấy danh sách ingredientId từ API getIngredientByDishId
            const ingredientResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${dish.dishId}`
            );

            const ingredientIds = ingredientResponse.ok
              ? await ingredientResponse.json()
              : [];

            // Lấy thông tin chi tiết của từng ingredientId
            const ingredientDetails = await Promise.all(
              ingredientIds.map(async (ingredient) => {
                const ingredientDetailResponse = await fetchWithAuth(
                  `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${ingredient.ingredientId}`
                );
                return ingredientDetailResponse.ok
                  ? await ingredientDetailResponse.json()
                  : null;
              })
            );

            // Loại bỏ các giá trị null từ danh sách nguyên liệu
            const validIngredients = ingredientDetails.filter((item) => item);

            // Trả về thông tin món ăn bao gồm rating và nguyên liệu
            return {
              dishId: dish.dish.dishId,
              imageUrl: dish.dish.imageUrl,
              dishName: dish.dishName,
              price: dish.dish.price,
              dishType: dish.dish.dishType,
              averageRating: parseFloat(averageRating),
              ingredients: validIngredients, // Thêm nguyên liệu vào dữ liệu món ăn
            };
          } catch (error) {
            console.error(
              `Error fetching data for dishId ${dish.dishId}:`,
              error
            );
            return {
              dishId: dish.dish.dishId,
              imageUrl: dish.dish.imageUrl,
              dishName: dish.dishName,
              price: dish.dish.price,
              dishType: dish.dish.dishType,
              averageRating: 0,
              ingredients: [], // Trả về danh sách nguyên liệu trống nếu lỗi
            };
          }
        })
      );

      return detailedDishes;
    } catch (error) {
      console.error("Error fetching recommended dishes:", error);
      return [];
    }
  };

  // Hàm lọc món ăn theo loại
  const filterDishesByType = async (typeId) => {
    setCurrentDishType(typeId); // Đặt trạng thái filter hiện tại
    const selectedType = dishTypeList.find(
      (type) => type.id === typeId
    )?.dishType;

    try {
      const userId = await AsyncStorage.getItem("userId");
      const dietaryPreferenceId = await AsyncStorage.getItem(
        "dietaryPreferenceId"
      );

      if (!userId) throw new Error("User ID không tồn tại");

      let dishes = [];
      if (typeId === 6) {
        // Nếu typeId là 6 (Chế độ ăn uống)
        if (!dietaryPreferenceId)
          throw new Error("Dietary Preference ID không tồn tại");
        dishes = await fetchDishesByDietaryPreference(dietaryPreferenceId);
      } else {
        // Hiển thị món theo loại món ăn
        dishes = await fetchRecommendedDishesWithRatings(userId, selectedType);
      }

      setAllDishes(dishes);
      setFilteredDishes(dishes);
      // console.log("Filtered Dishes:", dishes);
    } catch (error) {
      console.error("Error filtering dishes by type:", error);
    }
  };

  // Tìm kiếm món ăn theo từ khóa
  const handleSearch = (text) => {
    setSearchQuery(text);

    const cleanedQuery = text.trim().toLowerCase();

    // Lọc dữ liệu dựa trên tên món ăn hoặc tên nguyên liệu
    const filtered = allDishes.filter((dish) => {
      const dishName = dish.dishName?.toLowerCase() || ""; // Lấy tên món ăn và chuyển thành chữ thường
      const ingredientNames =
        dish.ingredients
          ?.map((ingredient) => ingredient.name.toLowerCase()) // Lấy tên từng nguyên liệu và chuyển thành chữ thường
          .join(" ") || ""; // Gộp tất cả tên nguyên liệu thành một chuỗi

      // Kiểm tra nếu tên món ăn hoặc tên nguyên liệu khớp với từ khóa tìm kiếm
      return (
        dishName.includes(cleanedQuery) ||
        ingredientNames.includes(cleanedQuery)
      );
    });

    setFilteredDishes(filtered); // Cập nhật danh sách món ăn được lọc
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { dishType } = route.params || {}; // Lấy dishType từ route
        const dietaryPreferenceId = await AsyncStorage.getItem(
          "dietaryPreferenceId"
        );

        if (dishType && dishTypeList) {
          // Nếu từ Home truyền dishType
          const selectedType = dishTypeList.find(
            (type) => type.dishType === dishType
          );
          if (selectedType) {
            setCurrentDishType(selectedType.id); // Đặt trạng thái filter theo dishType
            await filterDishesByType(selectedType.id);
            return;
          }
        }

        // Mặc định focus vào "Món chính"
        setCurrentDishType(1); // ID của "Món chính"
        await filterDishesByType(1);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [route.params, dishTypeList]);

  // Danh sách loại món ăn
  const [dishTypeList, setDishTypeList] = useState([
    { id: 1, name: "Món chính", dishType: "Món chính" },
    { id: 2, name: "Món khai vị", dishType: "Khai vị" },
    { id: 3, name: "Món tráng miệng", dishType: "Tráng miệng" },
    { id: 4, name: "Đồ uống", dishType: "Đồ uống" },
    { id: 5, name: "Canh", dishType: "Canh" },
  ]);

  useEffect(() => {
    const loadUserDietaryPreference = async () => {
      try {
        // Lấy dietaryPreferenceId từ AsyncStorage
        const dietaryPreferenceId = await AsyncStorage.getItem(
          "dietaryPreferenceId"
        );

        // Xác định tên chế độ ăn uống
        const dietaryPreferenceName =
          dietaryPreferenceId === "1"
            ? "Vegan"
            : dietaryPreferenceId === "2"
            ? "Lacto"
            : dietaryPreferenceId === "3"
            ? "Ovo"
            : dietaryPreferenceId === "4"
            ? "Lacto-Ovo"
            : dietaryPreferenceId === "5"
            ? "Pescatarian"
            : null;

        // Tạo danh sách mới với "Món chính" đứng đầu
        let updatedList = [
          { id: 1, name: "Món chính", dishType: "Món chính" },
          { id: 2, name: "Món khai vị", dishType: "Khai vị" },
          { id: 3, name: "Món tráng miệng", dishType: "Tráng miệng" },
          { id: 4, name: "Đồ uống", dishType: "Đồ uống" },
          { id: 5, name: "Canh", dishType: "Canh" },
        ];

        // Nếu có chế độ ăn uống, thêm vào danh sách
        if (dietaryPreferenceName) {
          updatedList = [
            ...updatedList,
            {
              id: 6,
              name: dietaryPreferenceName,
              dishType: dietaryPreferenceName,
            },
          ];
        }

        setDishTypeList(updatedList); // Cập nhật danh sách
      } catch (error) {
        console.error("Error loading user dietary preference:", error);
      }
    };

    loadUserDietaryPreference();
  }, []);

  // Hàm lấy danh sách món ăn theo chế độ ăn uống
  const fetchDishesByDietaryPreference = async (dietaryPreferenceId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/getDishByDietaryPreferenceId/${dietaryPreferenceId}`
      );

      if (!response.ok) {
        console.error("Không thể lấy danh sách món ăn");
        return [];
      }

      const dishes = await response.json();
      return dishes.map((dish) => ({
        dishId: dish.dishId,
        dishName: dish.name,
        price: dish.price,
        dishType: dish.dishType,
        imageUrl: dish.imageUrl,
      }));
    } catch (error) {
      console.error("Error fetching dishes by dietary preference:", error);
      return [];
    }
  };

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
          const ratingA = a.averageRating || 0;
          const ratingB = b.averageRating || 0;
          return ratingB - ratingA; // Sắp xếp giảm dần theo rating
        });
        break;
      case "rating_low_to_high":
        sortedDishes.sort((a, b) => {
          const ratingA = a.averageRating || 0;
          const ratingB = b.averageRating || 0;
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
        sortedDishes.sort((a, b) =>
          (a.dishName || "").localeCompare(b.dishName || "")
        );
        break;
      case "z-a":
        sortedDishes.sort((a, b) =>
          (b.dishName || "").localeCompare(a.dishName || "")
        );
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
            autoFocus={fromSearch === true}
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
            {(dishTypeList || []).map((item) => (
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
                key={item.id}
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
        keyExtractor={(item, index) => item.dishId.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("DishDetail", { dishId: item.dishId })
            }
            style={styles.gridItem}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.imageUrl || "https://picsum.photos/300" }}
                style={styles.dishImage}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.textNameDish} numberOfLines={1}>
                {item.dishName || "Tên món ăn"}
              </Text>
              <Text style={styles.textDishType}>
                {item.dishType || "Loại món ăn"}
              </Text>
              <View style={styles.ratingAndPrice}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon name="star" size={16} color={COLORS.star} />
                  <Text style={styles.textDishType}>
                    {item.averageRating?.toFixed(1) || "0.0"}
                  </Text>
                </View>
                <Text style={styles.price}>
                  {item.price ? `${item.price.toLocaleString()} đ` : "0 đ"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
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

export default RecommedDishScreen;

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
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
    maxWidth: "48%", // Đảm bảo các item có kích thước bằng nhau
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
    height: 20, // Đặt chiều cao cố định để đảm bảo nhất quán
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
