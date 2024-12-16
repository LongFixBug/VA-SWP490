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
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [tierId, setTierId] = useState(null);
  const [accumulatedPoints, setAccumulatedPoints] = useState(0);
  const [tierLabel, setTierLabel] = useState("");
  const [userData, setUserData] = useState(null);

  const [cartCount, setCartCount] = useState(0);
  const [groupedDishes, setGroupedDishes] = useState({
    "Món chính": [],
    "Khai vị": [],
    "Đồ uống": [],
  });

  const rankColors = {
    Bronze: "#333300", // Bronze color
    Silver: "#C0C0C0", // Silver color
    Gold: "#f5d114", // Gold color
    Platinum: "#1b93e3", // Platinum color
  };

  const fetchWithAuth = async (url, options = {}, navigation) => {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
      Toast.show({
        type: "error",
        text1: "Phiên đăng nhập đã hết hạn",
        text2: "Vui lòng đăng nhập lại.",
      });
      navigation.replace("Login"); // Điều hướng về màn hình đăng nhập
      return; // Kết thúc hàm
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        Toast.show({
          type: "error",
          text1: "Phiên đăng nhập đã hết hạn",
          text2: "Vui lòng đăng nhập lại.",
        });
        navigation.replace("Login"); // Điều hướng về màn hình đăng nhập
        return; // Kết thúc hàm
      }
      return response;
    } catch (error) {
      console.error("Error fetching with auth:", error);
      throw error;
    }
  };

  const fetchMembershipData = async (id) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membership/${id}`
      );

      if (!response.ok) {
        console.error("HTTP Error:", response.status, response.statusText);
        return;
      }

      const rawResponse = await response.text();

      if (!rawResponse) {
        const userResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${id}`
        );

        if (!userResponse.ok) {
          console.error(
            "HTTP Error khi gọi API getUserByUserId:",
            userResponse.status,
            userResponse.statusText
          );
          return;
        }

        const userData = await userResponse.json();

        setUsername(userData.username || "Unknown User");
        setTierLabel("Bronze");
        setAccumulatedPoints(0);
        await AsyncStorage.setItem(
          "membershipData",
          JSON.stringify({ tierName: "Bronze", discountRate: 0 })
        );

        return;
      }

      const membershipData = JSON.parse(rawResponse);

      if (membershipData) {
        setUsername(membershipData.username || "Unknown User");
        setTierId(membershipData.tierId);
        setAccumulatedPoints(membershipData.accumulatedPoints);

        const tierResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membershipTier/${membershipData.tierId}`
        );

        if (!tierResponse.ok) {
          console.error(
            "HTTP Error khi gọi API membershipTier:",
            tierResponse.status,
            tierResponse.statusText
          );
          return;
        }

        const tierData = await tierResponse.json();

        if (tierData) {
          setTierLabel(tierData.tierName || "N/A");

          await AsyncStorage.setItem(
            "membershipData",
            JSON.stringify({
              tierName: tierData.tierName || "N/A",
              discountRate: tierData.discountRate || 0,
            })
          );

          // Check and create discount history
          const discountRates = { 2: 0.1, 3: 0.2, 4: 0.3 }; // Tier-to-discount mapping
          if (membershipData.tierId >= 2 && membershipData.tierId <= 4) {
            const discountRate = discountRates[membershipData.tierId];
            const currentDate = new Date();
            const expirationDate = new Date();
            expirationDate.setDate(currentDate.getDate() + 7);

            const discountPayload = {
              userId: id,
              tierId: membershipData.tierId,
              grantedDate: currentDate.toISOString(),
              discountRate: discountRate,
              status: "active",
              expirationDate: expirationDate.toISOString(),
            };

            const discountResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history`,
              {
                method: "POST",
                body: JSON.stringify(discountPayload),
              }
            );

            if (!discountResponse.ok) {
              console.error(
                "Error creating discount history:",
                discountResponse.status,
                discountResponse.statusText
              );
            } else {
              console.log("Discount history created successfully!");
            }
          }
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
        const storedUserId = await AsyncStorage.getItem("userId");
        // console.log("User ID retrieved from AsyncStorage:", storedUserId);

        if (storedUserId) {
          setUserId(storedUserId);
          fetchUserData(storedUserId); // Fetch user data with the userId
          fetchMembershipData(storedUserId);
        } else {
          console.log("No User ID found in AsyncStorage.");
        }
      } catch (error) {
        console.error("Error retrieving userId from AsyncStorage:", error);
      }
    };

    getUserIdFromStorage();
  }, []);

  const fetchUserData = async (id) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${id}`
      );

      if (!response.ok) {
        console.error(
          "HTTP Error when fetching user data:",
          response.status,
          response.statusText
        );
        return;
      }

      const data = await response.json();
      // console.log("User data retrieved from API:", data);

      const userData = {
        userId: data.userId,
        username: data.username || "Người dùng",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
        gender: data.gender || "",
        dietaryPreferenceId: data.dietaryPreferenceId || 1,
        goal: data.goal || "",
        activityLevel: data.activityLevel || "",
        age: data.age || 0,
        imageUrl: data.imageUrl || "https://via.placeholder.com/100",
        height: data.height || 0,
        weight: data.weight || 0,
        profession: data.profession || "",
        isPhoneVerified: data.isPhoneVerified || false,
      };
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setUserData(data); // Đặt dữ liệu người dùng vào state nếu cần
      setUsername(data.username); // Cập nhật username trực tiếp
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  const debugAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);
      // console.log("AsyncStorage Data:", data);
    } catch (error) {
      console.error("Error debugging AsyncStorage:", error);
    }
  };

  debugAsyncStorage();

  // Fetch rating for each dish
  const fetchDishRating = async (dishId) => {
    try {
      const response = await fetchWithAuth(
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
      const response = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/allDish"
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

      // Filter and group dishes by dishType
      const grouped = dishesWithRatings.reduce((acc, dish) => {
        if (["Món chính", "Khai vị", "Đồ uống"].includes(dish.dishType)) {
          acc[dish.dishType] = [...(acc[dish.dishType] || []), dish];
        }
        return acc;
      }, {});

      setGroupedDishes(grouped);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const refreshCartCount = async () => {
    try {
      if (userId) {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/getCartByUserId/${userId}`
        );
        const data = await response.json();

        // Lọc các mục có quantity > 0 và đếm số lượng
        const validCartItems = data.filter((item) => item.quantity > 0);
        setCartCount(validCartItems.length); // Cập nhật số lượng món ăn có quantity > 0
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu giỏ hàng từ API:", error);
    }
  };

  // Fetch recommended dishes from API

  const refreshData = async () => {
    setLoading(true); // Hiển thị trạng thái loading
    try {
      await refreshCartCount(); // Lấy số lượng giỏ hàng
    } catch (error) {
      console.error("Error refreshing cart count:", error);
    }

    try {
      if (userId) {
        await fetchUserData(userId); // Lấy thông tin người dùng

        await fetchMembershipData(userId); // Lấy thông tin membership
      }
    } catch (error) {
      console.error(
        "Error fetching user data, recommended dishes or membership data:",
        error
      );
    }

    setLoading(false); // Tắt trạng thái loading
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      refreshData(); // Gọi lại API khi màn hình được focus
    });

    return unsubscribe; // Dọn dẹp listener khi component unmount
  }, [navigation, userId]);

  const renderDishItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("DishDetail", { dishId: item.dishId })}
    >
      <View style={styles.gridItem}>
        <Image
          source={{
            uri: item.imageUrl || "https://via.placeholder.com/150",
          }}
          style={{
            width: "100%",
            height: 100,
            resizeMode: "cover",
          }}
        />
        <View style={{ padding: 5 }}>
          {/* Tên món ăn */}
          <Text
            style={styles.textNameDish}
            numberOfLines={1} // Giới hạn 1 dòng
            ellipsizeMode="tail" // Thêm "..." nếu tên quá dài
          >
            {item.name || "Tên món ăn"}
          </Text>

          {/* Loại món ăn */}
          <Text style={styles.textDishType}>
            {item.dishType || "Loại món ăn"}
          </Text>

          {/* Rating và Giá */}
          <View style={styles.ratingAndPrice}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.rating}>
                {item.averageRating?.toFixed(1) || "0.0"}
              </Text>
            </View>
            <Text style={styles.price}>
              {item.price ? `${item.price.toLocaleString()} vnđ` : "0.000 đ"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://img.freepik.com/premium-photo/glowing-green-gradient-background-smooth-gradient-flat-design-high-resolution-high-quality-high_1110519-4518.jpg",
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
        <View style={{ width: "50%", marginLeft: -18 }}>
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
            {userData?.username}
          </Text>
        </View>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Membership")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                    fontSize: 13,
                    color: rankColors[tierLabel] || COLORS.white, // Use rankColors dynamically
                    alignSelf: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: rankColors[tierLabel] || "white", // Apply the same color to underline
                    paddingBottom: 3,
                  }}
                >
                  Đang có {accumulatedPoints} điểm
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    fontSize: 13,
                    color: rankColors[tierLabel] || COLORS.white, // Apply dynamic color to tierLabel

                    marginTop: 3,
                  }}
                >
                  <Icon name="trophy" size={16} color={rankColors[tierLabel]} />{" "}
                  Hạng {tierLabel}
                </Text>
              </View>
            </View>

            <Image
              source={{
                uri:
                  userData?.imageUrl ||
                  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?t=st=1731033718~exp=1731037318~hmac=2705f80ce81289818508e796cf321f2dbc40c8b93ee5cbe6aaf29a1728c38682&w=740",
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
          onPress={
            () => navigation.navigate("Recommend") // Truyền tham số dishType
          }
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
          <Text style={{ fontFamily: FONTS.semiBold, textAlign: "center" }}>
            Món Ăn Cho Bạn
          </Text>
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
          <Text style={{ fontFamily: FONTS.semiBold, textAlign: "center" }}>
            {" "}
            Menu Cho Bạn
          </Text>
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
          <Text style={{ fontFamily: FONTS.semiBold, textAlign: "center" }}>
            Món Ăn Yêu thích
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search & Cart */}
      {/* Search & Cart */}
      <View style={styles.searchCartContainer}>
        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate("AllDishes", { fromSearch: true })} // Điều hướng đến AllDishes
        >
          <Icon name="search-outline" size={24} color={COLORS.grey} />
          <Text style={styles.searchPlaceholder}>Tìm món ăn...</Text>
        </TouchableOpacity>

        {/* Cart icon */}
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
            {cartCount > 0 && <Text style={styles.bagdeCart}>{cartCount}</Text>}
          </View>
        </TouchableOpacity>
      </View>

      {/* Dishes Section */}
      <View style={styles.dishHeader}>
        <Text style={styles.sectionTitle}>Danh sách món ăn</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllDishes")}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text
          style={{ color: COLORS.white, textAlign: "center", marginTop: 20 }}
        >
          Đang tải dữ liệu...
        </Text>
      ) : (
        <ScrollView>
          {
            //Define the order here
            ["Món chính", "Khai vị", "Đồ uống"].map((dishType) => {
              if (
                !groupedDishes[dishType] ||
                groupedDishes[dishType].length === 0
              )
                return null;
              return (
                <View key={dishType} style={{ marginBottom: 2 }}>
                  <Text style={styles.dishTypeTitle}>{dishType}</Text>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                  >
                    {groupedDishes[dishType].map((dish, index) => (
                      <View key={dish.dishId}>
                        {renderDishItem({ item: dish })}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              );
            })
          }
        </ScrollView>
      )}
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
  dishHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginLeft: 2,
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
    marginTop: 5,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    overflow: "hidden",
    width: width / 2 - 30, // Kích thước item
  },
  textNameDish: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
    height: 20, // Đặt chiều cao cố định để tránh thay đổi
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
  price: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: FONTS.bold,
  },
  dishTypeTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    // marginBottom: 10,
    marginTop: 10,
    marginLeft: 2,
  },
});

export default HomeScreen;
