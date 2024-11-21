import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../constants/color";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  // Hàm kiểm tra trạng thái đăng nhập
  const checkLoginStatus = async () => {
    try {
      // Kiểm tra token trong AsyncStorage
      const token = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");

      // Điều hướng dựa trên trạng thái đăng nhập
      if (token && userId) {
        navigation.replace("Home");
      } else {
        navigation.replace("Login");
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      navigation.replace("Login");
    }
  };

  useEffect(() => {
    // Gọi hàm kiểm tra trạng thái khi splash được mount
    setTimeout(checkLoginStatus, 2000); // Hiển thị splash trong 2 giây
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/VegetarianAssistantBackground.png")}
        resizeMode="cover"
        style={styles.backgroundImage}
      />
      <ActivityIndicator
        size="large"
        color={COLORS.green}
        style={styles.loader}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  loader: {
    position: "absolute",
    bottom: 50,
  },
});
