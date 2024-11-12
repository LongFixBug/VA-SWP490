import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";

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

const SearchDishesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { searchQuery } = route.params;
  const [filteredDishes, setFilteredDishes] = useState([]);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetch(
          "https://va-api-2efefb5aee82.herokuapp.com/dishes"
        );
        const jsonData = await response.json();
        const dishes = jsonData.data;

        const results = dishes.filter((dish) =>
          dish.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredDishes(results);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    };

    fetchDishes();
  }, [searchQuery]);

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("DishDetail", { dish: item })}
    >
      <View style={styles.foodCard}>
        <Image source={{ uri: item.image_url }} style={styles.foodImage} />
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodPrice}>{item.price} VND</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{item.average_rating || 0}</Text>
            <Text style={styles.comments}>
              ({item.feedbacks.length} đánh giá)
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results for "{searchQuery}"</Text>
      </View>
      <FlatList
        data={filteredDishes}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={true}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  foodInfo: {
    justifyContent: "center",
  },
  foodName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  foodPrice: {
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    fontSize: 14,
    color: "gold",
  },
  rating: {
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 5,
  },
  comments: {
    fontSize: 14,
    color: COLORS.grey,
    marginLeft: 5,
  },
});

export default SearchDishesScreen;
