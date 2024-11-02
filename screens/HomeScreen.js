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
import AsyncStorage from '@react-native-async-storage/async-storage';


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
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [tierId, setTierId] = useState(null);
  const [accumulatedPoints, setAccumulatedPoints] = useState(0);
  const [tierLabel, setTierLabel] = useState("");


  const fetchMembershipData = async (id) => {
    try {
      console.log(`Đang gọi API với userId: ${id}`);
      const response = await fetch(`https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membership/${id}`);
      
      if (!response.ok) {
        console.error("HTTP Error:", response.status, response.statusText);
        return;
      }
  
      const rawResponse = await response.text();
      console.log("Phản hồi thô từ API:", rawResponse);
  
      if (!rawResponse) {
        console.log("Người dùng chưa có đóng góp, hiển thị tier Bronze");
        
        // Gọi API getUserByUserId để lấy thông tin người dùng
        const userResponse = await fetch(`https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${id}`);
        
        if (!userResponse.ok) {
          console.error("HTTP Error khi gọi API getUserByUserId:", userResponse.status, userResponse.statusText);
          return;
        }
  
        const userData = await userResponse.json();
        console.log("Dữ liệu người dùng:", userData);
  
        // Cài đặt thông tin người dùng và hiển thị tier là Bronze
        setUsername(userData.username || "Unknown User");
        setTierLabel("Bronze");
        setAccumulatedPoints(0);
        
        return;
      }
  
      // Nếu có dữ liệu membership, xử lý như bình thường
      const data = JSON.parse(rawResponse);
      console.log("Dữ liệu membership:", data);
  
      if (data) {
        setUsername(data.username || "Unknown User");
        setTierId(data.tierId);
        setAccumulatedPoints(data.accumulatedPoints);
  
        switch (data.tierId) {
          case 1:
            setTierLabel("Silver");
            break;
          case 2:
            setTierLabel("Gold");
            break;
          case 3:
            setTierLabel("Platinum");
            break;
          case 4:
            setTierLabel("Diamond");
            break;
          default:
            setTierLabel("N/A");
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu membership:", error);
    }
  };
  
  
  


    // Lấy userId từ AsyncStorage
    useEffect(() => {
      const getUserIdFromStorage = async () => {
          try {
              const storedUserId = await AsyncStorage.getItem('userId');
              console.log("User ID lấy từ AsyncStorage:", storedUserId); // Thêm log để kiểm tra
              if (storedUserId) {
                  setUserId(storedUserId);
                  console.log("User ID đã được set:", storedUserId); // Thêm log để kiểm tra
                  fetchMembershipData(storedUserId);
              } else {
                  console.log("Không tìm thấy User ID trong AsyncStorage."); // Thêm log để kiểm tra
              }
          } catch (error) {
              console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
          }
      };
  
      getUserIdFromStorage();
  }, []);


  // Fetch rating for each dish
  const fetchDishRating = async (dishId) => {
    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/getFeedbackByDishID/${dishId}`
      );
      const jsonData = await response.json();
      const ratings = jsonData.map((feedback) => feedback.rating);
      const averageRating = ratings.length
        ? (
            ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length
          ).toFixed(1)
        : "0.0";
      return parseFloat(averageRating);
    } catch (error) {
      console.error(`Error fetching rating for dish ${dishId}:`, error);
      return 0;
    }
  };



  // Fetch dishes from API and add rating for each dish
  const fetchDishes = async () => {
    try {
      const response = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/alldish"
      );
      const jsonData = await response.json();

      // Map through dishes to add ratings
      const dishesWithRatings = await Promise.all(
        jsonData.map(async (dish) => {
          const rating = await fetchDishRating(dish.dishId);
          return { ...dish, averageRating: rating };
        })
      );

      setDishes(dishesWithRatings);
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
    navigation.navigate("DishDetail", { dishId: dish.dishId }); // Truyền dishId thay vì dish
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
      onPress={() => navigation.navigate("DishDetail", { dishId: item.dishId })} // Truyền dishId thay vì toàn bộ dish
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
          uri: "https://img.freepik.com/free-vector/gradient-background-green-tones_23-2148361057.jpg?t=st=1730213577~exp=1730217177~hmac=26a87cd41f3c181425f09787c4ccc85c3346646104a3071504cfb8496d240a60&w=996",
          //  uri: "https://img.freepik.com/premium-photo/glowing-green-gradient-background-smooth-gradient-flat-design-high-resolution-high-quality-high_1110519-4518.jpg",
        }}
        style={{
          position: "absolute", // Đặt vị trí tuyệt đối
          top: 0,
          left: 0,
          width: "110%",
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
            {username}
          </Text>
        </View>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Membership")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                alignItems: "flex-end",
                marginRight: 8,
                padding: 5,
                borderRadius: 5,
                elevation: 0,
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
                <Icon name="star" size={16} color={COLORS.white} /> {accumulatedPoints} điểm
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  color: COLORS.diamond,
                  fontSize: 12,
                }}
              >
                {tierLabel}
              </Text>
            </View>
            <Image
              source={{
                uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
              }}
              style={{
                height: 55,
                width: 55,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: COLORS.white,
              }}
            />
          </View>
        </TouchableOpacity>
      </View>

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
        keyExtractor={(item, index) =>
          item.dishId ? item.dishId.toString() : index.toString()
        }
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.dishId || String}
            onPress={() =>
              navigation.navigate("DishDetail", { dishId: item.dishId })
            }
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
                <AnimatedText text={item.name} />
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
                      {item.averageRating || "0.0"}
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
    marginLeft: 19,

    width: "79%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 1,

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
    color: COLORS.white,
  },
  viewAll: {
    fontSize: 14,
    color: COLORS.white,
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
    marginHorizontal: 5,
    marginBottom: 10,
    marginTop: 20,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    overflow: "hidden",
    width: width / 2 - 30, // Đảm bảo kích thước cố định để 2 cột hiển thị đều nhau
  },
  dummyItem: {
    flex: 1,
    marginHori0ontal: 5,
    marginBottom: 10,
    backgroundColor: "transparent",
    width: "45%",
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
