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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import Swiper from "react-native-swiper";
import Toast from "react-native-toast-message";

import COLORS from "../constants/color";
import FONTS from "../constants/font";

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
  const [loadingRecommendModal, setLoadingRecommendModal] = useState(false); // Thêm state loading modal

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
    // targetDishId tuỳ bạn, nếu ko có => dishId chính
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

  // -------------------- Gọi API recommendMeal --------------------
  const fetchRecommendedDishes = async () => {
    if (!userId) return;
    let loadingTimeout; // Lưu ID của timeout

    // Tạo độ trễ trước khi hiển thị loading
    loadingTimeout = setTimeout(() => {
      setLoadingRecommendModal(true);
    }, 300); // 300ms delay

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
      clearTimeout(loadingTimeout); // Hủy timeout nếu fetch xong
      setRecommendationLoading(false);
      setLoadingRecommendModal(false); // Kết thúc loading
    }
  };

  // -------------------- Khi user bấm 1 món gợi ý => hiển thị thông tin dinh dưỡng + 2 nút --------------------
  const handleOpenRecommendedDish = async (item) => {
    // item = { dishId, dish, dishName, ... }
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
                    Calories: {nutrition?.totalCalories || 0} kcal
                  </Text>
                  <Text style={styles.textAttribute}>
                    Fat: {nutrition?.totalFat || 0} g
                  </Text>
                  <Text style={styles.textAttribute}>
                    Carbs: {nutrition?.totalCarbs || 0} g
                  </Text>
                  <Text style={styles.textAttribute}>
                    Protein: {nutrition?.totalProtein || 0} g
                  </Text>
                  <Text style={styles.textAttribute}>
                    Khối lượng: {nutrition?.totalWeights || "Không rõ"} g
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

            {/* Thêm phần loading ở đây */}
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

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRecommendationModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
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
                {/* Ảnh món */}
                <Image
                  source={{ uri: selectedRecommendedDish.dish?.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <Text style={styles.modalTitle}>
                  {selectedRecommendedDish.dishName}
                </Text>

                {/* Hiển thị dinh dưỡng */}
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.modalText}>
                    Calories:{" "}
                    {selectedRecommendedDishNutrition?.totalCalories || 0} kcal
                  </Text>
                  <Text style={styles.modalText}>
                    Fat: {selectedRecommendedDishNutrition?.totalFat || 0} g
                  </Text>
                  <Text style={styles.modalText}>
                    Carbs: {selectedRecommendedDishNutrition?.totalCarbs || 0} g
                  </Text>
                  <Text style={styles.modalText}>
                    Protein:{" "}
                    {selectedRecommendedDishNutrition?.totalProtein || 0} g
                  </Text>
                  <Text style={styles.modalText}>
                    Khối lượng:{" "}
                    {selectedRecommendedDishNutrition?.totalWeights ||
                      "Không rõ"}{" "}
                    g
                  </Text>
                </View>

                {/* Hai nút: Thêm giỏ / Xem chi tiết */}
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

            {/* Nút đóng */}
            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 15 }]}
              onPress={handleCloseRecommendedDishModal}
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
    width: "90%",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: COLORS.green,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: -30,
  },
  closeButtonText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    fontSize: 16,
  },
  // Danh sách recommended
  recommendationListContainer: {
    width: "100%",
    height: 360, // Để hiển thị đủ item
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
});
