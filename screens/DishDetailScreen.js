import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
  Easing,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import Swiper from "react-native-swiper";
import Toast from "react-native-toast-message";
import { PieChart } from "react-native-chart-kit";

import COLORS from "../constants/color";
import FONTS from "../constants/font";

// Hàm dịch (translate) các chất dinh dưỡng sang tiếng Việt
const translateKey = (key) => {
  switch (key) {
    case "calories":
      return "Lượng calo ";
    case "protein":
      return "Lượng protein ";
    case "carbs":
      return "Lượng carbs ";
    case "fat":
      return "Lượng chất béo ";
    case "fiber":
      return "Lượng chất xơ ";
    case "water":
      return "Lượng nước ";
    case "sodium":
      return "Lượng natri ";
    case "sugars":
      return "Lượng đường ";
    case "calcium":
      return "Lượng canxi ";
    case "iron":
      return "Lượng sắt ";
    case "magnesium":
      return "Lượng magie ";
    case "omega3":
      return "Lượng omage 3 ";
    case "sugars":
      return "Lượng đường ";
    case "cholesterol":
      return "Lượng cholesterol ";
    case "vitaminA":
      return "Lượng Vitamin A ";
    case "vitaminB":
      return "Lượng Vitamin B ";
    case "vitaminC":
      return "Lượng Vitamin C ";
    case "vitaminD":
      return "Lượng Vitamin D ";
    case "vitaminE":
      return "Lượng Vitamin E ";
    default:
      return key;
  }
};

