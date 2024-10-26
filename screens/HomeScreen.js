import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
  View,
  Text,
  Image,
  Easing,
  StyleSheet,
  ImageBackground,
  Pressable,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";

const { width, height } = Dimensions.get("window");

const AnimatedText = ({ text }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const textWidth = text.length * 15; // Mỗi ký tự rộng khoảng 14px
    const containerWidth = 200; // Chiều rộng vùng chứa văn bản

    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -(textWidth - containerWidth),
          duration: 3000, // Thời gian di chuyển sang trái
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 3000, // Thời gian di chuyển lại về phải
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, [text]);

  return (
    <View style={{ width: 200, overflow: "hidden" }}>
      <Animated.Text
        style={{
          transform: [{ translateX }],
        }}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Fetch dishes from API
  const fetchDishes = async () => {
    try {
      const response = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionists/alldish"
      );
      const jsonData = await response.json();
      // console.log("Fetched data: ", jsonData); // Log the fetched data
      setDishes(jsonData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = dishes.filter((dish) =>
        dish.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (dish) => {
    navigation.navigate("DishDetail", { dish });
    setSearchResults([]); // Clear suggestions after selection
  };

  const handleSearchIconPress = () => {
    // Loại bỏ các ký tự không phải chữ hoặc dấu câu (ngoại trừ khoảng trắng) và xóa khoảng trắng thừa
    const cleanedQuery = searchQuery
      .replace(/[\d.,\/?'";:{}[\]+=_)(*&%$#@!~\\|]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (cleanedQuery.length > 0) {
      navigation.navigate("SearchDishes", { searchQuery: cleanedQuery });
    }
  };

  const renderDishItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("DishDetail", { dish: item })}
    >
      <View style={styles.dishItem}>
        <Text>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          // uri: "https://static.vecteezy.com/system/resources/previews/005/182/612/non_2x/green-abstract-geometric-shape-background-free-vector.jpg",
          uri: "https://img.freepik.com/premium-photo/glowing-green-gradient-background-smooth-gradient-flat-design-high-resolution-high-quality-high_1110519-4518.jpg",
        }}
        style={{
          position: "absolute", // Đặt vị trí tuyệt đối
          top: 0,
          left: 0,
          width: "200%",
          height: "100%",
          resizeMode: "cover",
          zIndex: -1, // Cho nó chìm xuống dưới cùng
        }}
      ></ImageBackground>
      <View
        style={{
          padding: 20,
          marginTop: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ width: "50%" }}>
          <Text
            style={{
              fontFamily: FONTS.bold,
              color: COLORS.white,
              fontSize: 23,
            }}
          >
            Xin chào!
          </Text>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              color: COLORS.white,
              fontSize: 18,
            }}
          >
            Nguyễn hải Long
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              alignItems: "flex-end",
              marginRight: 8,
              padding: 5,
              borderRadius: 5,
              elevation: 0,
              // borderWidth:1,
              // borderColor: COLORS.white,
              // padding: 5,
              // borderRadius: 8
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.bold,
                color: COLORS.white,
                fontSize: 13,
                alignSelf: "center",
                borderBottomWidth: 1,
                borderBottomColor: "white",
                paddingBottom: 3,
              }}
            >
              <Icon name="star" size={16} color={COLORS.white} /> 1200 điểm
            </Text>
            <Text
              style={{
                fontFamily: FONTS.bold,
                color: COLORS.yellow,
                fontSize: 12,
              }}
            >
              Vàng
            </Text>
          </View>
          <Pressable
            onPress={() => {
              navigation.navigate("Profile");
            }}
          >
            <Image
              source={{
                uri: "https://picsum.photos/200/300",
              }}
              style={{
                height: 55,
                width: 55,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: COLORS.white,
              }}
            />
          </Pressable>
        </View>
      </View>

      {/* <View style={styles.userInfo}>
        <Image source={{ uri: userData.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.greeting}>xin chào,</Text>
          <Text style={styles.username}>{userData.name}</Text>
        </View>
        <View style={styles.points}>
          <Text style={styles.pointNumber}>{userData.points} điểm</Text>
          <Text style={styles.pointLabel}>{userData.rank}</Text>
        </View>
      </View> */}

      {/* Feature Icons */}
      <View style={styles.featureIcons}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AllDishes")}
          style={{
            padding: 10,
            backgroundColor: COLORS.white,
            borderRadius: 10,
            elevation: 10,
            alignItems: "center",
            width: "25%",
          }}
        >
          <Icon name="restaurant-outline" size={30} color={COLORS.green} />
          <Text style={{ fontFamily: FONTS.semiBold }}>Món Ăn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Menu")}
          style={{
            padding: 10,
            backgroundColor: COLORS.white,
            borderRadius: 10,
            elevation: 10,
            alignItems: "center",
            width: "25%",
          }}
        >
          <Icon name="book-outline" size={30} color={COLORS.green} />
          <Text style={{ fontFamily: FONTS.semiBold }}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Favourite")}
          style={{
            padding: 10,
            backgroundColor: COLORS.white,
            borderRadius: 10,
            elevation: 10,
            alignItems: "center",
            width: "25%",
          }}
        >
          <Icon name="heart-outline" size={30} color={COLORS.green} />
          <Text style={{ fontFamily: FONTS.semiBold }}>Yêu thích</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Cart */}
      <View style={styles.searchCartContainer}>
        <View style={styles.searchContainer}>
          <Icon
            name="search-outline"
            size={24}
            color={COLORS.grey}
            onPress={handleSearchIconPress}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm món ăn..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Cart")}
        >
          <View
            style={{
              height: 50,
              width: 50,
              marginRight: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.white,
              borderRadius: 10,
              elevation: 0,
            }}
          >
            <Icon name={"cart-outline"} size={30} color={COLORS.green} />
            <Text style={styles.bagdeCart}>77</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Suggestions */}
      {searchResults.length > 0 && (
        <View style={styles.searchSuggestions}>
          {searchResults.map((result) => (
            <TouchableOpacity
              key={result.id}
              onPress={() => handleSearchSelect(result)}
            >
              <Text style={styles.suggestionText}>{result.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Dishes Section */}
      <View style={styles.dishHeader}>
        <Text style={styles.sectionTitle}>Món ăn dành cho bạn</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllDishes")}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dishes}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("DishDetail", { dish: item })}
          >
            <View style={styles.gridItem}>
              <Image
                source={{ uri: item.imageUrl }}
                style={{
                  width: "100%",
                  height: 100,
                  resizeMode: "cover",
                }}
              />
              <View style={{ padding: 5 }}>
                {/* Sử dụng AnimatedText cho tên món ăn */}
                <AnimatedText text={item.name} />
                {/* <Text style={styles.textNameDish} numberOfLines={1}>
                  {item.name}
                </Text> */}
                <Text style={styles.textDishType}>
                  {item.dishType || "Món ăn"}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.rating}>
                      {item.average_rating || 0}
                    </Text>
                  </View>
                  <Text style={styles.textDishType}>
                    {item.price ? `${item.price} đ` : ".000 đ"}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: "5%",
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.grey,
  },
  username: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  points: {
    alignItems: "center",
  },
  pointNumber: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  pointLabel: {
    fontSize: 12,
    color: COLORS.grey,
  },
  featureIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  iconItem: {
    alignItems: "center",
    width: "30%",
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.black,
  },
  searchCartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.grey,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },

  searchSuggestions: {
    position: "absolute",
    top: 300,
    right: "20%",
    width: "85%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 1,
    alignSelf: "center",
    borderRadius: 5,
  },
  suggestionText: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dishHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  viewAll: {
    fontSize: 14,
    color: COLORS.green,
    fontFamily: FONTS.regular,
  },
  dishItem: {
    backgroundColor: COLORS.lightGray,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width: width / 2 - 30,
  },
  bagdeCart: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 12,
    width: 23,
    height: 23,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: COLORS.red,
    borderRadius: 150,
    position: "absolute",
    top: 0,
    right: 0,
  },
  gridItem: {
    flex: 1,
    margin: 10, // Điều chỉnh margin phù hợp
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    overflow: "hidden",
    width: width / 2 - 25, // Cập nhật lại để vừa căn đều hai bên
  },
  dummyItem: {
    flex: 1,
    margin: 50,
    backgroundColor: "transparent",
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
  star: {
    fontSize: 14,
    color: "gold",
  },
  rating: {
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 5,
  },
});

export default HomeScreen;
