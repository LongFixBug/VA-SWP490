import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import { ButtonFlex } from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const LoginScreen = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hàm kiểm tra dữ liệu lưu trong AsyncStorage
  const checkStoredData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      console.log("Stored data:", values);
    } catch (error) {
      console.error("Error checking stored data:", error);
    }
  };

  // Hàm lưu token vào AsyncStorage
  const storeToken = async (token) => {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Failed to save the token", error);
    }
  };

  // Hàm xử lý đăng nhập
  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      // Gọi API login
      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/login",
        {
          phoneNumber: emailOrPhone,
          password,
        }
      );

      const { token, user } = response.data;

      // Xóa dữ liệu AsyncStorage cũ
      await AsyncStorage.clear();

      // Lưu token và toàn bộ dữ liệu user vào AsyncStorage
      await AsyncStorage.multiSet([
        ["authToken", token],
        ["userId", String(user.userId)],
        ["username", user.username],
        ["password", user.password],
        ["phoneNumber", user.phoneNumber],
        ["email", user.email || ""],
        ["address", user.address || ""],
        ["roleId", String(user.roleId)],
        ["status", user.status],
        ["gender", user.gender],
        ["dietaryPreferenceId", String(user.dietaryPreferenceId)],
        ["goal", user.goal || ""],
        ["activityLevel", user.activityLevel || ""],
        ["age", String(user.age)],
        ["imageUrl", user.imageUrl || ""],
        ["height", String(user.height)],
        ["weight", String(user.weight)],
        ["profession", user.profession || ""],
        ["isPhoneVerified", String(user.isPhoneVerified)],
      ]);

      Alert.alert("Thành công", `Chào mừng ${user.username}!`);

      // Điều hướng tới màn hình chính
      navigation.navigate("Splash");

      // Kiểm tra dữ liệu đã lưu
      checkStoredData();
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Lỗi",
        "Đăng nhập thất bại! Vui lòng kiểm tra thông tin hoặc thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <View
          style={{
            height: 200,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 30,
            marginTop: 30,
          }}
        >
          <Image
            source={require("../assets/VEGETARIANSLOGO1.png")}
            resizeMode="contain"
            style={{ width: 150, height: 160, backgroundColor: COLORS.white }}
          />
          <Text
            style={{
              fontSize: 25,
              color: COLORS.green,
              fontFamily: FONTS.bold,
              marginTop: 15,
            }}
          >
            ĐĂNG NHẬP
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Email hoặc số điện thoại{" "}
            <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <Icon name="person" size={18} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập email hoặc số điện thoại"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Mật khẩu <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <Icon name="key" size={18} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              secureTextEntry={!showPassword} // Hiển thị/mở mật khẩu
              placeholder="************"
              value={password}
              onChangeText={setPassword}
            />
            {/* Icon con mắt */}
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)} // Đổi trạng thái hiển thị mật khẩu
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"} // Đổi icon dựa trên trạng thái
                size={20}
                color={COLORS.green}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ButtonFlex
          title={loading ? "Đang đăng nhập..." : "Đăng nhập"}
          stylesButton={{
            paddingVertical: 15,
            elevation: 3,
            backgroundColor: COLORS.green,
          }}
          stylesText={{ fontSize: 14 }}
          onPress={handleLogin}
          disabled={loading}
        />
        <View style={styles.registerContainer}>
          <Text style={{ fontFamily: FONTS.medium }}>Chưa có tài khoản? </Text>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={{ color: COLORS.green, fontFamily: FONTS.bold }}>
              Đăng ký
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 30,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
  },
  textInput: {
    fontFamily: FONTS.medium,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flex: 1,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  orText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.grey,
    alignSelf: "center",
    marginVertical: 25,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    padding: 10,
    width: "100%",
    backgroundColor: COLORS.greyPastel,
    elevation: 3,
    borderRadius: 10,
  },
  googleLogo: {
    height: 30,
    width: 30,
    borderRadius: 50,
    marginRight: 10,
  },
});