const DishDetailScreen = ({ navigation, route }) => {
  const { dishId, navigatedFromRecommed } = route.params;

  // -------------------- State chung --------------------
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMoreAttribute, setShowMoreAttribute] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [nutrition, setNutrition] = useState({});

  // -------------------- Modal gợi ý món ăn --------------------
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [loadingRecommendModal, setLoadingRecommendModal] = useState(false);

  // -------------------- Modal hiển thị món gợi ý được bấm --------------------
  const [showRecommendedDishModal, setShowRecommendedDishModal] =
    useState(false);
  const [selectedRecommendedDish, setSelectedRecommendedDish] = useState(null);
  const [
    selectedRecommendedDishNutrition,
    setSelectedRecommendedDishNutrition,
  ] = useState({});
  const [selectedRecommendedDishLoading, setSelectedRecommendedDishLoading] =
    useState(false);

  // -------------------- So sánh dinh dưỡng (tổng) - CÁCH CŨ --------------------
  // (Vẫn giữ lại làm ví dụ, nếu không cần có thể xoá)
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [totalMealMatchPercentage, setTotalMealMatchPercentage] = useState(0);
  const [nutrientMatchDetails, setNutrientMatchDetails] = useState([]); // (Cách cũ)

  // -------------------- So sánh dinh dưỡng (MỚI) --------------------
  const [showNewMatchingModal, setShowNewMatchingModal] = useState(false); // Modal mới
  // Lưu dữ liệu trả về từ API /CalculateTotalNutritionAndCompatibility
  const [compatibilityData, setCompatibilityData] = useState(null);
  // Lưu dữ liệu trả về từ API /CalculateTotalNutritionForMeal
  const [mealNutritionData, setMealNutritionData] = useState(null);
  // Danh sách các chất cần hiển thị, chỉ gồm những chất > 60% và tồn tại ở mealNutritionData
  const [filteredNutrients, setFilteredNutrients] = useState([]);

  // Animated values cho danh sách gợi ý
  const animatedValues = useRef(new Map()).current;

  // -------------------- fetchWithAuth (token) --------------------
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

  // -------------------- Lấy userId --------------------
  useEffect(() => {
    const getUserIdFromStorage = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          checkIfFavorite(storedUserId);
        }
      } catch (error) {
        console.error("Lỗi khi lấy userId:", error);
      }
    };
    getUserIdFromStorage();
  }, []);

  // -------------------- API lấy dish, ingredients, feedback, nutrition --------------------
  useEffect(() => {
    const fetchDishDetail = async () => {
      try {
        const res = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${dishId}`
        );
        if (res.ok) {
          const data = await res.json();
          setDish(data);
        }
      } catch (error) {
        console.error("Error fetching dish details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchIngredients = async () => {
      try {
        const res = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${dishId}`
        );
        if (res.ok) {
          const data = await res.json();
          const ingredientsWithNames = await Promise.all(
            data.map(async (item) => {
              const res2 = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${item.ingredientId}`
              );
              if (res2.ok) {
                const detail = await res2.json();
                return { ...item, name: detail.name };
              }
              return item;
            })
          );
          setIngredients(ingredientsWithNames);
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    const fetchNutrition = async () => {
      try {
        const res = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/calculateNutrition/${dishId}`
        );
        if (res.ok) {
          const data = await res.json();
          setNutrition(data);
        }
      } catch (error) {
        console.error("Error fetching nutrition:", error);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const res = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/getFeedbackByDishID/${dishId}`
        );
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data);

          if (data.length > 0) {
            const totalRating = data.reduce((acc, fb) => acc + fb.rating, 0);
            setAverageRating((totalRating / data.length).toFixed(1));
          } else {
            setAverageRating("0.0");
          }
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchDishDetail();
    fetchIngredients();
    fetchNutrition();
    fetchFeedbacks();
  }, [dishId]);

  // -------------------- checkIfFavorite --------------------
  const checkIfFavorite = async (uid) => {
    if (!uid) return;
    try {
      const res = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/allDishFavoriteByUserId/${uid}`
      );
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const favorites = JSON.parse(text);
          const isFavorite = favorites.some(
            (f) => f.dishId === parseInt(dishId)
          );
          setIsFavorited(isFavorite);
        }
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  // -------------------- Thêm vào giỏ hàng --------------------
  const handleAddToCart = async (targetDishId) => {
    const idToAdd = targetDishId || dishId;

    if (!userId) {
      console.log("User ID missing.");
      return;
    }
    try {
      const res = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/addToCart",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            dishId: idToAdd,
            quantity: 1,
          }),
        }
      );
      if (res.ok) {
        console.log("Đã thêm vào giỏ hàng.");
        showToastAddToCart();
      } else {
        console.error("Failed to add to cart:", res.status);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // -------------------- Favorite Toggle --------------------
  const handleFavoriteToggle = async () => {
    if (!userId) return;
    if (isFavorited) {
      // Xoá
      try {
        await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/deleteFavoriteDish",
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              favoriteId: 0,
              userId: parseInt(userId),
              dishId: dishId,
              favoriteDate: new Date().toISOString(),
            }),
          }
        );
        setIsFavorited(false);
        showToastFavorite(false); // Hiển thị toast khi bỏ thích
      } catch (error) {
        console.error("Error removing favorite dish:", error);
      }
    } else {
      // Thêm
      try {
        await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/createFavoriteDish",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              favoriteId: 0,
              userId: parseInt(userId),
              dishId: dishId,
              favoriteDate: new Date().toISOString(),
            }),
          }
        );
        setIsFavorited(true);
        showToastFavorite(true); // Hiển thị toast khi thêm yêu thích
      } catch (error) {
        console.error("Error adding favorite dish:", error);
      }
    }
  };
  // -------------------- Toast --------------------
  const showToastAddToCart = () => {
    Toast.show({
      type: "success",
      text1: "Thông báo",
      text2: "Thêm vào giỏ hàng thành công! 👋",
    });
  };
  const showToastFavorite = (isFavorited) => {
    Toast.show({
      type: "success",
      text1: "Thông báo",
      text2: isFavorited
        ? "Đã thêm vào yêu thích! ❤️"
        : "Đã bỏ khỏi yêu thích!",
    });
  };

  // -------------------- Render Stars --------------------
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={`full-${i}`} name="star" size={16} color={COLORS.star} />
      );
    }
    if (halfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={16} color={COLORS.star} />
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color={COLORS.star}
        />
      );
    }
    return stars;
  };

  // -------------------- CÁCH CŨ: Hàm fetch thông tin dinh dưỡng user (trong 1 ngày) --------------------
  // (Nếu không còn dùng, bạn có thể xóa hoặc tắt)
  const fetchUserNutrition = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("Không tìm thấy User ID.");
      }

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionCriterions/getUserNutritionCriteriaDetailByUserId/${userId}`
      );

      if (!response.ok) {
        throw new Error(
          `Lỗi khi lấy dữ liệu dinh dưỡng người dùng: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error(
        "Lỗi khi lấy thông tin dinh dưỡng người dùng:",
        error.message
      );
      Alert.alert(
        "Lỗi",
        error.message || "Không thể tải dữ liệu dinh dưỡng người dùng."
      );
      return null;
    }
  };

  // -------------------- Gọi API recommendMeal --------------------
  const fetchRecommendedDishes = async () => {
    if (!userId) return;
    let loadingTimeout;
    loadingTimeout = setTimeout(() => {
      setLoadingRecommendModal(true);
    }, 300);

    setRecommendationLoading(true);
    try {
      const res = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMeal/${userId}/${dishId}`
      );
      if (res.ok) {
        const data = await res.json();
        console.log("Số món gợi ý:", data.length);
        setRecommendedDishes(data);

        // Animate
        data.forEach((_, idx) => {
          if (!animatedValues.has(idx)) {
            animatedValues.set(idx, new Animated.Value(0));
          }
        });
        data.forEach((_, idx) => {
          Animated.timing(animatedValues.get(idx), {
            toValue: 1,
            duration: 300,
            delay: 200 * idx,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }).start();
        });
      } else {
        console.error("Error recommendMeal:", res.status);
      }
    } catch (error) {
      console.error("Error fetchRecommendedDishes:", error);
    } finally {
      clearTimeout(loadingTimeout);
      setRecommendationLoading(false);
      setLoadingRecommendModal(false);
    }
  };

  // -------------------- CÁCH CŨ: So sánh dinh dưỡng (nhiều món) --------------------
  // Giữ lại làm ví dụ, nếu bạn không cần, có thể xoá bớt.
  const handleCompareNutrition = async () => {
    setMatchingLoading(true);
    try {
      // Lấy dinh dưỡng người dùng (1 ngày)
      const userNutrition = await fetchUserNutrition();
      if (!userNutrition) return;

      // Cộng dồn dinh dưỡng recommendedDishes
      let sumNutrition = {
        totalCalories: 0,
        totalFat: 0,
        totalCarbs: 0,
        totalProtein: 0,
      };

      for (let item of recommendedDishes) {
        try {
          const res = await fetchWithAuth(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/calculateNutrition/${item.dishId}`
          );
          if (res.ok) {
            const dishNutrition = await res.json();
            sumNutrition.totalCalories += dishNutrition.totalCalories || 0;
            sumNutrition.totalFat += dishNutrition.totalFat || 0;
            sumNutrition.totalCarbs += dishNutrition.totalCarbs || 0;
            sumNutrition.totalProtein += dishNutrition.totalProtein || 0;
          } else {
            console.error("Error fetch dish nutrition:", res.status);
          }
        } catch (error) {
          console.error("Error calculating dish nutrition:", error);
        }
      }

      // Chia 3
      const userPortionNutrition = {
        calories: userNutrition.calories / 3,
        fat: userNutrition.fat / 3,
        carbs: userNutrition.carbs / 3,
        protein: userNutrition.protein / 3,
      };

      // Tính
      const percentage = calculateTotalMealMatchPercentage(
        sumNutrition,
        userPortionNutrition
      );
      const details = getNutrientMatchDetails(
        sumNutrition,
        userPortionNutrition
      );

      // Lưu
      setTotalMealMatchPercentage(percentage);
      setNutrientMatchDetails(details);
      setShowMatchingModal(true);
    } catch (error) {
      console.error("Error comparing nutrition:", error);
      Alert.alert("Lỗi", "Không thể so sánh dinh dưỡng lúc này.");
    } finally {
      setMatchingLoading(false);
    }
  };

  // Hai hàm phụ cũ
  const getNutrientMatchDetails = (sumNutrition, userPortion) => {
    const nutrientKeys = [
      {
        label: "Calories",
        dishKey: "totalCalories",
        userKey: "calories",
        unit: "kcal",
      },
      { label: "Fat", dishKey: "totalFat", userKey: "fat", unit: "g" },
      { label: "Carbs", dishKey: "totalCarbs", userKey: "carbs", unit: "g" },
      {
        label: "Protein",
        dishKey: "totalProtein",
        userKey: "protein",
        unit: "g",
      },
    ];

    return nutrientKeys.map((nk) => {
      const dishValue = sumNutrition[nk.dishKey] || 0;
      const userValue = userPortion[nk.userKey] || 0;
      let ratio = 0;
      if (userValue > 0) ratio = dishValue / userValue;
      const matchPercent = Math.min(1, ratio) * 100;
      return {
        label: nk.label,
        dishValue,
        userValue,
        unit: nk.unit,
        ratio,
        matchPercent: parseFloat(matchPercent.toFixed(0)),
      };
    });
  };

  const calculateTotalMealMatchPercentage = (sumNutrition, userPortion) => {
    if (!sumNutrition || !userPortion) return 0;

    const userKeys = ["calories", "fat", "carbs", "protein"];
    let totalMatch = 0;
    let totalCriteria = userKeys.length;

    userKeys.forEach((key) => {
      let dishValue, userValue;
      switch (key) {
        case "calories":
          dishValue = sumNutrition.totalCalories;
          userValue = userPortion.calories;
          break;
        case "fat":
          dishValue = sumNutrition.totalFat;
          userValue = userPortion.fat;
          break;
        case "carbs":
          dishValue = sumNutrition.totalCarbs;
          userValue = userPortion.carbs;
          break;
        case "protein":
          dishValue = sumNutrition.totalProtein;
          userValue = userPortion.protein;
          break;
        default:
          return;
      }
      if (userValue !== 0) {
        const ratio = dishValue / userValue;
        totalMatch += Math.min(1, ratio);
      } else {
        totalCriteria--;
      }
    });

    if (totalCriteria <= 0) return 0;
    return Number(((totalMatch / totalCriteria) * 100).toFixed(0));
  };

  // -------------------- MỚI: Tính toán % compatibility + show nutrients từ 2 API --------------------
  const handleCalculateCompatibility = async () => {
    try {
      if (!userId) {
        Alert.alert("Lỗi", "Chưa có userId");
        return;
      }

      // 1) Gọi API CalculateTotalNutritionAndCompatibility
      const res1 = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/CalculateTotalNutritionAndCompatibility/${dishId}/${userId}`
      );
      if (!res1.ok) {
        throw new Error(
          "Lỗi khi gọi API CalculateTotalNutritionAndCompatibility"
        );
      }
      const compatibilityJson = await res1.json();
      setCompatibilityData(compatibilityJson);

      // 2) Tách OverallCompatibility => để hiển thị PieChart
      const overall = compatibilityJson?.OverallCompatibility || 0;

      // 3) Lấy danh sách các chất trong "Compatibility" có giá trị > 60%
      const compObj = compatibilityJson?.Compatibility || {};
      // compObj dạng: { Calories: 91.57, Protein: 63.01, ... }
      // Lọc
      const compEntries = Object.entries(compObj).filter(
        ([_, value]) => value > 60
      );
      // compEntries sẽ là mảng cặp [ 'Calories', 91.57 ], [ 'Iron', 95.4 ], ...

      // 4) Gọi API CalculateTotalNutritionForMeal lấy giá trị thực
      const res2 = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/CalculateTotalNutritionForMeal/${dishId}/${userId}`
      );
      if (!res2.ok) {
        throw new Error("Lỗi khi gọi API CalculateTotalNutritionForMeal");
      }
      const mealJson = await res2.json();
      setMealNutritionData(mealJson);

      // 5) Chỉ hiển thị những chất có trong compEntries, đồng thời mapping sang giá trị mealJson
      const merged = compEntries.map(([nutrientKey, compatValue]) => {
        // VD nutrientKey = "Calories"
        // Tìm trong mealJson => mealJson["Calories"]
        const mealValue = mealJson[nutrientKey] ?? 0; // có thể 0 nếu key không tồn tại
        return {
          nutrientName: nutrientKey,
          compatibilityValue: compatValue, // 91.57
          mealValue: mealValue, // 801.31
        };
      });

      setFilteredNutrients(merged);

      // 6) Cập nhật modal để hiển thị
      setTotalMealMatchPercentage(overall); // Dùng chung state cũ để vẽ chart
      setShowNewMatchingModal(true);
    } catch (error) {
      console.error("Lỗi handleCalculateCompatibility:", error);
      Alert.alert("Lỗi", error.message);
    }
  };

  // -------------------- Khi user bấm 1 món gợi ý => hiển thị thông tin dinh dưỡng + 2 nút --------------------
  const handleOpenRecommendedDish = async (item) => {
    setSelectedRecommendedDish(item);
    setSelectedRecommendedDishLoading(true);
    setShowRecommendedDishModal(true);

    try {
      const res = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/calculateNutrition/${item.dishId}`
      );
      if (res.ok) {
        const data = await res.json();
        setSelectedRecommendedDishNutrition(data);
      } else {
        console.error("Error fetchRecommendedDishNutrition");
      }
    } catch (error) {
      console.error("Error fetchRecommendedDishNutrition", error);
    } finally {
      setSelectedRecommendedDishLoading(false);
    }
  };

  const handleCloseRecommendedDishModal = () => {
    setShowRecommendedDishModal(false);
    setSelectedRecommendedDish(null);
    setSelectedRecommendedDishNutrition({});
    setSelectedRecommendedDishLoading(false);
  };

  // -------------------- Render từng item gợi ý --------------------
  const renderRecommendedDishItem = ({ item, index }) => {
    const animatedStyle = {
      opacity: animatedValues.get(index),
      transform: [
        {
          translateY: animatedValues.get(index).interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleOpenRecommendedDish(item)}
      >
        <Animated.View style={[styles.recommendationItem, animatedStyle]}>
          <Image
            source={{ uri: item.dish.imageUrl }}
            style={styles.recommendationImage}
          />
          <View style={styles.recommendationTextContainer}>
            <Text style={styles.recommendationDishName}>{item.dishName}</Text>
            <Text style={styles.recommendationDishType}>
              {item.dish.dishType}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // -------------------- Loading / Not found --------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text>Đang tải thông tin món ăn...</Text>
      </View>
    );
  }
  if (!dish) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy thông tin món ăn.</Text>
      </View>
    );
  }

  // -------------------- Giao diện chính --------------------
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          marginTop: StatusBar.currentHeight,
          marginBottom: 80,
        }}
      >
        {/* Top Nav */}
        <View style={styles.top}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View style={styles.backButton}>
              <Icon name="arrow-back-outline" size={28} color={COLORS.green} />
            </View>
            <Text style={styles.headerText}>Chi tiết món ăn</Text>
          </TouchableOpacity>
        </View>

        {/* Image + Price + Recommendation Button */}
        <View style={{ height: 250 }}>
          <Swiper
            showsButtons={false}
            activeDotColor={COLORS.green}
            dotColor={COLORS.white}
            autoplay={false}
          >
            <View style={styles.slide}>
              <Image
                source={{ uri: dish.imageUrl }}
                style={styles.img}
                resizeMode="cover"
              />
            </View>
          </Swiper>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              {dish.price ? dish.price.toLocaleString() + " đ" : "0 đ"}
            </Text>
          </View>

          {navigatedFromRecommed && (
            <TouchableOpacity
              style={styles.recommendButton}
              onPress={() => {
                fetchRecommendedDishes();
                setShowRecommendationModal(true);
              }}
            >
              <Icon1 name="food-variant" size={30} color={COLORS.green} />
            </TouchableOpacity>
          )}
        </View>

        {/* Dish Info */}
        <View style={{ padding: 15 }}>
          {/* Tên + Tim */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.dishName}>{dish.name}</Text>
            <TouchableOpacity
              onPress={handleFavoriteToggle}
              activeOpacity={0.8}
            >
              <View style={styles.heartIconContainer}>
                <Icon
                  name={isFavorited ? "heart" : "heart-outline"}
                  size={30}
                  color={isFavorited ? "red" : COLORS.green}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Loại + Rating */}
          <View style={styles.dishInfo}>
            <Text style={styles.dishType}>{dish.dishType}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {renderStars(averageRating)}
              <Text style={styles.ratingText}>{averageRating}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.containerAttribute}>
            <Text style={styles.titleAttribute}>Mô tả</Text>
            <Text style={styles.textAttribute}>
              {dish.description || "Không có mô tả"}
            </Text>
            {!showMoreAttribute && (
              <TouchableOpacity
                style={{ marginTop: 5 }}
                activeOpacity={0.6}
                onPress={() => setShowMoreAttribute(true)}
              >
                <Text style={styles.showMoreText}>Xem thêm</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Recipe, ingredients, nutrition */}
          {showMoreAttribute && (
            <View style={styles.containerAttribute}>
              <Text style={styles.titleAttribute}>Công thức</Text>
              <Text style={styles.textAttribute}>
                {dish.recipe || "Không có công thức"}
              </Text>

              <Text style={styles.titleAttribute}>Nguyên liệu</Text>
              {ingredients.length > 0 ? (
                ingredients.map((ing) => (
                  <Text key={ing.dishIngredientId} style={styles.textAttribute}>
                    {ing.name || "Tên không xác định"}: {ing.weight}g
                  </Text>
                ))
              ) : (
                <Text style={styles.textAttribute}>Không có nguyên liệu</Text>
              )}

              <Text style={styles.titleAttribute}>Thành phần dinh dưỡng</Text>
              {Object.keys(nutrition).length > 0 ? (
                <>
                  <Text style={styles.textAttribute}>
                    Trọng lượng món ăn: {nutrition?.totalWeights || "Không rõ"}{" "}
                    g
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("calories")}: {nutrition?.totalCalories || 0}{" "}
                    kcal
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("fat")}: {nutrition?.totalFat || 0} g
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("carbs")}: {nutrition?.totalCarbs || 0} g
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("protein")}: {nutrition?.totalProtein || 0} g
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("fiber")}: {nutrition?.totalFiber || 0} g
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("calcium")}: {nutrition?.totalCalcium || 0} mg
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("iron")}: {nutrition?.totalIron || 0} mg
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("magnesium")}:{" "}
                    {nutrition?.totalMagnesium || 0} mg
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("omega3")}: {nutrition?.totalOmega3 || 0} mg
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("sugars")}: {nutrition?.totalSugars || 0} g
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("sodium")}: {nutrition?.totalSodium || 0} mg
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("vitaminA")}: {nutrition?.totalVitaminA || 0}{" "}
                    mcg
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("vitaminB")}: {nutrition?.totalVitaminB || 0}{" "}
                    mg
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("vitaminC")}: {nutrition?.totalVitaminC || 0}{" "}
                    mg
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("vitaminD")}: {nutrition?.totalVitaminD || 0}{" "}
                    mg
                  </Text>
                  <Text style={styles.textAttribute}>
                    {translateKey("vitaminE")}: {nutrition?.totalVitaminE || 0}{" "}
                    mg
                  </Text>
                </>
              ) : (
                <Text style={styles.textAttribute}>
                  Không có thông tin dinh dưỡng
                </Text>
              )}

              <TouchableOpacity
                style={{ marginTop: 10 }}
                activeOpacity={0.6}
                onPress={() => setShowMoreAttribute(false)}
              >
                <Text style={styles.showMoreText}>Thu gọn</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Feedback */}
          <View style={styles.containerAttribute}>
            <Text style={styles.titleAttribute}>Đánh giá & Nhận xét</Text>
            {feedbacks.length > 0 ? (
              feedbacks.map((fb) => (
                <View key={fb.feedbackId} style={styles.feedbackItem}>
                  <Text style={styles.feedbackUsername}>{fb.username}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {renderStars(fb.rating)}
                    <Text style={styles.feedbackRating}>{fb.rating}</Text>
                  </View>
                  <Text style={styles.feedbackContent}>
                    {fb.feedbackContent}
                  </Text>
                  <Text style={{ color: COLORS.grey, fontSize: 12 }}>
                    {new Date(fb.feedbackDate).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.feedbackContent}>Chưa có đánh giá.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(dishId)}
          >
            <Icon1 name="cart-plus" size={30} color={COLORS.green} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={async () => {
              await handleAddToCart(dishId);
              navigation.navigate("Cart");
            }}
          >
            <Text style={styles.orderButtonText}>Đặt hàng</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal: Danh sách gợi ý */}
      <Modal
        visible={showRecommendationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecommendationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gợi ý món ăn</Text>

            {loadingRecommendModal ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                }}
              >
                <ActivityIndicator size="large" color={COLORS.green} />
                <Text style={{ marginTop: 10 }}>
                  Đang tìm các món ăn phù hợp...
                </Text>
              </View>
            ) : recommendationLoading ? (
              <ActivityIndicator size="large" color={COLORS.green} />
            ) : recommendedDishes.length > 0 ? (
              <View style={styles.recommendationListContainer}>
                <FlatList
                  data={recommendedDishes}
                  renderItem={renderRecommendedDishItem}
                  keyExtractor={(item, idx) => String(item.dishId) + idx}
                  showsVerticalScrollIndicator={true}
                />
              </View>
            ) : (
              <Text style={styles.noRecommendationText}>
                Không có món ăn gợi ý
              </Text>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRecommendationModal(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
              {recommendedDishes.length > 0 && (
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: COLORS.blue }]}
                  // DÙNG CÁCH CŨ: handleCompareNutrition
                  // onPress={handleCompareNutrition}
                  // HOẶC DÙNG CÁCH MỚI (để test 1 món): handleCalculateCompatibility
                  onPress={handleCalculateCompatibility}
                  disabled={matchingLoading}
                >
                  <Text style={styles.closeButtonText}>
                    {matchingLoading ? "Đang so sánh..." : "So sánh "}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Xem thông tin dinh dưỡng + 2 nút cho món gợi ý được bấm */}
      <Modal
        visible={showRecommendedDishModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseRecommendedDishModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedRecommendedDishLoading ? (
              <ActivityIndicator size="large" color={COLORS.green} />
            ) : selectedRecommendedDish ? (
              <>
                <Image
                  source={{ uri: selectedRecommendedDish.dish?.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <Text style={styles.modalTitle}>
                  {selectedRecommendedDish.dishName}
                </Text>

                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.modalText}>
                    {translateKey("calories")}:{" "}
                    {selectedRecommendedDishNutrition?.totalCalories || 0} kcal
                  </Text>
                  <Text style={styles.modalText}>
                    {translateKey("fat")}:{" "}
                    {selectedRecommendedDishNutrition?.totalFat || 0} g
                  </Text>
                  <Text style={styles.modalText}>
                    {translateKey("carbs")}:{" "}
                    {selectedRecommendedDishNutrition?.totalCarbs || 0} g
                  </Text>
                  <Text style={styles.modalText}>
                    {translateKey("protein")}:{" "}
                    {selectedRecommendedDishNutrition?.totalProtein || 0} g
                  </Text>
                  <Text style={styles.modalText}>
                    Khối lượng:{" "}
                    {selectedRecommendedDishNutrition?.totalWeights ||
                      "Không rõ"}{" "}
                    g
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      handleAddToCart(selectedRecommendedDish.dishId);
                      handleCloseRecommendedDishModal();
                    }}
                  >
                    <Text style={styles.modalButtonText}>Thêm vào giỏ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      navigation.navigate("DishDetail", {
                        dishId: selectedRecommendedDish.dishId,
                        navigatedFromRecommed: false,
                      });
                      handleCloseRecommendedDishModal();
                    }}
                  >
                    <Text style={styles.modalButtonText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text>Không có dữ liệu</Text>
            )}

            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 15 }]}
              onPress={handleCloseRecommendedDishModal}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Kết quả so sánh dinh dưỡng (CÁCH CŨ) */}
      <Modal
        visible={showMatchingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMatchingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Kết quả so sánh dinh dưỡng (Cũ)
            </Text>

            {matchingLoading ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                }}
              >
                <ActivityIndicator size="large" color={COLORS.green} />
                <Text style={{ marginTop: 10 }}>
                  Đang so sánh dinh dưỡng...
                </Text>
              </View>
            ) : (
              <>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    marginVertical: 10,
                  }}
                >
                  Tổng bữa ăn gợi ý đáp ứng khoảng {totalMealMatchPercentage}%
                  so với 1/3 nhu cầu của bạn.
                </Text>

                <View style={styles.chartContainerSmall}>
                  <PieChart
                    data={[
                      {
                        name: "Phù hợp",
                        population: totalMealMatchPercentage,
                        color: COLORS.green,
                        legendFontColor: COLORS.black,
                        legendFontSize: 12,
                      },
                      {
                        name: "Không phù hợp",
                        population: 100 - totalMealMatchPercentage,
                        color: COLORS.greyPastel,
                        legendFontColor: COLORS.black,
                        legendFontSize: 12,
                      },
                    ]}
                    width={250}
                    height={160}
                    chartConfig={{
                      backgroundColor: COLORS.white,
                      backgroundGradientFrom: COLORS.white,
                      backgroundGradientTo: COLORS.white,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"10"}
                  />
                </View>

                {/* Chi tiết */}
                <Text style={styles.modalSubTitle}>Chi tiết dinh dưỡng</Text>
                {nutrientMatchDetails.map((item, index) => {
                  const { label, dishValue, userValue, unit, matchPercent } =
                    item;
                  return (
                    <View key={index} style={styles.nutrientDetailItem}>
                      <Text style={styles.nutrientLabel}>
                        {label}: {dishValue.toFixed(1)} / {userValue.toFixed(1)}{" "}
                        {unit}
                      </Text>
                      <Text style={styles.nutrientPercent}>
                        Đạt {matchPercent}% so với mục tiêu
                      </Text>
                    </View>
                  );
                })}
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMatchingModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Kết quả so sánh */}
      <Modal
        visible={showNewMatchingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewMatchingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Kết quả so sánh</Text>
              {/* <Text
                style={{ textAlign: "center", fontSize: 14, marginBottom: 10 }}
              >
                Lấy từ API CalculateTotalNutritionAndCompatibility +
                CalculateTotalNutritionForMeal
              </Text> */}

              {/* PieChart with OverallCompatibility */}
              <Text style={{ textAlign: "center", marginBottom: 10 }}>
                Tổng % phù hợp: {totalMealMatchPercentage.toFixed(1)}%
              </Text>
              <View style={styles.chartContainerSmall}>
                <PieChart
                  data={[
                    {
                      name: "Phù hợp",
                      population: totalMealMatchPercentage,
                      color: COLORS.green,
                      legendFontColor: COLORS.black,
                      legendFontSize: 12,
                    },
                    {
                      name: "Không phù hợp",
                      population: 100 - totalMealMatchPercentage,
                      color: COLORS.greyPastel,
                      legendFontColor: COLORS.black,
                      legendFontSize: 12,
                    },
                  ]}
                  width={250}
                  height={160}
                  chartConfig={{
                    backgroundColor: COLORS.white,
                    backgroundGradientFrom: COLORS.white,
                    backgroundGradientTo: COLORS.white,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"10"}
                />
              </View>

              {/* List of nutrients > 60% */}
              <Text style={styles.modalSubTitle}>
                Các chất dinh dưỡng trong toàn bộ món gợi ý:
              </Text>
              {filteredNutrients.length > 0 ? (
                filteredNutrients.map((item, idx) => (
                  <View key={idx} style={styles.nutrientDetailItem}>
                    <Text style={styles.nutrientLabel}>
                      {item.nutrientName}: {item.mealValue}
                      {/* Display unit depending on nutrientName (you define) */}
                    </Text>
                    <Text style={styles.nutrientPercent}>
                      Đạt {item.compatibilityValue.toFixed(2)}% so với mục tiêu
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: "center", marginTop: 10 }}>
                  Không có chất nào lớn hơnhơn 60%
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNewMatchingModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DishDetailScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerButtonFloatBottom: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
  },
  boxButtonFloatBottom: {
    backgroundColor: COLORS.white,
    height: 80,
    flexDirection: "row",
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGrey,
  },
  addToCartButton: {
    width: "30%",
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  orderButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  orderButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.white,
  },
  top: {
    flexDirection: "row",
    marginTop: StatusBar.currentHeight,
  },
  backButton: {
    height: 50,
    width: 50,
    marginLeft: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    elevation: 0,
  },
  headerText: {
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginLeft: 10,
    fontSize: 20,
  },
  img: {
    width: "100%",
    height: 300,
  },
  slide: {
    flex: 1,
    alignItems: "center",
  },
  priceTag: {
    position: "absolute",
    right: 10,
    bottom: 50,
    backgroundColor: COLORS.green,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  priceText: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 17,
  },
  dishName: {
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    fontSize: 22,
    marginBottom: 5,
  },
  dishInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dishType: {
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    fontSize: 15,
    marginBottom: 5,
  },
  ratingText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    marginLeft: 5,
  },
  containerAttribute: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 10,
  },
  titleAttribute: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.black,
    marginBottom: 3,
  },
  textAttribute: {
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    fontSize: 15,
    lineHeight: 23,
  },
  showMoreText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.blue,
  },
  feedbackItem: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  feedbackUsername: {
    fontFamily: FONTS.bold,
    color: COLORS.black,
    fontSize: 15,
  },
  feedbackContent: {
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    fontSize: 14,
    marginVertical: 5,
  },
  feedbackRating: {
    fontFamily: FONTS.semiBold,
    color: COLORS.star,
    fontSize: 14,
    marginLeft: 5,
  },
  heartIconContainer: {
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    elevation: 0,
    marginRight: 20,
  },
  recommendButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 5,
    elevation: 2,
  },
  // Modal chung
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    width: "90%", // Example maxWidth
    maxHeight: "80%",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 15,
  },
  modalSubTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.black,
    marginVertical: 10,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: COLORS.green,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    fontSize: 16,
  },
  // Danh sách recommended
  recommendationListContainer: {
    width: "100%",
    height: 360,
    marginBottom: 10,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
  },
  recommendationImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  recommendationTextContainer: {
    flex: 1,
  },
  recommendationDishName: {
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    fontSize: 16,
  },
  recommendationDishType: {
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    fontSize: 14,
  },
  noRecommendationText: {
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    fontSize: 15,
    textAlign: "center",
  },
  // Modal hiển thị món gợi ý
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
  modalText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.black,
    marginVertical: 2,
  },
  modalButton: {
    backgroundColor: COLORS.green,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    marginTop: 10,
  },
  modalButtonText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    fontSize: 16,
  },
  chartContainerSmall: {
    alignItems: "center",
    marginVertical: 10,
  },
  // Nutrient detail
  nutrientDetailItem: {
    flexDirection: "column",
    marginVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 5,
  },
  nutrientLabel: {
    fontFamily: FONTS.medium,
    color: COLORS.black,
    fontSize: 14,
  },
  nutrientPercent: {
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    fontSize: 13,
    marginLeft: 5,
  },
});

// import React, { useEffect, useState, useRef } from "react";
// import {
//   StyleSheet,
//   View,
//   Image,
//   Text,
//   StatusBar,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Modal,
//   FlatList,
//   Animated,
//   Easing,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Icon from "react-native-vector-icons/Ionicons";
// import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
// import Swiper from "react-native-swiper";
// import Toast from "react-native-toast-message";
// import { PieChart } from "react-native-chart-kit";

// import COLORS from "../constants/color";
// import FONTS from "../constants/font";

// const DishDetailScreen = ({ navigation, route }) => {
//   const { dishId, navigatedFromRecommed } = route.params;

//   // -------------------- State chung --------------------
//   const [dish, setDish] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showMoreAttribute, setShowMoreAttribute] = useState(false);
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [averageRating, setAverageRating] = useState(0);
//   const [userId, setUserId] = useState(null);
//   const [isFavorited, setIsFavorited] = useState(false);
//   const [ingredients, setIngredients] = useState([]);
//   const [nutrition, setNutrition] = useState({});

//   // -------------------- Modal gợi ý món ăn --------------------
//   const [showRecommendationModal, setShowRecommendationModal] = useState(false);
//   const [recommendedDishes, setRecommendedDishes] = useState([]);
//   const [recommendationLoading, setRecommendationLoading] = useState(false);
//   const [loadingRecommendModal, setLoadingRecommendModal] = useState(false);

//   // -------------------- Modal hiển thị món gợi ý được bấm --------------------
//   const [showRecommendedDishModal, setShowRecommendedDishModal] =
//     useState(false);
//   const [selectedRecommendedDish, setSelectedRecommendedDish] = useState(null);
//   const [
//     selectedRecommendedDishNutrition,
//     setSelectedRecommendedDishNutrition,
//   ] = useState({});
//   const [selectedRecommendedDishLoading, setSelectedRecommendedDishLoading] =
//     useState(false);

//   // -------------------- So sánh dinh dưỡng (tổng) - CÁCH CŨ --------------------
//   // (Vẫn giữ lại làm ví dụ, nếu không cần có thể xoá)
//   const [matchingLoading, setMatchingLoading] = useState(false);
//   const [showMatchingModal, setShowMatchingModal] = useState(false);
//   const [totalMealMatchPercentage, setTotalMealMatchPercentage] = useState(0);
//   const [nutrientMatchDetails, setNutrientMatchDetails] = useState([]); // (Cách cũ)

//   // -------------------- So sánh dinh dưỡng (MỚI) --------------------
//   const [showNewMatchingModal, setShowNewMatchingModal] = useState(false); // Modal mới
//   // Lưu dữ liệu trả về từ API /CalculateTotalNutritionAndCompatibility
//   const [compatibilityData, setCompatibilityData] = useState(null);
//   // Lưu dữ liệu trả về từ API /CalculateTotalNutritionForMeal
//   const [mealNutritionData, setMealNutritionData] = useState(null);
//   // Danh sách các chất cần hiển thị, chỉ gồm những chất > 60% và tồn tại ở mealNutritionData
//   const [filteredNutrients, setFilteredNutrients] = useState([]);

//   // Animated values cho danh sách gợi ý
//   const animatedValues = useRef(new Map()).current;

//   // -------------------- fetchWithAuth (token) --------------------
//   const fetchWithAuth = async (url, options = {}) => {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) {
//       console.error("Không tìm thấy token.");
//       throw new Error("Unauthorized: Missing token");
//     }
//     const headers = {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//       ...options.headers,
//     };
//     try {
//       const response = await fetch(url, { ...options, headers });
//       if (response.status === 401) {
//         console.error("Token hết hạn hoặc không hợp lệ.");
//       }
//       return response;
//     } catch (error) {
//       console.error("Error fetching with auth:", error);
//       throw error;
//     }
//   };

//   // -------------------- Lấy userId --------------------
//   useEffect(() => {
//     const getUserIdFromStorage = async () => {
//       try {
//         const storedUserId = await AsyncStorage.getItem("userId");
//         if (storedUserId) {
//           setUserId(storedUserId);
//           checkIfFavorite(storedUserId);
//         }
//       } catch (error) {
//         console.error("Lỗi khi lấy userId:", error);
//       }
//     };
//     getUserIdFromStorage();
//   }, []);

//   // -------------------- API lấy dish, ingredients, feedback, nutrition --------------------
//   useEffect(() => {
//     const fetchDishDetail = async () => {
//       try {
//         const res = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${dishId}`
//         );
//         if (res.ok) {
//           const data = await res.json();
//           setDish(data);
//         }
//       } catch (error) {
//         console.error("Error fetching dish details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchIngredients = async () => {
//       try {
//         const res = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${dishId}`
//         );
//         if (res.ok) {
//           const data = await res.json();
//           const ingredientsWithNames = await Promise.all(
//             data.map(async (item) => {
//               const res2 = await fetchWithAuth(
//                 `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${item.ingredientId}`
//               );
//               if (res2.ok) {
//                 const detail = await res2.json();
//                 return { ...item, name: detail.name };
//               }
//               return item;
//             })
//           );
//           setIngredients(ingredientsWithNames);
//         }
//       } catch (error) {
//         console.error("Error fetching ingredients:", error);
//       }
//     };

//     const fetchNutrition = async () => {
//       try {
//         const res = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/calculateNutrition/${dishId}`
//         );
//         if (res.ok) {
//           const data = await res.json();
//           setNutrition(data);
//         }
//       } catch (error) {
//         console.error("Error fetching nutrition:", error);
//       }
//     };

//     const fetchFeedbacks = async () => {
//       try {
//         const res = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/getFeedbackByDishID/${dishId}`
//         );
//         if (res.ok) {
//           const data = await res.json();
//           setFeedbacks(data);

//           if (data.length > 0) {
//             const totalRating = data.reduce((acc, fb) => acc + fb.rating, 0);
//             setAverageRating((totalRating / data.length).toFixed(1));
//           } else {
//             setAverageRating("0.0");
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching feedbacks:", error);
//       }
//     };

//     fetchDishDetail();
//     fetchIngredients();
//     fetchNutrition();
//     fetchFeedbacks();
//   }, [dishId]);

//   // -------------------- checkIfFavorite --------------------
//   const checkIfFavorite = async (uid) => {
//     if (!uid) return;
//     try {
//       const res = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/allDishFavoriteByUserId/${uid}`
//       );
//       if (res.ok) {
//         const text = await res.text();
//         if (text) {
//           const favorites = JSON.parse(text);
//           const isFavorite = favorites.some(
//             (f) => f.dishId === parseInt(dishId)
//           );
//           setIsFavorited(isFavorite);
//         }
//       }
//     } catch (error) {
//       console.error("Error checking favorite status:", error);
//     }
//   };

//   // -------------------- Thêm vào giỏ hàng --------------------
//   const handleAddToCart = async (targetDishId) => {
//     const idToAdd = targetDishId || dishId;

//     if (!userId) {
//       console.log("User ID missing.");
//       return;
//     }
//     try {
//       const res = await fetchWithAuth(
//         "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/addToCart",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId: userId,
//             dishId: idToAdd,
//             quantity: 1,
//           }),
//         }
//       );
//       if (res.ok) {
//         console.log("Đã thêm vào giỏ hàng.");
//         showToastAddToCart();
//       } else {
//         console.error("Failed to add to cart:", res.status);
//       }
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//     }
//   };

//   // -------------------- Favorite Toggle --------------------
//   const handleFavoriteToggle = async () => {
//     if (!userId) return;
//     if (isFavorited) {
//       // Xoá
//       try {
//         await fetchWithAuth(
//           "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/deleteFavoriteDish",
//           {
//             method: "DELETE",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               favoriteId: 0,
//               userId: parseInt(userId),
//               dishId: dishId,
//               favoriteDate: new Date().toISOString(),
//             }),
//           }
//         );
//         setIsFavorited(false);
//         showToastFavorite(false); // Hiển thị toast khi bỏ thích
//       } catch (error) {
//         console.error("Error removing favorite dish:", error);
//       }
//     } else {
//       // Thêm
//       try {
//         await fetchWithAuth(
//           "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/favorites/createFavoriteDish",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               favoriteId: 0,
//               userId: parseInt(userId),
//               dishId: dishId,
//               favoriteDate: new Date().toISOString(),
//             }),
//           }
//         );
//         setIsFavorited(true);
//         showToastFavorite(true); // Hiển thị toast khi thêm yêu thích
//       } catch (error) {
//         console.error("Error adding favorite dish:", error);
//       }
//     }
//   };
//   // -------------------- Toast --------------------
//   const showToastAddToCart = () => {
//     Toast.show({
//       type: "success",
//       text1: "Thông báo",
//       text2: "Thêm vào giỏ hàng thành công! 👋",
//     });
//   };
//   const showToastFavorite = (isFavorited) => {
//     Toast.show({
//       type: "success",
//       text1: "Thông báo",
//       text2: isFavorited
//         ? "Đã thêm vào yêu thích! ❤️"
//         : "Đã bỏ khỏi yêu thích!",
//     });
//   };

//   // -------------------- Render Stars --------------------
//   const renderStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const halfStar = rating % 1 >= 0.5;
//     const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

//     for (let i = 0; i < fullStars; i++) {
//       stars.push(
//         <Icon key={`full-${i}`} name="star" size={16} color={COLORS.star} />
//       );
//     }
//     if (halfStar) {
//       stars.push(
//         <Icon key="half" name="star-half" size={16} color={COLORS.star} />
//       );
//     }
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(
//         <Icon
//           key={`empty-${i}`}
//           name="star-outline"
//           size={16}
//           color={COLORS.star}
//         />
//       );
//     }
//     return stars;
//   };

//   // -------------------- CÁCH CŨ: Hàm fetch thông tin dinh dưỡng user (trong 1 ngày) --------------------
//   // (Nếu không còn dùng, bạn có thể xóa hoặc tắt)
//   const fetchUserNutrition = async () => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         throw new Error("Không tìm thấy User ID.");
//       }

//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionCriterions/getUserNutritionCriteriaDetailByUserId/${userId}`
//       );

//       if (!response.ok) {
//         throw new Error(
//           `Lỗi khi lấy dữ liệu dinh dưỡng người dùng: ${response.statusText}`
//         );
//       }
//       const data = await response.json();
//       return data[0];
//     } catch (error) {
//       console.error(
//         "Lỗi khi lấy thông tin dinh dưỡng người dùng:",
//         error.message
//       );
//       Alert.alert(
//         "Lỗi",
//         error.message || "Không thể tải dữ liệu dinh dưỡng người dùng."
//       );
//       return null;
//     }
//   };

//   // -------------------- Gọi API recommendMeal --------------------
//   const fetchRecommendedDishes = async () => {
//     if (!userId) return;
//     let loadingTimeout;
//     loadingTimeout = setTimeout(() => {
//       setLoadingRecommendModal(true);
//     }, 300);

//     setRecommendationLoading(true);
//     try {
//       const res = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMeal/${userId}/${dishId}`
//       );
//       if (res.ok) {
//         const data = await res.json();
//         console.log("Số món gợi ý:", data.length);
//         setRecommendedDishes(data);

//         // Animate
//         data.forEach((_, idx) => {
//           if (!animatedValues.has(idx)) {
//             animatedValues.set(idx, new Animated.Value(0));
//           }
//         });
//         data.forEach((_, idx) => {
//           Animated.timing(animatedValues.get(idx), {
//             toValue: 1,
//             duration: 300,
//             delay: 200 * idx,
//             useNativeDriver: true,
//             easing: Easing.out(Easing.ease),
//           }).start();
//         });
//       } else {
//         console.error("Error recommendMeal:", res.status);
//       }
//     } catch (error) {
//       console.error("Error fetchRecommendedDishes:", error);
//     } finally {
//       clearTimeout(loadingTimeout);
//       setRecommendationLoading(false);
//       setLoadingRecommendModal(false);
//     }
//   };

//   // -------------------- CÁCH CŨ: So sánh dinh dưỡng (nhiều món) --------------------
//   // Giữ lại làm ví dụ, nếu bạn không cần, có thể xoá bớt.
//   const handleCompareNutrition = async () => {
//     setMatchingLoading(true);
//     try {
//       // Lấy dinh dưỡng người dùng (1 ngày)
//       const userNutrition = await fetchUserNutrition();
//       if (!userNutrition) return;

//       // Cộng dồn dinh dưỡng recommendedDishes
//       let sumNutrition = {
//         totalCalories: 0,
//         totalFat: 0,
//         totalCarbs: 0,
//         totalProtein: 0,
//       };

//       for (let item of recommendedDishes) {
//         try {
//           const res = await fetchWithAuth(
//             `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/calculateNutrition/${item.dishId}`
//           );
//           if (res.ok) {
//             const dishNutrition = await res.json();
//             sumNutrition.totalCalories += dishNutrition.totalCalories || 0;
//             sumNutrition.totalFat += dishNutrition.totalFat || 0;
//             sumNutrition.totalCarbs += dishNutrition.totalCarbs || 0;
//             sumNutrition.totalProtein += dishNutrition.totalProtein || 0;
//           } else {
//             console.error("Error fetch dish nutrition:", res.status);
//           }
//         } catch (error) {
//           console.error("Error calculating dish nutrition:", error);
//         }
//       }

//       // Chia 3
//       const userPortionNutrition = {
//         calories: userNutrition.calories / 3,
//         fat: userNutrition.fat / 3,
//         carbs: userNutrition.carbs / 3,
//         protein: userNutrition.protein / 3,
//       };

//       // Tính
//       const percentage = calculateTotalMealMatchPercentage(
//         sumNutrition,
//         userPortionNutrition
//       );
//       const details = getNutrientMatchDetails(
//         sumNutrition,
//         userPortionNutrition
//       );

//       // Lưu
//       setTotalMealMatchPercentage(percentage);
//       setNutrientMatchDetails(details);
//       setShowMatchingModal(true);
//     } catch (error) {
//       console.error("Error comparing nutrition:", error);
//       Alert.alert("Lỗi", "Không thể so sánh dinh dưỡng lúc này.");
//     } finally {
//       setMatchingLoading(false);
//     }
//   };

//   // Hai hàm phụ cũ
//   const getNutrientMatchDetails = (sumNutrition, userPortion) => {
//     const nutrientKeys = [
//       {
//         label: "Calories",
//         dishKey: "totalCalories",
//         userKey: "calories",
//         unit: "kcal",
//       },
//       { label: "Fat", dishKey: "totalFat", userKey: "fat", unit: "g" },
//       { label: "Carbs", dishKey: "totalCarbs", userKey: "carbs", unit: "g" },
//       {
//         label: "Protein",
//         dishKey: "totalProtein",
//         userKey: "protein",
//         unit: "g",
//       },
//     ];

//     return nutrientKeys.map((nk) => {
//       const dishValue = sumNutrition[nk.dishKey] || 0;
//       const userValue = userPortion[nk.userKey] || 0;
//       let ratio = 0;
//       if (userValue > 0) ratio = dishValue / userValue;
//       const matchPercent = Math.min(1, ratio) * 100;
//       return {
//         label: nk.label,
//         dishValue,
//         userValue,
//         unit: nk.unit,
//         ratio,
//         matchPercent: parseFloat(matchPercent.toFixed(0)),
//       };
//     });
//   };

//   const calculateTotalMealMatchPercentage = (sumNutrition, userPortion) => {
//     if (!sumNutrition || !userPortion) return 0;

//     const userKeys = ["calories", "fat", "carbs", "protein"];
//     let totalMatch = 0;
//     let totalCriteria = userKeys.length;

//     userKeys.forEach((key) => {
//       let dishValue, userValue;
//       switch (key) {
//         case "calories":
//           dishValue = sumNutrition.totalCalories;
//           userValue = userPortion.calories;
//           break;
//         case "fat":
//           dishValue = sumNutrition.totalFat;
//           userValue = userPortion.fat;
//           break;
//         case "carbs":
//           dishValue = sumNutrition.totalCarbs;
//           userValue = userPortion.carbs;
//           break;
//         case "protein":
//           dishValue = sumNutrition.totalProtein;
//           userValue = userPortion.protein;
//           break;
//         default:
//           return;
//       }
//       if (userValue !== 0) {
//         const ratio = dishValue / userValue;
//         totalMatch += Math.min(1, ratio);
//       } else {
//         totalCriteria--;
//       }
//     });

//     if (totalCriteria <= 0) return 0;
//     return Number(((totalMatch / totalCriteria) * 100).toFixed(0));
//   };

//   // -------------------- MỚI: Tính toán % compatibility + show nutrients từ 2 API --------------------
//   const handleCalculateCompatibility = async () => {
//     try {
//       if (!userId) {
//         Alert.alert("Lỗi", "Chưa có userId");
//         return;
//       }

//       // 1) Gọi API CalculateTotalNutritionAndCompatibility
//       const res1 = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/CalculateTotalNutritionAndCompatibility/${dishId}/${userId}`
//       );
//       if (!res1.ok) {
//         throw new Error(
//           "Lỗi khi gọi API CalculateTotalNutritionAndCompatibility"
//         );
//       }
//       const compatibilityJson = await res1.json();
//       setCompatibilityData(compatibilityJson);

//       // 2) Tách OverallCompatibility => để hiển thị PieChart
//       const overall = compatibilityJson?.OverallCompatibility || 0;

//       // 3) Lấy danh sách các chất trong "Compatibility" có giá trị > 60%
//       const compObj = compatibilityJson?.Compatibility || {};
//       // compObj dạng: { Calories: 91.57, Protein: 63.01, ... }
//       // Lọc
//       const compEntries = Object.entries(compObj).filter(
//         ([_, value]) => value > 60
//       );
//       // compEntries sẽ là mảng cặp [ 'Calories', 91.57 ], [ 'Iron', 95.4 ], ...

//       // 4) Gọi API CalculateTotalNutritionForMeal lấy giá trị thực
//       const res2 = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/CalculateTotalNutritionForMeal/${dishId}/${userId}`
//       );
//       if (!res2.ok) {
//         throw new Error("Lỗi khi gọi API CalculateTotalNutritionForMeal");
//       }
//       const mealJson = await res2.json();
//       setMealNutritionData(mealJson);

//       // 5) Chỉ hiển thị những chất có trong compEntries, đồng thời mapping sang giá trị mealJson
//       const merged = compEntries.map(([nutrientKey, compatValue]) => {
//         // VD nutrientKey = "Calories"
//         // Tìm trong mealJson => mealJson["Calories"]
//         const mealValue = mealJson[nutrientKey] ?? 0; // có thể 0 nếu key không tồn tại
//         return {
//           nutrientName: nutrientKey,
//           compatibilityValue: compatValue, // 91.57
//           mealValue: mealValue, // 801.31
//         };
//       });

//       setFilteredNutrients(merged);

//       // 6) Cập nhật modal để hiển thị
//       setTotalMealMatchPercentage(overall); // Dùng chung state cũ để vẽ chart
//       setShowNewMatchingModal(true);
//     } catch (error) {
//       console.error("Lỗi handleCalculateCompatibility:", error);
//       Alert.alert("Lỗi", error.message);
//     }
//   };

//   // -------------------- Khi user bấm 1 món gợi ý => hiển thị thông tin dinh dưỡng + 2 nút --------------------
//   const handleOpenRecommendedDish = async (item) => {
//     setSelectedRecommendedDish(item);
//     setSelectedRecommendedDishLoading(true);
//     setShowRecommendedDishModal(true);

//     try {
//       const res = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/calculateNutrition/${item.dishId}`
//       );
//       if (res.ok) {
//         const data = await res.json();
//         setSelectedRecommendedDishNutrition(data);
//       } else {
//         console.error("Error fetchRecommendedDishNutrition");
//       }
//     } catch (error) {
//       console.error("Error fetchRecommendedDishNutrition", error);
//     } finally {
//       setSelectedRecommendedDishLoading(false);
//     }
//   };

//   const handleCloseRecommendedDishModal = () => {
//     setShowRecommendedDishModal(false);
//     setSelectedRecommendedDish(null);
//     setSelectedRecommendedDishNutrition({});
//     setSelectedRecommendedDishLoading(false);
//   };

//   // -------------------- Render từng item gợi ý --------------------
//   const renderRecommendedDishItem = ({ item, index }) => {
//     const animatedStyle = {
//       opacity: animatedValues.get(index),
//       transform: [
//         {
//           translateY: animatedValues.get(index).interpolate({
//             inputRange: [0, 1],
//             outputRange: [20, 0],
//           }),
//         },
//       ],
//     };

//     return (
//       <TouchableOpacity
//         activeOpacity={0.8}
//         onPress={() => handleOpenRecommendedDish(item)}
//       >
//         <Animated.View style={[styles.recommendationItem, animatedStyle]}>
//           <Image
//             source={{ uri: item.dish.imageUrl }}
//             style={styles.recommendationImage}
//           />
//           <View style={styles.recommendationTextContainer}>
//             <Text style={styles.recommendationDishName}>{item.dishName}</Text>
//             <Text style={styles.recommendationDishType}>
//               {item.dish.dishType}
//             </Text>
//           </View>
//         </Animated.View>
//       </TouchableOpacity>
//     );
//   };

//   // -------------------- Loading / Not found --------------------
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.green} />
//         <Text>Đang tải thông tin món ăn...</Text>
//       </View>
//     );
//   }
//   if (!dish) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Không tìm thấy thông tin món ăn.</Text>
//       </View>
//     );
//   }

//   // -------------------- Giao diện chính --------------------
//   return (
//     <>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         style={{
//           flex: 1,
//           backgroundColor: COLORS.white,
//           marginTop: StatusBar.currentHeight,
//           marginBottom: 80,
//         }}
//       >
//         {/* Top Nav */}
//         <View style={styles.top}>
//           <TouchableOpacity
//             activeOpacity={0.8}
//             onPress={() => navigation.goBack()}
//             style={{ flexDirection: "row", alignItems: "center" }}
//           >
//             <View style={styles.backButton}>
//               <Icon name="arrow-back-outline" size={28} color={COLORS.green} />
//             </View>
//             <Text style={styles.headerText}>Chi tiết món ăn</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Image + Price + Recommendation Button */}
//         <View style={{ height: 250 }}>
//           <Swiper
//             showsButtons={false}
//             activeDotColor={COLORS.green}
//             dotColor={COLORS.white}
//             autoplay={false}
//           >
//             <View style={styles.slide}>
//               <Image
//                 source={{ uri: dish.imageUrl }}
//                 style={styles.img}
//                 resizeMode="cover"
//               />
//             </View>
//           </Swiper>
//           <View style={styles.priceTag}>
//             <Text style={styles.priceText}>
//               {dish.price ? dish.price.toLocaleString() + " đ" : "0 đ"}
//             </Text>
//           </View>

//           {navigatedFromRecommed && (
//             <TouchableOpacity
//               style={styles.recommendButton}
//               onPress={() => {
//                 fetchRecommendedDishes();
//                 setShowRecommendationModal(true);
//               }}
//             >
//               <Icon1 name="food-variant" size={30} color={COLORS.green} />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Dish Info */}
//         <View style={{ padding: 15 }}>
//           {/* Tên + Tim */}
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//             }}
//           >
//             <Text style={styles.dishName}>{dish.name}</Text>
//             <TouchableOpacity
//               onPress={handleFavoriteToggle}
//               activeOpacity={0.8}
//             >
//               <View style={styles.heartIconContainer}>
//                 <Icon
//                   name={isFavorited ? "heart" : "heart-outline"}
//                   size={30}
//                   color={isFavorited ? "red" : COLORS.green}
//                 />
//               </View>
//             </TouchableOpacity>
//           </View>

//           {/* Loại + Rating */}
//           <View style={styles.dishInfo}>
//             <Text style={styles.dishType}>{dish.dishType}</Text>
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               {renderStars(averageRating)}
//               <Text style={styles.ratingText}>{averageRating}</Text>
//             </View>
//           </View>

//           {/* Description */}
//           <View style={styles.containerAttribute}>
//             <Text style={styles.titleAttribute}>Mô tả</Text>
//             <Text style={styles.textAttribute}>
//               {dish.description || "Không có mô tả"}
//             </Text>
//             {!showMoreAttribute && (
//               <TouchableOpacity
//                 style={{ marginTop: 5 }}
//                 activeOpacity={0.6}
//                 onPress={() => setShowMoreAttribute(true)}
//               >
//                 <Text style={styles.showMoreText}>Xem thêm</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Recipe, ingredients, nutrition */}
//           {showMoreAttribute && (
//             <View style={styles.containerAttribute}>
//               <Text style={styles.titleAttribute}>Công thức</Text>
//               <Text style={styles.textAttribute}>
//                 {dish.recipe || "Không có công thức"}
//               </Text>

//               <Text style={styles.titleAttribute}>Nguyên liệu</Text>
//               {ingredients.length > 0 ? (
//                 ingredients.map((ing) => (
//                   <Text key={ing.dishIngredientId} style={styles.textAttribute}>
//                     {ing.name || "Tên không xác định"}: {ing.weight}g
//                   </Text>
//                 ))
//               ) : (
//                 <Text style={styles.textAttribute}>Không có nguyên liệu</Text>
//               )}

//               <Text style={styles.titleAttribute}>Thành phần dinh dưỡng</Text>
//               {Object.keys(nutrition).length > 0 ? (
//                 <>
//                   <Text style={styles.textAttribute}>
//                     Calories: {nutrition?.totalCalories || 0} kcal
//                   </Text>
//                   <Text style={styles.textAttribute}>
//                     Fat: {nutrition?.totalFat || 0} g
//                   </Text>
//                   <Text style={styles.textAttribute}>
//                     Carbs: {nutrition?.totalCarbs || 0} g
//                   </Text>
//                   <Text style={styles.textAttribute}>
//                     Protein: {nutrition?.totalProtein || 0} g
//                   </Text>
//                   <Text style={styles.textAttribute}>
//                     Khối lượng: {nutrition?.totalWeights || "Không rõ"} g
//                   </Text>
//                 </>
//               ) : (
//                 <Text style={styles.textAttribute}>
//                   Không có thông tin dinh dưỡng
//                 </Text>
//               )}

//               <TouchableOpacity
//                 style={{ marginTop: 10 }}
//                 activeOpacity={0.6}
//                 onPress={() => setShowMoreAttribute(false)}
//               >
//                 <Text style={styles.showMoreText}>Thu gọn</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* Feedback */}
//           <View style={styles.containerAttribute}>
//             <Text style={styles.titleAttribute}>Đánh giá & Nhận xét</Text>
//             {feedbacks.length > 0 ? (
//               feedbacks.map((fb) => (
//                 <View key={fb.feedbackId} style={styles.feedbackItem}>
//                   <Text style={styles.feedbackUsername}>{fb.username}</Text>
//                   <View style={{ flexDirection: "row", alignItems: "center" }}>
//                     {renderStars(fb.rating)}
//                     <Text style={styles.feedbackRating}>{fb.rating}</Text>
//                   </View>
//                   <Text style={styles.feedbackContent}>
//                     {fb.feedbackContent}
//                   </Text>
//                   <Text style={{ color: COLORS.grey, fontSize: 12 }}>
//                     {new Date(fb.feedbackDate).toLocaleDateString()}
//                   </Text>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.feedbackContent}>Chưa có đánh giá.</Text>
//             )}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom Button */}
//       <View style={styles.containerButtonFloatBottom}>
//         <View style={styles.boxButtonFloatBottom}>
//           <TouchableOpacity
//             style={styles.addToCartButton}
//             onPress={() => handleAddToCart(dishId)}
//           >
//             <Icon1 name="cart-plus" size={30} color={COLORS.green} />
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.orderButton}
//             onPress={async () => {
//               await handleAddToCart(dishId);
//               navigation.navigate("Cart");
//             }}
//           >
//             <Text style={styles.orderButtonText}>Đặt hàng</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Modal: Danh sách gợi ý */}
//       <Modal
//         visible={showRecommendationModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowRecommendationModal(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Gợi ý món ăn</Text>

//             {loadingRecommendModal ? (
//               <View
//                 style={{
//                   justifyContent: "center",
//                   alignItems: "center",
//                   height: 200,
//                 }}
//               >
//                 <ActivityIndicator size="large" color={COLORS.green} />
//                 <Text style={{ marginTop: 10 }}>
//                   Đang tìm các món ăn phù hợp...
//                 </Text>
//               </View>
//             ) : recommendationLoading ? (
//               <ActivityIndicator size="large" color={COLORS.green} />
//             ) : recommendedDishes.length > 0 ? (
//               <View style={styles.recommendationListContainer}>
//                 <FlatList
//                   data={recommendedDishes}
//                   renderItem={renderRecommendedDishItem}
//                   keyExtractor={(item, idx) => String(item.dishId) + idx}
//                   showsVerticalScrollIndicator={true}
//                 />
//               </View>
//             ) : (
//               <Text style={styles.noRecommendationText}>
//                 Không có món ăn gợi ý
//               </Text>
//             )}
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => setShowRecommendationModal(false)}
//               >
//                 <Text style={styles.closeButtonText}>Đóng</Text>
//               </TouchableOpacity>
//               {recommendedDishes.length > 0 && (
//                 <TouchableOpacity
//                   style={[styles.closeButton, { backgroundColor: COLORS.blue }]}
//                   // DÙNG CÁCH CŨ: handleCompareNutrition
//                   // onPress={handleCompareNutrition}
//                   // HOẶC DÙNG CÁCH MỚI (để test 1 món): handleCalculateCompatibility
//                   onPress={handleCalculateCompatibility}
//                   disabled={matchingLoading}
//                 >
//                   <Text style={styles.closeButtonText}>
//                     {matchingLoading ? "Đang so sánh..." : "So sánh "}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Modal: Xem thông tin dinh dưỡng + 2 nút cho món gợi ý được bấm */}
//       <Modal
//         visible={showRecommendedDishModal}
//         animationType="fade"
//         transparent={true}
//         onRequestClose={handleCloseRecommendedDishModal}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             {selectedRecommendedDishLoading ? (
//               <ActivityIndicator size="large" color={COLORS.green} />
//             ) : selectedRecommendedDish ? (
//               <>
//                 <Image
//                   source={{ uri: selectedRecommendedDish.dish?.imageUrl }}
//                   style={styles.modalImage}
//                   resizeMode="cover"
//                 />
//                 <Text style={styles.modalTitle}>
//                   {selectedRecommendedDish.dishName}
//                 </Text>

