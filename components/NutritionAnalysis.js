import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import { generateNutritionAdvice } from "../utils/geminiService";

const NutritionAnalysis = ({ navigation }) => {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          throw new Error("Không tìm thấy User ID.");
        }
        // Fetch user data
        const userResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${userId}`
        );
        if (!userResponse.ok) {
          throw new Error(
            `Failed to fetch user data: ${userResponse.status} ${userResponse.statusText}`
          );
        }
        const userData = await userResponse.json();
        setUserData(userData);
        // Fetch nutrition data
        const nutritionResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionCriterions/getUserNutritionCriteriaDetailByUserId/${userId}`
        );
        if (!nutritionResponse.ok) {
          throw new Error(
            `Failed to fetch nutrition data: ${nutritionResponse.status} ${nutritionResponse.statusText}`
          );
        }
        const nutritionData = await nutritionResponse.json();
        if (nutritionData && nutritionData.length > 0) {
          setNutritionData(nutritionData[0]);
        } else {
          throw new Error("No nutrition data found");
        }
      } catch (error) {
        Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleAnalysis = async () => {
    if (!userData || !nutritionData) {
      Alert.alert(
        "Lỗi",
        "Không có dữ liệu người dùng hoặc dinh dưỡng, vui lòng đăng nhập."
      );
      return;
    }
    setLoading(true);
    try {
      const heightInMeters = userData.height / 100;
      const bmi = userData.weight / (heightInMeters * heightInMeters);

      const combinedData = {
        height: userData.height,
        weight: userData.weight,
        age: userData.age,
        gender: userData.gender,
        goal: userData.goal,
        activityLevel: userData.activityLevel,
        bmi: bmi,
        nutrition: nutritionData,
      };
      const generatedAdvice = await generateNutritionAdvice(combinedData);
      setAdvice(generatedAdvice);
    } catch (error) {
      console.error("Lỗi trong quá trình phân tích:", error);
      setAdvice("Có lỗi xảy ra khi phân tích. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    navigation.navigate("ChatScreen");
  };

  const displayData = () => {
    if (!userData || !nutritionData) return null;

    const nutritionKeys = [
      "calories",
      "fat",
      "carbs",
      "protein",
      "fiber",
      "sugar",
      "cholesterol",
      "sodium",
    ];

    const nutritionDisplay = Object.entries(nutritionData)
      .filter(([key]) => nutritionKeys.includes(key))
      .map(([key, value]) => (
        <Text key={key} style={styles.dataText}>
          {formatKey(key)}: {value}
        </Text>
      ));

    return (
      <View style={styles.dataContainer}>
        <Text style={styles.dataTitle}>Thông tin người dùng:</Text>
        <Text style={styles.dataText}>Tên: {userData.username}</Text>
        <Text style={styles.dataText}>
          Chiều cao: {userData.height}, Cân nặng: {userData.weight}, Tuổi:{" "}
          {userData.age}
        </Text>
        <Text style={styles.dataText}>
          Giới tính: {userData.gender}, Mục tiêu: {userData.goal}, Mức độ hoạt
          động: {userData.activityLevel}
        </Text>
        <Text style={styles.dataTitle}>Dữ liệu dinh dưỡng:</Text>
        {nutritionDisplay}
      </View>
    );
  };

  const formatKey = (key) => {
    const keyMap = {
      calories: "Calo",
      fat: "Chất béo",
      carbs: "Carbohydrate",
      protein: "Protein",
      fiber: "Chất xơ",
      sugar: "Đường",
      cholesterol: "Cholesterol",
      sodium: "Natri",
    };
    return (
      keyMap[key] ||
      key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
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
            <View style={styles.backButton}>
              <Icon name="arrow-back-outline" size={28} color={COLORS.green} />
            </View>
            <Text style={styles.headerText}>Phân tích dinh dưỡng</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.green} />
          </View>
        )}
        {!loading && displayData()}

        {advice && (
          <View style={styles.adviceContainer}>
            <Text style={styles.adviceTitle}>Lời khuyên:</Text>
            <ScrollView style={styles.adviceTextContainer}>
              <Text style={styles.adviceText}>{advice}</Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
      {/* Analysis Button */}
      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleChat}
            style={styles.chatButton}
          >
            <Icon1
              name={"chat-processing-outline"}
              size={30}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAnalysis}
            style={styles.analysisButton}
          >
            <Text style={styles.analysisButtonText}>
              {loading ? "Đang phân tích..." : "Phân tích"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dataContainer: {
    backgroundColor: COLORS.lightGrey,
    padding: 15,
    margin: 20,
    borderRadius: 8,
  },
  dataTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginBottom: 10,
  },
  dataText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.greySolid,
    marginBottom: 5,
    lineHeight: 22,
  },
  adviceContainer: {
    margin: 20,
    marginTop: 20,
  },
  adviceTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginBottom: 10,
  },
  adviceTextContainer: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 10,
  },
  adviceText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.greySolid,
    lineHeight: 22,
  },
  analysisButton: {
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
  analysisButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.white,
  },
  chatButton: {
    width: "30%",
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
});

export default NutritionAnalysis;
