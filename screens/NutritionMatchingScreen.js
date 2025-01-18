import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";

// NutritionMatchingScreen.js

function NutritionMatchingScreen({ navigation }) {
  const [nutritionData, setNutritionData] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

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
      const name = await AsyncStorage.getItem("username");
      setUserName(name || "");

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
      const filteredData = data[0];

      // Loại bỏ các field liên quan đến id
      const displayData = Object.fromEntries(
        Object.entries(filteredData).filter(
          ([key]) =>
            !["userNutritionCriteriaId", "userId", "criteriaId"].includes(key)
        )
      );

      // Add units to the data
      const dataWithUnits = Object.fromEntries(
        Object.entries(displayData).map(([key, value]) => [
          translateKey(key),
          `${value} ${getUnit(key)}`,
        ])
      );

      setNutritionData(dataWithUnits);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin dinh dưỡng:", error.message);
      Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu dinh dưỡng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await updateMatchingCriteria();
      await fetchNutritionData();
    };
    fetchData();
  }, []);

  // Nếu đang load
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  // Nếu không có dữ liệu
  if (!nutritionData) {
    return (
      <View style={styles.container}>
        <Header
          title={"Thông tin dinh dưỡng"}
          leftIcon={"arrow-back-outline"}
          colorBackground={COLORS.green}
          colorText={COLORS.white}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.noDataText}>
          Không có thông tin dinh dưỡng phù hợp.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title={"Dinh dưỡng đề xuất"}
        leftIcon={"arrow-back-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />

      {/* Khung hiển thị dinh dưỡng */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.nutritionBox}>
          <Text style={styles.boxHeader}>
            Dinh dưỡng cần trong ngày dành cho khách hàng{" "}
            {userName ? `${userName}` : ""}
          </Text>
          {Object.entries(nutritionData).map(([key, value]) => (
            <View style={styles.nutritionRow} key={key}>
              <Text style={styles.nutritionKey}>{key}</Text>
              <Text style={styles.nutritionValue}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Hàm định dạng lại key (ví dụ: calories -> Calories)
const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

// Hàm dịch các key sang tiếng Việt
const translateKey = (key) => {
  switch (key) {
    case "calories":
      return "Lượng calo cần";
    case "protein":
      return "Lượng protein cần";
    case "carbs":
      return "Lượng carbs cần";
    case "fat":
      return "Lượng chất béo cần";
    case "fiber":
      return "Lượng chất xơ cần";
    case "water":
      return "Lượng nước cần";
    case "sodium":
      return "Lượng natri cần";
    case "sugar":
      return "Lượng đường cần";
    case "calcium":
      return "Lượng canxi cần";
    case "iron":
      return "Lượng sắt cần";
    case "magnesium":
      return "Lượng magie cần";
    case "omega3":
      return "Lượng omage 3 cần";
    case "sugars":
      return "Lượng đường cần";
    case "cholesterol":
      return "Lượng cholesterol cần";
    case "vitaminA":
      return "Lượng Vitamin A cần";
    case "vitaminB":
      return "Lượng Vitamin B cần";
    case "vitaminC":
      return "Lượng Vitamin C cần";
    case "vitaminD":
      return "Lượng Vitamin D cần";
    case "vitaminE":
      return "Lượng Vitamin E cần";
    default:
      return formatKey(key);
  }
};

const getUnit = (key) => {
  switch (key) {
    case "calories":
      return "kcal";
    case "protein":
    case "carbs":
    case "fat":
    case "fiber":
    case "water":
    case "sugars":
      return "g";
    case "sodium":
    case "calcium":
    case "iron":
    case "magnesium":
    case "cholesterol":
    case "omega3":
      return "mg";
    case "vitaminA":
      return "mcg";
    case "vitaminB":
    case "vitaminC":
    case "vitaminD":
    case "vitaminE":
      return "mg";
    default:
      return "";
  }
};

export default NutritionMatchingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  noDataText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.grey,
    textAlign: "center",
    marginTop: 20,
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
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