//                 <View style={{ marginVertical: 10 }}>
//                   <Text style={styles.modalText}>
//                     Calories:{" "}
//                     {selectedRecommendedDishNutrition?.totalCalories || 0} kcal
//                   </Text>
//                   <Text style={styles.modalText}>
//                     Fat: {selectedRecommendedDishNutrition?.totalFat || 0} g
//                   </Text>
//                   <Text style={styles.modalText}>
//                     Carbs: {selectedRecommendedDishNutrition?.totalCarbs || 0} g
//                   </Text>
//                   <Text style={styles.modalText}>
//                     Protein:{" "}
//                     {selectedRecommendedDishNutrition?.totalProtein || 0} g
//                   </Text>
//                   <Text style={styles.modalText}>
//                     Khối lượng:{" "}
//                     {selectedRecommendedDishNutrition?.totalWeights ||
//                       "Không rõ"}{" "}
//                     g
//                   </Text>
//                 </View>

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <TouchableOpacity
//                     style={styles.modalButton}
//                     onPress={() => {
//                       handleAddToCart(selectedRecommendedDish.dishId);
//                       handleCloseRecommendedDishModal();
//                     }}
//                   >
//                     <Text style={styles.modalButtonText}>Thêm vào giỏ</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={styles.modalButton}
//                     onPress={() => {
//                       navigation.navigate("DishDetail", {
//                         dishId: selectedRecommendedDish.dishId,
//                         navigatedFromRecommed: false,
//                       });
//                       handleCloseRecommendedDishModal();
//                     }}
//                   >
//                     <Text style={styles.modalButtonText}>Xem chi tiết</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             ) : (
//               <Text>Không có dữ liệu</Text>
//             )}

