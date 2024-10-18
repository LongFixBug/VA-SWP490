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
import { useNavigation } from "@react-navigation/native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";

const AllDishesScreen = () => {
  const navigation = useNavigation();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách món ăn
  const fetchDishes = async () => {
    try {
      const response = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionists/alldish"
      );
      const jsonData = await response.json();
      console.log("Fetched data: ", jsonData); // Log the fetched data
      setFoodItems(jsonData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("DishDetail", { dish: item })}
    >
      <View style={styles.foodCard}>
        <Image
          source={{ uri: item.imageUrl }} // Sử dụng đúng imageUrl từ API
          style={styles.foodImage}
        />
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodPrice}>{item.price} VND</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xem tất cả</Text>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Tìm kiếm món ăn" />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* List of Food Items */}
      <FlatList
        data={foodItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.dishId.toString()} // Correct keyExtractor
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 10,
  },
  filterText: {
    fontSize: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AllDishesScreen;
