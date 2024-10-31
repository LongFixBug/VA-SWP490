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

const AllDishScreen = ({ navigation, route }) => {
  const fromSearch = route.params?.fromSearch;
  const [currentDishType, setCurrentDishType] = useState(0);
  const [allDishes, setAllDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetch(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/alldish"
        );
        const jsonData = await response.json();
        if (jsonData.length % 2 !== 0) {
          jsonData.push({ dishId: "dummy" });
        }
        setAllDishes(jsonData);
        setFilteredDishes(jsonData);

        // Lấy rating trung bình cho từng món
        jsonData.forEach((dish) => {
          if (dish.dishId !== "dummy") {
            fetchDishRating(dish.dishId);
          }
        });
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    };
    fetchDishes();
  }, []);

  // Hàm lấy đánh giá trung bình cho từng món
  const fetchDishRating = async (dishId) => {
    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/getFeedbackByDishID/${dishId}`
      );
      const feedbackData = await response.json();
      const averageRating =
        feedbackData.length > 0
          ? feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0) /
            feedbackData.length
          : 0;
      setRatings((prevRatings) => ({
        ...prevRatings,
        [dishId]: averageRating,
      }));
    } catch (error) {
      console.error(`Error fetching rating for dishId ${dishId}:`, error);
    }
  };

  const filterDishesByType = async (typeId) => {
    setCurrentDishType(typeId);

    if (typeId === 0) {
      setFilteredDishes(allDishes);
    } else {
      const selectedType = dataDishType.find((type) => type.id === typeId);
      try {
        const response = await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/getDishByDishType/${selectedType.dishType}`
        );
        const jsonData = await response.json();
        if (jsonData.length % 2 !== 0) {
          jsonData.push({ dishId: "dummy" });
        }
        setFilteredDishes(jsonData);

        // Lấy rating cho từng món ăn trong loại món được chọn
        jsonData.forEach((dish) => {
          if (dish.dishId !== "dummy") {
            fetchDishRating(dish.dishId);
          }
        });
      } catch (error) {
        console.error("Error fetching filtered dishes:", error);
      }
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);

    const cleanedQuery = text
      .replace(/[\d.,\/?'";:{}[\]+=_)(*&%$#@!~\\|]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const filtered = allDishes.filter((dish) => {
      const dishName = dish.name
        ?.replace(/[\d.,\/?'";:{}[\]+=_)(*&%$#@!~\\|]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      return dishName?.includes(cleanedQuery);
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
              onPress={() =>
                navigation.navigate("DishDetail", { dishId: item.dishId })
              }
              style={styles.gridItem}
            >
              <Image
                source={{
                  uri: item.imageUrl || "https://picsum.photos/300",
                }}
                style={{
                  width: "100%",
                  height: 100,
                  resizeMode: "cover",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              />
              <View style={{ padding: 5 }}>
                <Text style={styles.textNameDish} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.textDishType}>{item.dishType}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Icon name="star" size={16} color={COLORS.star} />
                    <Text style={styles.textDishType} numberOfLines={1}>
                      {" "}
                      {ratings[item.dishId]?.toFixed(1) || "0.0"}
                    </Text>
                  </View>
                  <Text style={styles.textDishType}>{item.price} đ</Text>
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
    maxWidth: "48%",
  },
  textNameDish: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishType: {
    color: COLORS.grey,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  dummyItem: {
    flex: 1,
    margin: 10,
    backgroundColor: "transparent",
  },
});