//             <TouchableOpacity
//               style={[styles.closeButton, { marginTop: 15 }]}
//               onPress={handleCloseRecommendedDishModal}
//             >
//               <Text style={styles.closeButtonText}>Đóng</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Modal: Kết quả so sánh (CÁCH CŨ) */}
//       <Modal
//         visible={showMatchingModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowMatchingModal(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>
//               Kết quả so sánh dinh dưỡng (Cũ)
//             </Text>

//             {matchingLoading ? (
//               <View
//                 style={{
//                   justifyContent: "center",
//                   alignItems: "center",
//                   height: 200,
//                 }}
//               >
//                 <ActivityIndicator size="large" color={COLORS.green} />
//                 <Text style={{ marginTop: 10 }}>
//                   Đang so sánh dinh dưỡng...
//                 </Text>
//               </View>
//             ) : (
//               <>
//                 <Text
//                   style={{
//                     textAlign: "center",
//                     fontSize: 16,
//                     marginVertical: 10,
//                   }}
//                 >
//                   Tổng bữa ăn gợi ý đáp ứng khoảng {totalMealMatchPercentage}%
//                   so với 1/3 nhu cầu của bạn.
//                 </Text>

//                 <View style={styles.chartContainerSmall}>
//                   <PieChart
//                     data={[
//                       {
//                         name: "Phù hợp",
//                         population: totalMealMatchPercentage,
//                         color: COLORS.green,
//                         legendFontColor: COLORS.black,
//                         legendFontSize: 12,
//                       },
//                       {
//                         name: "Không phù hợp",
//                         population: 100 - totalMealMatchPercentage,
//                         color: COLORS.greyPastel,
//                         legendFontColor: COLORS.black,
//                         legendFontSize: 12,
//                       },
//                     ]}
//                     width={250}
//                     height={160}
//                     chartConfig={{
//                       backgroundColor: COLORS.white,
//                       backgroundGradientFrom: COLORS.white,
//                       backgroundGradientTo: COLORS.white,
//                       decimalPlaces: 0,
//                       color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                       labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                     }}
//                     accessor={"population"}
//                     backgroundColor={"transparent"}
//                     paddingLeft={"10"}
//                   />
//                 </View>

