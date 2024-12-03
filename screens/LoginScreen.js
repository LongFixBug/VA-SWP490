import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import { ButtonFlex } from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { sendOTP } from "../utils/otpService";

const LoginScreen = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOTPLogin, setIsOTPLogin] = useState(false); // Trạng thái để chuyển đổi giữa OTP và mật khẩu

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/login",
        { phoneNumber: emailOrPhone, password }
      );

      const { token, user } = response.data;
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
      navigation.navigate("Splash");
      // Điều hướng tới màn hình Home và đặt lại ngăn xếp
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
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

  const handleSendOTP = async () => {
    let formattedPhone = emailOrPhone;
    if (emailOrPhone[0] !== "0") {
      formattedPhone = "0" + emailOrPhone;
    }

    if (!formattedPhone || formattedPhone.length !== 10) {
      Alert.alert("Thông báo", "Không đúng định dạng số điện thoại!");
      return;
    }

    try {
      const checkResult = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/CheckPhoneExisted/${formattedPhone}`
      );

      const cleanResult = await checkResult.text();
      if (cleanResult.includes("exists")) {
        const otp = await sendOTP(formattedPhone);
        if (otp) {
          navigation.navigate("InputOTP", {
            phone: formattedPhone,
            otp: otp,
            fromScreen: "Login",
          });
        }
      } else {
        Alert.alert("Thông báo", "Số điện thoại không tồn tại trong hệ thống!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi OTP!");
    }
  };

  const handlePhoneInput = (input) => {
    if (input[0] !== "0") {
      setEmailOrPhone("0" + input); // Thêm số 0 nếu thiếu
    } else {
      setEmailOrPhone(input); // Giữ nguyên nếu đã có số 0
    }
  };

  return (
    <SafeAreaView style={styles.formContainer}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 30,
        }}
      >
        <Image
          source={require("../assets/VEGETARIANSLOGO1.png")}
          resizeMode="contain"
          style={{ width: 120, height: 120, backgroundColor: COLORS.white }}
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
          Số điện thoại <Text style={{ color: COLORS.red }}>*</Text>
        </Text>
        <View style={styles.inputRow}>
          <TouchableOpacity>
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: 14,
                color: COLORS.black,
              }}
            >
              +84 |
            </Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="91 234 56 78"
            inputMode="numeric"
            keyboardType="numeric"
            placeholderTextColor={COLORS.lightGrey}
            onChangeText={handlePhoneInput}
            value={
              emailOrPhone.startsWith("0")
                ? emailOrPhone.slice(1)
                : emailOrPhone
            }
          />
        </View>
      </View>

      {!isOTPLogin && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Mật khẩu <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <Icon name="key" size={18} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              secureTextEntry={!showPassword}
              placeholder="************"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={COLORS.green}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isOTPLogin ? (
        <ButtonFlex
          title="Gửi OTP"
          stylesButton={{
            paddingVertical: 15,
            elevation: 3,
            backgroundColor: COLORS.green,
            borderRadius: 10,
          }}
          stylesText={{ fontSize: 14 }}
          onPress={handleSendOTP}
        />
      ) : (
        <ButtonFlex
          title="Đăng nhập"
          stylesButton={{
            paddingVertical: 15,
            elevation: 3,
            backgroundColor: COLORS.green,
          }}
          stylesText={{ fontSize: 14 }}
          onPress={handleLogin}
        />
      )}

      <TouchableOpacity onPress={() => setIsOTPLogin(!isOTPLogin)}>
        <Text
          style={{
            marginTop: 10,
            color: COLORS.green,
            fontFamily: FONTS.medium,
          }}
        >
          {isOTPLogin ? "Đăng nhập bằng mật khẩu" : "Đăng nhập bằng OTP"}
        </Text>
      </TouchableOpacity>

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
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 30,
    flex: 1,
    justifyContent: "center",
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
});
