import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";
import { ButtonFlex } from "../components/Button";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import Toast from "react-native-toast-message";

const OrderDetailScreen = ({ navigation }) => {
  // State variables
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedDish, setSelectedDish] = useState(null);
  const [reviewedDishes, setReviewedDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const bottomSheetRef = useRef();
  const snapPoints = useMemo(() => ["65%"], []);

  // Callback for BottomSheet backdrop
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={handleClosePress}
      />
    ),
    []
  );

  // Order status mapping
  const orderStatus = {
    pending: { color: COLORS.grey, text: "Chờ xác nhận" },
    processing: { color: COLORS.orange, text: "Đang xử lí" },
    delivering: { color: COLORS.blue, text: "Đang giao hàng" },
    delivered: { color: COLORS.green, text: "Đã giao" },
    cancel: { color: COLORS.red, text: "Đã hủy" },
    failed: { color: COLORS.black, text: "Giao hàng thất bại" },
  };

  // Function for fetching data with authentication
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

  // Fetch order data on component mount
  useEffect(() => {
    const getOrderFromStorage = async () => {
      try {
        const orderData = await AsyncStorage.getItem("selectedOrder");
        if (orderData) {
          const parsedOrder = JSON.parse(orderData);
          setOrder(parsedOrder);
          fetchOrderDetails(parsedOrder.orderId);
          fetchPaymentDetails(parsedOrder.orderId);
        }
      } catch (error) {
        console.error("Error fetching order from AsyncStorage:", error);
      }
    };

    getOrderFromStorage();
  }, []);

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderDetailByOrderId/${orderId}`
      );
      const data = await response.json();

      const dishesWithDetails = await Promise.all(
        data.map(async (detail) => {
          const dishResponse = await fetchWithAuth(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${detail.dishId}`
          );
          const dish = await dishResponse.json();
          return { ...detail, dish };
        })
      );

      setOrderDetails(dishesWithDetails);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    try {
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn hủy đơn hàng?",
        [
          { text: "Không", style: "cancel" },
          {
            text: "Có",
            onPress: async () => {
              const response = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${order.orderId}?newStatus=cancel`,
                {
                  method: "PUT",
                }
              );
              if (response.ok) {
                // Refund Logic Here
                try {
                  // Perform the refund api call.
                  const refundResponse = await fetchWithAuth(
                    `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/payments/refund`,
                    {
                      method: "POST",
                      body: JSON.stringify({
                        userId: order.userId,
                        orderId: order.orderId,
                      }),
                    }
                  );
                  if (refundResponse.ok) {
                    Alert.alert(
                      "Thông báo",
                      "Đơn hàng đã được hủy và hoàn tiền thành công."
                    );
                    navigation.goBack();
                    return;
                  }
                  const refundErrorText = await refundResponse.text();
                  console.error("Lỗi khi hoàn tiền:", refundErrorText);
                  Alert.alert("Lỗi", "Không thể hoàn tiền. Vui lòng thử lại.");
                } catch (error) {
                  console.error("Lỗi khi hoàn tiền:", error);
                  Alert.alert("Lỗi", "Không thể hoàn tiền. Vui lòng thử lại.");
                }
                Alert.alert("Thông báo", "Đơn hàng đã được hủy thành công.");
                navigation.goBack(); // Quay lại màn hình trước đó
              } else {
                const errorText = await response.text();
                console.error("Lỗi khi hủy đơn hàng:", errorText);
                Alert.alert("Lỗi", "Không thể hủy đơn hàng. Vui lòng thử lại.");
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error.message);
      Alert.alert("Lỗi", "Không thể hủy đơn hàng. Vui lòng thử lại.");
    }
  };

  // Handle submit feedback
  const handleSubmitFeedback = async () => {
    try {
      if (!feedback.trim() || rating === 0) {
        Alert.alert("Thông báo", "Vui lòng nhập nội dung và đánh giá sao.");
        return;
      }

      if (!selectedDish) {
        Alert.alert("Lỗi", "Không tìm thấy món ăn để đánh giá.");
        return;
      }

      // Call API to check feedback content
      const checkResult = await checkCommentContent(feedback);

      if (checkResult && checkResult.success === false) {
        // Close form before displaying Toast
        handleClosePress();

        let message =
          "Nội dung đánh giá của bạn không hợp lệ. Vui lòng nhập lại!";
        if (checkResult.message.includes("violent language")) {
          message = "Bạn sử dụng ngôn từ bạo lực, hãy đánh giá lại nhé!";
        }

        Toast.show({
          type: "error",
          text1: "Cảnh báo",
          text2: message,
        });

        return; // Stop if the content is invalid
      }

      // If the content is valid, send feedback
      const payload = {
        dishId: selectedDish.dishId,
        userId: order?.userId,
        orderId: order?.orderId,
        rating: rating,
        feedbackContent: feedback,
        feedbackDate: new Date().toISOString(),
      };

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/createFeedback`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/EditCustomer/membership/changePoint/${order?.userId}/10`,
          {
            method: "PUT",
          }
        );

        // Close feedback form before showing toast
        handleClosePress();

        // Reset feedback form
        setFeedback("");
        setRating(0);

        // Show success toast
        Toast.show({
          type: "success",
          text1: "Thông báo",
          text2: "Đánh giá đã được gửi thành công! Bạn đã được cộng điểm.",
        });
        // Reload list of reviewed dishes
        await fetchReviewedDishes();
      } else {
        const errorData = await response.json();
        console.error("Error submitting feedback:", errorData);
        Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi đánh giá.");
    }
  };

  // Check comment content
  const checkCommentContent = async (content) => {
    try {
      // Split content into words
      const words = content.split(/\s+/); // Split by whitespace

      for (let word of words) {
        // Call API to check each word
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/check-comment-content?Content=${encodeURIComponent(
            word
          )}`,
          {
            method: "GET", // GET method
          }
        );

        if (!response.ok) {
          return { success: false, message: "Invalid content detected." };
        }

        const result = await response.json();

        // If API returns success as false, stop checking and return error
        if (!result.success) {
          return {
            success: false,
            message: `Invalid content detected: "${word}"`,
          };
        }
      }

      // If all words are valid
      return { success: true, message: "Content is valid." };
    } catch (error) {
      console.error("Error checking comment content:", error);
      return { success: false, message: "Error checking content." };
    }
  };

  // Handle opening the feedback form
  const handleOpenPress = (dish) => {
    setSelectedDish(dish);
    bottomSheetRef.current?.expand();
  };

  // Handle closing the feedback form
  const handleClosePress = () => {
    setSelectedDish(null);
    bottomSheetRef.current?.close();
  };

  // Fetch reviewed dishes
  const fetchReviewedDishes = async () => {
    const reviewed = [];
    try {
      for (const item of orderDetails) {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/getFeedbackByDishID/${item.dish.dishId}`
        );

        if (response.ok) {
          const feedbacks = await response.json();
          // Check if any feedback matches the current orderId
          const hasFeedback = feedbacks.some(
            (feedback) => feedback.orderId === order.orderId
          );
          if (hasFeedback) {
            reviewed.push(item.dish.dishId);
          }
        } else {
          console.error("Failed to fetch feedbacks:", await response.text());
        }
      }
      setReviewedDishes(reviewed);
    } catch (error) {
      console.error("Error fetching reviewed dishes:", error);
    }
  };

  // Fetch payment details
  const fetchPaymentDetails = async (orderId) => {
    try {
      console.log(`Fetching payment details for orderId: ${orderId}`);
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${orderId}`
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch payment details. Status: ${response.status}`
        );
        return;
      }

      const data = await response.json();
      console.log("Payment details fetched:", data);
      setPaymentDetails(data); // Store payment information
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  // Fetch reviewed dishes on mount or when order/orderDetails updates
  useEffect(() => {
    if (order && orderDetails.length > 0) {
      fetchReviewedDishes();
    }
  }, [order, orderDetails]);

  return (
    <>
      {/* Header */}
      <Header
        title="Chi tiết đơn hàng"
        leftIcon="arrow-back-outline"
        rightIcon="menu"
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      {/* Toast message */}
      <Toast />
      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white }}
        contentContainerStyle={{ padding: 15, paddingTop: 0 }}
      >
        {/* Order Information */}
        {order && (
          <View style={styles.orderInfoContainer}>
            <View
              style={{
                backgroundColor: orderStatus[order.status]?.color,
                paddingHorizontal: 10,
                paddingVertical: 10,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}
            >
              <Text style={styles.statusText}>
                {orderStatus[order.status]?.text}
              </Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Thông tin vận chuyển</Text>
              <Text style={styles.infoText}>
                Thời gian đặt: {order.orderDate}
              </Text>
              <Text style={styles.infoText}>
                Địa chỉ: {order.deliveryAddress}
              </Text>
              <Text style={styles.infoText}>
                Phí vận chuyển: {order?.deliveryFee?.toLocaleString() || "0"} đ
              </Text>
              <Text style={styles.infoText}>
                Số điện thoại: {order.phoneNumber}
              </Text>
            </View>
          </View>
        )}

        {/* Notes Section */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <Text style={styles.notesText}>{order?.note || "Không"}</Text>
        </View>

        {/* Discount Section */}
        <View style={styles.discountContainer}>
          <Text style={styles.sectionTitle}>Giảm giá</Text>
          {order?.discountRate === 0.1 && (
            <Text style={styles.discountText}>
              Thành viên Silver - Giảm 10%
            </Text>
          )}
          {order?.discountRate === 0.2 && (
            <Text style={styles.discountText}>Thành viên Gold - Giảm 20%</Text>
          )}
          {order?.discountRate === 0.3 && (
            <Text style={styles.discountText}>
              Thành viên Platinum - Giảm 30%
            </Text>
          )}
          {!order?.discountRate && (
            <Text style={styles.discountText}>Không áp dụng giảm giá</Text>
          )}
        </View>
        {/* Notes Section */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Tiền được giảm</Text>

          <Text style={styles.notesText}>
            {order?.discountPrice?.toLocaleString() || "0"} đ
          </Text>
        </View>

        <View style={styles.paymentContainer}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {paymentDetails && paymentDetails.length > 0 ? (
            <Text style={styles.paymentText}>
              {paymentDetails[0].paymentMethod || "Phương thức không xác định"}
            </Text>
          ) : (
            <Text style={styles.paymentText}>Đang tải...</Text>
          )}
        </View>

        {/* Dish List */}
        <View style={styles.dishSection}>
          <Text style={styles.sectionTitle}>Món ăn</Text>
          {orderDetails.map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.listItem}
              key={index}
              onPress={() =>
                navigation.navigate("DishDetail", {
                  dishId: item.dish.dishId,
                })
              } // Navigate to dish detail screen
            >
              <Image
                source={{ uri: item.dish.imageUrl }}
                style={styles.dishImage}
              />
              <View style={styles.dishDetails}>
                <Text style={styles.textNameDish} numberOfLines={1}>
                  {item.dish.name}
                </Text>
                <Text style={styles.textDishType}>{item.dish.dishType}</Text>

                <Text style={styles.textDishPrice}>
                  {item.price?.toLocaleString()} đ
                </Text>
                <View style={styles.quantityContainer}>
                  <Text style={styles.textQuantity}>
                    Số lượng: x{item.quantity}
                  </Text>
                  {!reviewedDishes.includes(item.dish.dishId) &&
                    order?.status === "delivered" && (
                      <ButtonFlex
                        title="Đánh giá"
                        onPress={() => handleOpenPress(item.dish)}
                        stylesButton={styles.buttonStyle}
                        stylesText={styles.buttonTextStyle}
                      />
                    )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Price */}
        <View style={{ alignItems: "flex-end", padding: 10 }}>
          <Text style={styles.totalText}>
            Tổng tiền:{" "}
            <Text style={styles.totalPrice}>
              {order?.totalPrice?.toLocaleString()} đ
            </Text>
          </Text>
        </View>
        {/* Cancel button */}
        {order?.status === "pending" && (
          <View style={styles.cancelOrderContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Feedback Form in BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: COLORS.white,
            padding: 20,
          }}
        >
          {selectedDish && (
            <View>
              {/* Dish Image */}
              <View style={styles.dishImageContainer}>
                <Image
                  source={{ uri: selectedDish.imageUrl }}
                  style={styles.dishImageLarge}
                />
              </View>

              {/* Dish Title */}
              <Text style={styles.feedbackTitle}>
                Đánh giá món ăn: {selectedDish.name}
              </Text>

              {/* Rating */}
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name={star <= rating ? "star" : "star-outline"}
                      size={30}
                      color={COLORS.star}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Feedback Input */}
              <View style={styles.feedbackForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập nội dung đánh giá..."
                  value={feedback}
                  onChangeText={setFeedback}
                  multiline
                />
              </View>

              {/* Submit and Cancel Buttons */}
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitFeedback}
                >
                  <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: COLORS.red }]}
                  onPress={handleClosePress}
                >
                  <Text style={styles.submitButtonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
};

export default OrderDetailScreen;

// Styles
const styles = StyleSheet.create({
  orderInfoContainer: {
    borderWidth: 0.5,
    borderColor: COLORS.darkGrey,
    borderRadius: 10,
    marginBottom: 10,
  },
  statusText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.white,
  },
  infoContent: {
    padding: 10,
  },
  infoTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    marginBottom: 5,
  },
  infoText: {
    fontFamily: FONTS.medium,
    marginBottom: 5,
  },
  notesContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    marginBottom: 10,
  },
  notesText: {
    fontFamily: FONTS.medium,
    color: COLORS.greySolid,
  },
  discountContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  discountText: {
    fontFamily: FONTS.medium,
    color: COLORS.greySolid,
  },
  paymentContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentText: {
    fontFamily: FONTS.medium,
    color: COLORS.greySolid,
  },
  dishSection: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
  },
  listItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 10,
  },
  dishImage: {
    width: 120,
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  },
  dishDetails: {
    flex: 1,
    paddingLeft: 10,
  },
  textNameDish: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishType: {
    color: COLORS.grey,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishPrice: {
    color: COLORS.green,
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textQuantity: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  buttonStyle: {
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.green,
  },
  buttonTextStyle: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  totalText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  totalPrice: {
    fontFamily: FONTS.bold,
    color: COLORS.green,
  },
  cancelOrderContainer: {
    marginTop: 20,
    alignItems: "center",
    marginBottom: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  dishImageContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  dishImageLarge: {
    width: 150,
    height: 100,
    borderRadius: 10,
    resizeMode: "cover",
  },
  feedbackTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    color: COLORS.black,
  },
  feedbackForm: {
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 10,
    padding: 10,
    backgroundColor: COLORS.white,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    minHeight: 60,
    textAlignVertical: "top",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});

// import React, {
//   useEffect,
//   useState,
//   useRef,
//   useMemo,
//   useCallback,
// } from "react";

// import {
//   StyleSheet,
//   View,
//   Image,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   TextInput, // Thêm TextInput ở đây
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import COLORS from "../constants/color";
// import FONTS from "../constants/font";
// import Icon from "react-native-vector-icons/Ionicons";
// import Header from "../components/Header";
// import { ButtonFlex } from "../components/Button";
// import BottomSheet, {
//   BottomSheetBackdrop,
//   BottomSheetScrollView,
// } from "@gorhom/bottom-sheet";
// import Toast from "react-native-toast-message";

// const OrderDetailScreen = ({ navigation }) => {
//   const [order, setOrder] = useState(null);
//   const [orderDetails, setOrderDetails] = useState([]);
//   const [feedback, setFeedback] = useState(""); // Biến trạng thái cho nội dung feedback
//   const [rating, setRating] = useState(0); // Biến trạng thái cho rating sao
//   const [selectedDish, setSelectedDish] = React.useState(null);
//   const [reviewedDishes, setReviewedDishes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isNotificationVisible, setNotificationVisible] = useState(false);
//   const bottomSheetRef = useRef();
//   const snapPoints = useMemo(() => ["65%"], []);
//   const [paymentDetails, setPaymentDetails] = useState(null);

//   const handleOpenPress = (dish) => {
//     setSelectedDish(dish);
//     bottomSheetRef.current?.expand();
//   };

//   const handleClosePress = () => {
//     setSelectedDish(null);
//     bottomSheetRef.current?.close();
//   };

//   const renderBackdrop = useCallback(
//     (props) => (
//       <BottomSheetBackdrop
//         {...props}
//         disappearsOnIndex={-1}
//         appearsOnIndex={0}
//         onPress={handleClosePress}
//       />
//     ),
//     []
//   );

//   const orderStatus = {
//     pending: { color: COLORS.grey, text: "Chờ xác nhận" },
//     processing: { color: COLORS.orange, text: "Đang xử lí" },
//     delivering: { color: COLORS.blue, text: "Đang giao hàng" },
//     delivered: { color: COLORS.green, text: "Đã giao" },
//     cancel: { color: COLORS.red, text: "Đã hủy" },
//     failed: { color: COLORS.black, text: "Giao hàng thất bại" },
//   };

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

//   useEffect(() => {
//     const getOrderFromStorage = async () => {
//       try {
//         const orderData = await AsyncStorage.getItem("selectedOrder");
//         if (orderData) {
//           const parsedOrder = JSON.parse(orderData);
//           setOrder(parsedOrder);
//           fetchOrderDetails(parsedOrder.orderId);
//           fetchPaymentDetails(parsedOrder.orderId);
//         }
//       } catch (error) {
//         console.error("Error fetching order from AsyncStorage:", error);
//       }
//     };

//     getOrderFromStorage();
//   }, []);

//   const fetchOrderDetails = async (orderId) => {
//     try {
//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderDetailByOrderId/${orderId}`
//       );
//       const data = await response.json();

//       const dishesWithDetails = await Promise.all(
//         data.map(async (detail) => {
//           const dishResponse = await fetchWithAuth(
//             `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${detail.dishId}`
//           );
//           const dish = await dishResponse.json();
//           return { ...detail, dish };
//         })
//       );

//       setOrderDetails(dishesWithDetails);
//     } catch (error) {
//       console.error("Error fetching order details:", error);
//     }
//   };

//   const handleCancelOrder = async () => {
//     try {
//       Alert.alert(
//         "Xác nhận",
//         "Bạn có chắc chắn muốn hủy đơn hàng?",
//         [
//           { text: "Không", style: "cancel" },
//           {
//             text: "Có",
//             onPress: async () => {
//               const response = await fetchWithAuth(
//                 `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${order.orderId}?newStatus=cancel`,
//                 {
//                   method: "PUT",
//                 }
//               );
//               if (response.ok) {
//                 Alert.alert("Thông báo", "Đơn hàng đã được hủy thành công.");
//                 navigation.goBack(); // Quay lại màn hình trước đó
//               } else {
//                 const errorText = await response.text();
//                 console.error("Lỗi khi hủy đơn hàng:", errorText);
//                 Alert.alert("Lỗi", "Không thể hủy đơn hàng. Vui lòng thử lại.");
//               }
//             },
//           },
//         ],
//         { cancelable: false }
//       );
//     } catch (error) {
//       console.error("Lỗi khi hủy đơn hàng:", error.message);
//       Alert.alert("Lỗi", "Không thể hủy đơn hàng. Vui lòng thử lại.");
//     }
//   };

//   const handleSubmitFeedback = async () => {
//     try {
//       if (!feedback.trim() || rating === 0) {
//         Alert.alert("Thông báo", "Vui lòng nhập nội dung và đánh giá sao.");
//         return;
//       }

//       if (!selectedDish) {
//         Alert.alert("Lỗi", "Không tìm thấy món ăn để đánh giá.");
//         return;
//       }

//       // Gọi API kiểm tra nội dung feedback
//       const checkResult = await checkCommentContent(feedback);

//       if (checkResult && checkResult.success === false) {
//         // Đóng form trước khi hiển thị Toast
//         handleClosePress();

//         let message =
//           "Nội dung đánh giá của bạn không hợp lệ. Vui lòng nhập lại!";
//         if (checkResult.message.includes("violent language")) {
//           message = "Bạn sử dụng ngôn từ bạo lực, hãy đánh giá lại nhé!";
//         }

//         Toast.show({
//           type: "error",
//           text1: "Cảnh báo",
//           text2: message,
//         });

//         return; // Dừng lại nếu nội dung không hợp lệ
//       }

//       // Nếu nội dung hợp lệ, gửi feedback
//       const payload = {
//         dishId: selectedDish.dishId,
//         userId: order?.userId,
//         orderId: order?.orderId,
//         rating: rating,
//         feedbackContent: feedback,
//         feedbackDate: new Date().toISOString(),
//       };

//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/createFeedback`,
//         {
//           method: "POST",
//           body: JSON.stringify(payload),
//         }
//       );

//       if (response.ok) {
//         await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/EditCustomer/membership/changePoint/${order?.userId}/10`,
//           {
//             method: "PUT",
//           }
//         );

//         // Đóng form feedback trước khi hiển thị Toast
//         handleClosePress();

//         // Reset form feedback
//         setFeedback("");
//         setRating(0);

//         // Hiển thị Toast thành công
//         Toast.show({
//           type: "success",
//           text1: "Thông báo",
//           text2: "Đánh giá đã được gửi thành công! Bạn đã được cộng điểm.",
//         });

//         // Load lại danh sách món đã đánh giá
//         await fetchReviewedDishes();
//       } else {
//         const errorData = await response.json();
//         console.error("Error submitting feedback:", errorData);
//         Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại.");
//       }
//     } catch (error) {
//       console.error("Error submitting feedback:", error);
//       Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi đánh giá.");
//     }
//   };
//   //sua check content
//   const checkCommentContent = async (content) => {
//     try {
//       // Tách nội dung thành từng từ
//       const words = content.split(/\s+/); // Tách theo khoảng trắng

//       for (let word of words) {
//         // Gọi API kiểm tra từng từ
//         const response = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/check-comment-content?Content=${encodeURIComponent(
//             word
//           )}`,
//           {
//             method: "GET", // Phương thức GET
//           }
//         );

//         if (!response.ok) {
//           return { success: false, message: "Invalid content detected." };
//         }

//         const result = await response.json();

//         // Nếu API trả về success là false, dừng kiểm tra và trả về lỗi
//         if (!result.success) {
//           return {
//             success: false,
//             message: `Invalid content detected: "${word}"`,
//           };
//         }
//       }

//       // Nếu tất cả từ đều hợp lệ
//       return { success: true, message: "Content is valid." };
//     } catch (error) {
//       console.error("Error checking comment content:", error);
//       return { success: false, message: "Error checking content." };
//     }
//   };

//   const handleFeedback = (dish) => {
//     // Nếu món đang được chọn là món hiện tại, ẩn form đánh giá
//     if (selectedDish && selectedDish.dishId === dish.dishId) {
//       setSelectedDish(null); // Đóng form đánh giá
//     } else {
//       setSelectedDish(dish); // Mở form đánh giá cho món được chọn
//     }
//   };

//   const fetchReviewedDishes = async () => {
//     const reviewed = [];
//     try {
//       for (const item of orderDetails) {
//         const response = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/getFeedbackByDishID/${item.dish.dishId}`
//         );

//         if (response.ok) {
//           const feedbacks = await response.json();
//           // Check if any feedback matches the current orderId
//           const hasFeedback = feedbacks.some(
//             (feedback) => feedback.orderId === order.orderId
//           );
//           if (hasFeedback) {
//             reviewed.push(item.dish.dishId);
//           }
//         } else {
//           console.error("Failed to fetch feedbacks:", await response.text());
//         }
//       }
//       setReviewedDishes(reviewed);
//     } catch (error) {
//       console.error("Error fetching reviewed dishes:", error);
//     }
//   };

//   useEffect(() => {
//     if (order && orderDetails.length > 0) {
//       fetchReviewedDishes();
//     }
//   }, [order, orderDetails]);

//   const fetchPaymentDetails = async (orderId) => {
//     try {
//       console.log(`Fetching payment details for orderId: ${orderId}`);
//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${orderId}`
//       );

//       if (!response.ok) {
//         console.error(
//           `Failed to fetch payment details. Status: ${response.status}`
//         );
//         return;
//       }

//       const data = await response.json();
//       console.log("Payment details fetched:", data); // Ghi log dữ liệu trả về
//       setPaymentDetails(data); // Lưu thông tin thanh toán
//     } catch (error) {
//       console.error("Error fetching payment details:", error);
//     }
//   };

//   return (
//     <>
//       <Header
//         title="Chi tiết đơn hàng"
//         leftIcon="arrow-back-outline"
//         rightIcon="menu"
//         colorBackground={COLORS.white}
//         colorText={COLORS.black}
//         onPress={() => navigation.goBack()}
//       />
//       <Toast />
//       <ScrollView
//         style={{ flex: 1, backgroundColor: COLORS.white }}
//         contentContainerStyle={{ padding: 15, paddingTop: 0 }}
//       >
//         {/* Order Information */}
//         {order && (
//           <View style={styles.orderInfoContainer}>
//             <View
//               style={{
//                 backgroundColor: orderStatus[order.status]?.color,
//                 paddingHorizontal: 10,
//                 paddingVertical: 10,
//                 borderTopLeftRadius: 10,
//                 borderTopRightRadius: 10,
//               }}
//             >
//               <Text style={styles.statusText}>
//                 {orderStatus[order.status]?.text}
//               </Text>
//             </View>
//             <View style={styles.infoContent}>
//               <Text style={styles.infoTitle}>Thông tin vận chuyển</Text>
//               <Text style={styles.infoText}>
//                 Thời gian đặt: {order.orderDate}
//               </Text>
//               <Text style={styles.infoText}>
//                 Địa chỉ: {order.deliveryAddress}
//               </Text>
//               <Text style={styles.infoText}>
//                 Phí vận chuyển: {order?.deliveryFee?.toLocaleString() || "0"} đ
//               </Text>
//               <Text style={styles.infoText}>
//                 Số điện thoại: {order.phoneNumber}
//               </Text>
//             </View>
//           </View>
//         )}

//         {/* Notes Section */}
//         <View style={styles.notesContainer}>
//           <Text style={styles.sectionTitle}>Ghi chú</Text>
//           <Text style={styles.notesText}>{order?.note || "Không"}</Text>
//         </View>

//         {/* Discount Section */}
//         <View style={styles.discountContainer}>
//           <Text style={styles.sectionTitle}>Giảm giá</Text>
//           {order?.discountRate === 0.1 && (
//             <Text style={styles.discountText}>
//               Thành viên Silver - Giảm 10%
//             </Text>
//           )}
//           {order?.discountRate === 0.2 && (
//             <Text style={styles.discountText}>Thành viên Gold - Giảm 20%</Text>
//           )}
//           {order?.discountRate === 0.3 && (
//             <Text style={styles.discountText}>
//               Thành viên Platinum - Giảm 30%
//             </Text>
//           )}
//           {!order?.discountRate && (
//             <Text style={styles.discountText}>Không áp dụng giảm giá</Text>
//           )}
//         </View>
//         {/* Notes Section */}
//         <View style={styles.notesContainer}>
//           <Text style={styles.sectionTitle}>Tiền được giảm</Text>

//           <Text style={styles.notesText}>
//             {order?.discountPrice?.toLocaleString() || "0"} đ
//           </Text>
//         </View>

//         <View style={styles.paymentContainer}>
//           <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
//           {paymentDetails && paymentDetails.length > 0 ? (
//             <Text style={styles.paymentText}>
//               {paymentDetails[0].paymentMethod || "Phương thức không xác định"}
//             </Text>
//           ) : (
//             <Text style={styles.paymentText}>Đang tải...</Text>
//           )}
//         </View>

//         {/* Dish List */}
//         <View style={styles.dishSection}>
//           <Text style={styles.sectionTitle}>Món ăn</Text>
//           {orderDetails.map((item, index) => (
//             <TouchableOpacity
//               activeOpacity={0.8}
//               style={styles.listItem}
//               key={index}
//               onPress={() =>
//                 navigation.navigate("DishDetail", {
//                   dishId: item.dish.dishId,
//                 })
//               } // Chuyển `onPress` vào bên trong `TouchableOpacity`
//             >
//               <Image
//                 source={{ uri: item.dish.imageUrl }}
//                 style={styles.dishImage}
//               />
//               <View style={styles.dishDetails}>
//                 <Text style={styles.textNameDish} numberOfLines={1}>
//                   {item.dish.name}
//                 </Text>
//                 <Text style={styles.textDishType}>{item.dish.dishType}</Text>

//                 <Text style={styles.textDishPrice}>
//                   {item.price?.toLocaleString()} đ
//                 </Text>
//                 <View style={styles.quantityContainer}>
//                   <Text style={styles.textQuantity}>
//                     Số lượng: x{item.quantity}
//                   </Text>
//                   {!reviewedDishes.includes(item.dish.dishId) &&
//                     order?.status === "delivered" && (
//                       <ButtonFlex
//                         title="Đánh giá"
//                         onPress={() => handleOpenPress(item.dish)}
//                         stylesButton={styles.buttonStyle}
//                         stylesText={styles.buttonTextStyle}
//                       />
//                     )}
//                 </View>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Total Price */}
//         <View style={{ alignItems: "flex-end", padding: 10 }}>
//           <Text style={styles.totalText}>
//             Tổng tiền:{" "}
//             <Text style={styles.totalPrice}>
//               {order?.totalPrice?.toLocaleString()} đ
//             </Text>
//           </Text>
//         </View>

//         {order?.status === "pending" && (
//           <View style={styles.cancelOrderContainer}>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={handleCancelOrder}
//             >
//               <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       {/* Feedback Form in BottomSheet */}
//       <BottomSheet
//         ref={bottomSheetRef}
//         index={-1}
//         snapPoints={snapPoints}
//         enablePanDownToClose={true}
//         backdropComponent={renderBackdrop}
//       >
//         <BottomSheetScrollView
//           style={{
//             width: "100%",
//             height: "auto",
//             backgroundColor: COLORS.white,
//             padding: 20,
//           }}
//         >
//           {selectedDish && (
//             <View>
//               {/* Dish Image */}
//               <View style={styles.dishImageContainer}>
//                 <Image
//                   source={{ uri: selectedDish.imageUrl }}
//                   style={styles.dishImageLarge}
//                 />
//               </View>

//               {/* Dish Title */}
//               <Text style={styles.feedbackTitle}>
//                 Đánh giá món ăn: {selectedDish.name}
//               </Text>

//               {/* Rating */}
//               <View style={styles.ratingContainer}>
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <TouchableOpacity
//                     key={star}
//                     onPress={() => setRating(star)}
//                     activeOpacity={0.8}
//                   >
//                     <Icon
//                       name={star <= rating ? "star" : "star-outline"}
//                       size={30}
//                       color={COLORS.star}
//                     />
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {/* Feedback Input */}
//               <View style={styles.feedbackForm}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Nhập nội dung đánh giá..."
//                   value={feedback}
//                   onChangeText={setFeedback}
//                   multiline
//                 />
//               </View>

//               {/* Submit and Cancel Buttons */}
//               <View style={styles.buttonGroup}>
//                 <TouchableOpacity
//                   style={styles.submitButton}
//                   onPress={handleSubmitFeedback}
//                 >
//                   <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.submitButton, { backgroundColor: COLORS.red }]}
//                   onPress={handleClosePress}
//                 >
//                   <Text style={styles.submitButtonText}>Hủy</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         </BottomSheetScrollView>
//       </BottomSheet>
//     </>
//   );
// };

// export default OrderDetailScreen;

// const styles = StyleSheet.create({
//   orderInfoContainer: {
//     borderWidth: 0.5,
//     borderColor: COLORS.darkGrey,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   statusText: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 15,
//     color: COLORS.white,
//   },
//   infoContent: {
//     padding: 10,
//   },
//   infoTitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 15,
//     marginBottom: 5,
//   },
//   infoText: {
//     fontFamily: FONTS.medium,
//     marginBottom: 5,
//   },
//   notesContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   sectionTitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 15,
//     marginBottom: 10,
//   },
//   notesText: {
//     fontFamily: FONTS.medium,
//     color: COLORS.greySolid,
//   },
//   discountContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   discountText: {
//     fontFamily: FONTS.medium,
//     color: COLORS.greySolid,
//   },
//   paymentContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   paymentText: {
//     fontFamily: FONTS.medium,
//     color: COLORS.greySolid,
//   },
//   dishSection: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//   },
//   listItem: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     overflow: "hidden",
//     flexDirection: "row",
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.greyPastel,
//     paddingBottom: 10,
//   },
//   dishImage: {
//     width: 120,
//     height: "100%",
//     resizeMode: "cover",
//     borderRadius: 8,
//   },
//   dishDetails: {
//     flex: 1,
//     paddingLeft: 10,
//   },
//   textNameDish: {
//     color: COLORS.black,
//     fontSize: 16,
//     fontFamily: FONTS.semiBold,
//     marginBottom: 3,
//   },
//   textDishType: {
//     color: COLORS.grey,
//     fontSize: 12,
//     fontFamily: FONTS.semiBold,
//     marginBottom: 3,
//   },
//   textDishPrice: {
//     color: COLORS.green,
//     fontSize: 15,
//     fontFamily: FONTS.semiBold,
//     marginBottom: 3,
//   },
//   quantityContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   textQuantity: {
//     fontSize: 15,
//     fontFamily: FONTS.semiBold,
//   },
//   buttonStyle: {
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     backgroundColor: COLORS.green,
//   },
//   buttonTextStyle: {
//     fontSize: 12,
//     fontFamily: FONTS.semiBold,
//     color: COLORS.white,
//   },
//   totalText: {
//     fontFamily: FONTS.medium,
//     fontSize: 16,
//   },
//   totalPrice: {
//     fontFamily: FONTS.bold,
//     color: COLORS.green,
//   },
//   cancelOrderContainer: {
//     marginTop: 20,
//     alignItems: "center",
//     marginBottom: 5, // Thêm khoảng cách dưới nút
//   },
//   cancelButton: {
//     backgroundColor: COLORS.red,
//     paddingHorizontal: 40, // Tăng chiều ngang để nút dài hơn
//     paddingVertical: 12, // Tăng chiều cao của nút
//     borderRadius: 10,
//     width: "100%", // Đảm bảo nút gần đầy màn hình
//     alignItems: "center", // Căn chỉnh nội dung nút ở giữa
//   },
//   cancelButtonText: {
//     color: COLORS.white,
//     fontFamily: FONTS.bold,
//     fontSize: 16,
//   },
//   dishImageContainer: {
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   dishImageLarge: {
//     width: 150,
//     height: 100,
//     borderRadius: 10,
//     resizeMode: "cover",
//   },
//   feedbackTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: 18,
//     textAlign: "center",
//     marginBottom: 10,
//     color: COLORS.black,
//   },
//   feedbackForm: {
//     borderWidth: 1,
//     borderColor: COLORS.lightGrey, // Use a subtle border color for visibility
//     borderRadius: 10, // Rounded corners
//     padding: 10,
//     backgroundColor: COLORS.white,
//     marginBottom: 15,
//     shadowColor: "#000", // Optional: Add a slight shadow for elevation
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1, // Shadow effect for Android
//   },

//   input: {
//     fontSize: 16,
//     fontFamily: FONTS.medium,
//     color: COLORS.black,
//     minHeight: 60,
//     textAlignVertical: "top",
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginVertical: 15,
//   },
//   buttonGroup: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   submitButton: {
//     flex: 1,
//     backgroundColor: COLORS.green,
//     paddingVertical: 10,
//     marginHorizontal: 5,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   submitButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontFamily: FONTS.bold,
//   },
// });