//                 {/* Chi tiết */}
//                 <Text style={styles.modalSubTitle}>Chi tiết dinh dưỡng</Text>
//                 {nutrientMatchDetails.map((item, index) => {
//                   const { label, dishValue, userValue, unit, matchPercent } =
//                     item;
//                   return (
//                     <View key={index} style={styles.nutrientDetailItem}>
//                       <Text style={styles.nutrientLabel}>
//                         {label}: {dishValue.toFixed(1)} / {userValue.toFixed(1)}{" "}
//                         {unit}
//                       </Text>
//                       <Text style={styles.nutrientPercent}>
//                         Đạt {matchPercent}% so với mục tiêu
//                       </Text>
//                     </View>
//                   );
//                 })}
//               </>
//             )}

//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setShowMatchingModal(false)}
//             >
//               <Text style={styles.closeButtonText}>Đóng</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Modal: Kết quả so sánh */}
//       <Modal
//         visible={showNewMatchingModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowNewMatchingModal(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <Text style={styles.modalTitle}>Kết quả so sánh</Text>
//               {/* <Text
//                 style={{ textAlign: "center", fontSize: 14, marginBottom: 10 }}
//               >
//                 Lấy từ API CalculateTotalNutritionAndCompatibility +
//                 CalculateTotalNutritionForMeal
//               </Text> */}

