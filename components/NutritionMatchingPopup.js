// NutritionMatchingPopup.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

function NutritionMatchingPopup({ isVisible, onClose }) {
  const [nutritionData, setNutritionData] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Khởi tạo giá trị ban đầu là 0
  const translateYAnim = useRef(new Animated.Value(50)).current; // Khởi tạo giá trị ban đầu là 50

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        fetchData();
      });
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {});
    }
  }, [isVisible]);

  // Hàm gọi API với token
  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("Không tìm thấy token.");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  // Hàm gọi API cập nhật tiêu chí
  const updateMatchingCriteria = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("Không tìm thấy User ID.");
      }

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/matchCriteria/${userId}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error(`Lỗi khi cập nhật tiêu chí: ${response.statusText}`);
      }
      console.log("Tiêu chí đã được cập nhật thành công.");
    } catch (error) {
      console.error("Lỗi khi cập nhật tiêu chí:", error.message);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật tiêu chí.");
    }
  };

  // Hàm fetch dữ liệu dinh dưỡng
  const fetchNutritionData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("username"); // Lấy tên từ AsyncStorage
      setUserName(name || ""); // Cập nhật state tên người dùng
      if (!userId) {
        throw new Error("Không tìm thấy User ID.");
      }
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionCriterions/getUserNutritionCriteriaDetailByUserId/${userId}`
      );

      if (!response.ok) {
        throw new Error(
          `Lỗi khi lấy dữ liệu dinh dưỡng: ${response.statusText}`
        );
      }

      const data = await response.json();
      const filteredData = data[0]; // Chỉ lấy object đầu tiên

      // Loại bỏ các field liên quan đến id
      const displayData = Object.fromEntries(
        Object.entries(filteredData).filter(
          ([key]) =>
            !["userNutritionCriteriaId", "userId", "criteriaId"].includes(key)
        )
      );

      setNutritionData(displayData);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin dinh dưỡng:", error.message);
      Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu dinh dưỡng.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await updateMatchingCriteria(); // Gọi API cập nhật tiêu chí
      await fetchNutritionData(); // Gọi API lấy dữ liệu dinh dưỡng
    } catch (error) {
      console.error("Error during initial fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm định dạng lại key (ví dụ: calories -> Calories)
  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1") // Thêm khoảng trắng trước chữ in hoa
      .replace(/^./, (str) => str.toUpperCase()); // Viết hoa chữ cái đầu
  };

  if (!isVisible) return null;

  // Nếu đang load
  if (loading) {
    return (
      <Modal animationType="none" transparent={true} visible={isVisible}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.popupContainer,
            { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
          ]}
        >
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.green} />
          </View>
        </Animated.View>
      </Modal>
    );
  }

  if (!nutritionData) {
    return (
      <Modal animationType="none" transparent={true} visible={isVisible}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.popupContainer,
            { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              Không có thông tin dinh dưỡng phù hợp.
            </Text>
          </View>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal animationType="none" transparent={true} visible={isVisible}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.popupContainer,
          { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
        {/* Khung hiển thị dinh dưỡng */}
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.nutritionBox}>
            <Text style={styles.boxHeader}>
              Dinh dưỡng cần trong ngày dành cho khách hàng{" "}
              {userName ? `${userName}` : ""}
            </Text>
            {Object.entries(nutritionData).map(([key, value]) => (
              <View style={styles.nutritionRow} key={key}>
                <Text style={styles.nutritionKey}>{formatKey(key)}</Text>
                <Text style={styles.nutritionValue}>{value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  popupContainer: {
    position: "absolute",
    top: height * 0.1,
    left: 20,
    backgroundColor: "white",
    width: width - 40,
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex: 2,
    marginTop: -50,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.grey,
    textAlign: "center",
    marginTop: 20,
  },
  nutritionBox: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  boxHeader: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.green,
    textAlign: "center",
    marginBottom: 20,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
  },
  nutritionKey: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.black,
  },
  nutritionValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.green,
  },
});

export default NutritionMatchingPopup;
