import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Swiper from "react-native-swiper";
import Toast from "react-native-toast-message";

const DishDetailScreen = ({ navigation, route }) => {
  const { dishId } = route.params;
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMoreAttribute, setShowMoreAttribute] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchDishDetail = async () => {
      try {
        const response = await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${dishId}`
        );
        const data = await response.json();
        setDish(data);
      } catch (error) {
        console.error("Error fetching dish details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/getFeedbackByDishID/${dishId}`
        );
        const data = await response.json();
        setFeedbacks(data);

        // Tính rating trung bình
        if (data.length > 0) {
          const totalRating = data.reduce(
            (acc, feedback) => acc + feedback.rating,
            0
          );
          setAverageRating((totalRating / data.length).toFixed(1));
        } else {
          setAverageRating("0.0");
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchDishDetail();
    fetchFeedbacks();
  }, [dishId]);

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

  const showToastAddToCart = () => {
    Toast.show({
      type: "success",
      text1: "Thông báo",
      text2: "Thêm vào giỏ hàng thành công! 👋",
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text>Đang tải thông tin món ăn...</Text>
      </View>
    );
  }

  if (!dish) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không tìm thấy thông tin món ăn.</Text>
      </View>
    );
  }

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
        {/* Top Navigation */}
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
            <Text
              style={{
                fontFamily: FONTS.bold,
                color: COLORS.black,
                marginLeft: 10,
                fontSize: 20,
              }}
            >
              Chi tiết món ăn
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Slider */}
        <View style={{ height: 250 }}>
          <Swiper
            style={styles.wrapper}
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
          <View
            style={{
              elevation: 2,
              position: "absolute",
              right: 10,
              bottom: 50,
              backgroundColor: COLORS.green,
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.bold,
                color: COLORS.white,
                fontSize: 17,
              }}
            >
              {dish.price} đ
            </Text>
          </View>
        </View>

        {/* Dish Details */}
        <View style={{ padding: 15 }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              color: COLORS.black,
              fontSize: 22,
              marginBottom: 5,
            }}
          >
            {dish.name}
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                fontFamily: FONTS.medium,
                color: COLORS.grey,
                fontSize: 15,
                marginBottom: 5,
              }}
            >
              {dish.dishType}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {renderStars(averageRating)}
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  fontSize: 15,
                  marginLeft: 5,
                }}
              >
                {averageRating}
              </Text>
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
                onPress={() => setShowMoreAttribute(!showMoreAttribute)}
              >
                <Text
                  style={{ fontFamily: FONTS.semiBold, color: COLORS.blue }}
                >
                  Xem thêm
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Recipe */}
          {showMoreAttribute && (
            <View style={styles.containerAttribute}>
              <Text style={styles.titleAttribute}>Công thức</Text>
              <Text style={styles.textAttribute}>
                {dish.recipe || "Không có công thức"}
              </Text>
              <TouchableOpacity
                style={{ marginTop: 5 }}
                activeOpacity={0.6}
                onPress={() => setShowMoreAttribute(!showMoreAttribute)}
              >
                <Text
                  style={{ fontFamily: FONTS.semiBold, color: COLORS.blue }}
                >
                  Thu gọn
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Feedbacks */}
          <View style={styles.containerAttribute}>
            <Text style={styles.titleAttribute}>Đánh giá & Nhận xét</Text>
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <View key={feedback.feedbackId} style={styles.feedbackItem}>
                  <Text style={styles.feedbackUsername}>
                    {feedback.username}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {renderStars(feedback.rating)}
                    <Text style={styles.feedbackRating}>{feedback.rating}</Text>
                  </View>
                  <Text style={styles.feedbackContent}>
                    {feedback.feedbackContent}
                  </Text>
                  <Text style={{ color: COLORS.grey, fontSize: 12 }}>
                    {new Date(feedback.feedbackDate).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.feedbackContent}>Chưa có đánh giá.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={showToastAddToCart}
            style={{
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
            }}
          >
            <Icon1 name={"cart-plus"} size={30} color={COLORS.green} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Cart")}
            style={{
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
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: 20,
                color: COLORS.white,
              }}
            >
              Đặt hàng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default DishDetailScreen;

const styles = StyleSheet.create({
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
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    height: 80,
  },
  img: {
    width: "100%",
    height: 300,
    borderRadius: 0,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerAttribute: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 10,
  },
  titleAttribute: {
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    fontSize: 15,
    marginBottom: 3,
  },
  textAttribute: {
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    fontSize: 15,
    lineHeight: 23,
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
  },
});