//               {/* PieChart with OverallCompatibility */}
//               <Text style={{ textAlign: "center", marginBottom: 10 }}>
//                 Tổng % phù hợp: {totalMealMatchPercentage.toFixed(1)}%
//               </Text>
//               <View style={styles.chartContainerSmall}>
//                 <PieChart
//                   data={[
//                     {
//                       name: "Phù hợp",
//                       population: totalMealMatchPercentage,
//                       color: COLORS.green,
//                       legendFontColor: COLORS.black,
//                       legendFontSize: 12,
//                     },
//                     {
//                       name: "Không phù hợp",
//                       population: 100 - totalMealMatchPercentage,
//                       color: COLORS.greyPastel,
//                       legendFontColor: COLORS.black,
//                       legendFontSize: 12,
//                     },
//                   ]}
//                   width={250}
//                   height={160}
//                   chartConfig={{
//                     backgroundColor: COLORS.white,
//                     backgroundGradientFrom: COLORS.white,
//                     backgroundGradientTo: COLORS.white,
//                     decimalPlaces: 0,
//                     color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                     labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   }}
//                   accessor={"population"}
//                   backgroundColor={"transparent"}
//                   paddingLeft={"10"}
//                 />
//               </View>

//               {/* List of nutrients > 60% */}
//               <Text style={styles.modalSubTitle}>
//                 Các chất dinh dưỡng trong toàn bộ món gợi ý:
//               </Text>
//               {filteredNutrients.length > 0 ? (
//                 filteredNutrients.map((item, idx) => (
//                   <View key={idx} style={styles.nutrientDetailItem}>
//                     <Text style={styles.nutrientLabel}>
//                       {item.nutrientName}: {item.mealValue}
//                       {/* Display unit depending on nutrientName (you define) */}
//                     </Text>
//                     <Text style={styles.nutrientPercent}>
//                       Đạt {item.compatibilityValue.toFixed(2)}% so với mục tiêu
//                     </Text>
//                   </View>
//                 ))
//               ) : (
//                 <Text style={{ textAlign: "center", marginTop: 10 }}>
//                   Không có chất nào lớn hơnhơn 60%
//                 </Text>
//               )}
//             </ScrollView>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setShowNewMatchingModal(false)}
//             >
//               <Text style={styles.closeButtonText}>Đóng</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// export default DishDetailScreen;

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   containerButtonFloatBottom: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     left: 0,
//   },
//   boxButtonFloatBottom: {
//     backgroundColor: COLORS.white,
//     height: 80,
//     flexDirection: "row",
//     elevation: 20,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.darkGrey,
//   },
//   addToCartButton: {
//     width: "30%",
//     backgroundColor: COLORS.white,
//     alignItems: "center",
//     justifyContent: "center",
//     marginHorizontal: 10,
//     marginVertical: 10,
//     borderRadius: 10,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: COLORS.green,
//   },
//   orderButton: {
//     flex: 1,
//     backgroundColor: COLORS.green,
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 10,
//     borderRadius: 10,
//     elevation: 2,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: COLORS.green,
//   },
//   orderButtonText: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 20,
//     color: COLORS.white,
//   },
//   top: {
//     flexDirection: "row",
//     marginTop: StatusBar.currentHeight,
//   },
//   backButton: {
//     height: 50,
//     width: 50,
//     marginLeft: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     elevation: 0,
//   },
//   headerText: {
//     fontFamily: FONTS.bold,
//     color: COLORS.black,
//     marginLeft: 10,
//     fontSize: 20,
//   },
//   img: {
//     width: "100%",
//     height: 300,
//   },
//   slide: {
//     flex: 1,
//     alignItems: "center",
//   },
//   priceTag: {
//     position: "absolute",
//     right: 10,
//     bottom: 50,
//     backgroundColor: COLORS.green,
//     padding: 10,
//     borderRadius: 8,
//     elevation: 2,
//   },
//   priceText: {
//     fontFamily: FONTS.bold,
//     color: COLORS.white,
//     fontSize: 17,
//   },
//   dishName: {
//     fontFamily: FONTS.semiBold,
//     color: COLORS.black,
//     fontSize: 22,
//     marginBottom: 5,
//   },
//   dishInfo: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   dishType: {
//     fontFamily: FONTS.medium,
//     color: COLORS.grey,
//     fontSize: 15,
//     marginBottom: 5,
//   },
//   ratingText: {
//     fontFamily: FONTS.medium,
//     fontSize: 15,
//     marginLeft: 5,
//   },
//   containerAttribute: {
//     marginTop: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.greyPastel,
//     paddingBottom: 10,
//   },
//   titleAttribute: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 15,
//     color: COLORS.black,
//     marginBottom: 3,
//   },
//   textAttribute: {
//     fontFamily: FONTS.medium,
//     color: COLORS.grey,
//     fontSize: 15,
//     lineHeight: 23,
//   },
//   showMoreText: {
//     fontFamily: FONTS.semiBold,
//     color: COLORS.blue,
//   },
//   feedbackItem: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: COLORS.lightGray,
//     borderRadius: 8,
//   },
//   feedbackUsername: {
//     fontFamily: FONTS.bold,
//     color: COLORS.black,
//     fontSize: 15,
//   },
//   feedbackContent: {
//     fontFamily: FONTS.medium,
//     color: COLORS.grey,
//     fontSize: 14,
//     marginVertical: 5,
//   },
//   feedbackRating: {
//     fontFamily: FONTS.semiBold,
//     color: COLORS.star,
//     fontSize: 14,
//     marginLeft: 5,
//   },
//   heartIconContainer: {
//     height: 50,
//     width: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     elevation: 0,
//     marginRight: 20,
//   },
//   recommendButton: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     padding: 5,
//     elevation: 2,
//   },
//   // Modal chung
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalContent: {
//     backgroundColor: COLORS.white,
//     padding: 20,
//     borderRadius: 10,
//     width: "90%", // Example maxWidth
//     maxHeight: "80%",
//     justifyContent: "space-between",
//   },
//   modalTitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 20,
//     color: COLORS.black,
//     textAlign: "center",
//     marginBottom: 15,
//   },
//   modalSubTitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 16,
//     color: COLORS.black,
//     marginVertical: 10,
//     textAlign: "center",
//   },
//   closeButton: {
//     backgroundColor: COLORS.green,
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   closeButtonText: {
//     fontFamily: FONTS.semiBold,
//     color: COLORS.white,
//     fontSize: 16,
//   },
//   // Danh sách recommended
//   recommendationListContainer: {
//     width: "100%",
//     height: 360,
//     marginBottom: 10,
//   },
//   recommendationItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.greyPastel,
//   },
//   recommendationImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 10,
//     marginRight: 10,
//   },
//   recommendationTextContainer: {
//     flex: 1,
//   },
//   recommendationDishName: {
//     fontFamily: FONTS.semiBold,
//     color: COLORS.black,
//     fontSize: 16,
//   },
//   recommendationDishType: {
//     fontFamily: FONTS.medium,
//     color: COLORS.grey,
//     fontSize: 14,
//   },
//   noRecommendationText: {
//     fontFamily: FONTS.medium,
//     color: COLORS.grey,
//     fontSize: 15,
//     textAlign: "center",
//   },
//   // Modal hiển thị món gợi ý
//   modalImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 10,
//     marginBottom: 10,
//     alignSelf: "center",
//   },
//   modalText: {
//     fontFamily: FONTS.medium,
//     fontSize: 14,
//     color: COLORS.black,
//     marginVertical: 2,
//   },
//   modalButton: {
//     backgroundColor: COLORS.green,
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//     marginTop: 10,
//   },
//   modalButtonText: {
//     fontFamily: FONTS.semiBold,
//     color: COLORS.white,
//     fontSize: 16,
//   },
//   chartContainerSmall: {
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   // Nutrient detail
//   nutrientDetailItem: {
//     flexDirection: "column",
//     marginVertical: 5,
//     borderBottomWidth: 0.5,
//     borderBottomColor: COLORS.greyPastel,
//     paddingBottom: 5,
//   },
//   nutrientLabel: {
//     fontFamily: FONTS.medium,
//     color: COLORS.black,
//     fontSize: 14,
//   },
//   nutrientPercent: {
//     fontFamily: FONTS.medium,
//     color: COLORS.grey,
//     fontSize: 13,
//     marginLeft: 5,
//   },
// });
