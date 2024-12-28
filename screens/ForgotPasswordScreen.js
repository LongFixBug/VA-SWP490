import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import { ButtonFlex } from "../components/Button";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ForgotPasswordScreen = ({ navigation, route }) => {
  const { phone } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Thông báo", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    try {
      console.log("Calling forgotPassword API with:");
      console.log("phoneNumber:", phone);
      console.log("password:", newPassword);

      const forgotPasswordResponse = await axios.put(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/forgotPassword",
        {
          phoneNumber: phone,
          password: newPassword,
        }
      );

      if (forgotPasswordResponse.status === 200) {
        // Call login API after successful password reset
        try {
          console.log("Calling login API with:");
          console.log("phoneNumber:", phone);
          console.log("password:", newPassword);

          const loginResponse = await axios.post(
            "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/login",
            { phoneNumber: phone, password: newPassword }
          );

          const { token, user } = loginResponse.data;
          await AsyncStorage.multiSet([
            ["authToken", token],
            ["userId", String(user.userId)],
            ["username", user.username],
            ["password", newPassword], // Store the new password
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

          Alert.alert("Thành công", "Mật khẩu đã được đặt lại thành công.");
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        } catch (loginError) {
          console.error("Lỗi đăng nhập sau khi đặt lại mật khẩu:", loginError);
          Alert.alert(
            "Lỗi",
            "Đặt lại mật khẩu thành công, nhưng có lỗi khi đăng nhập. Vui lòng thử đăng nhập lại."
          );
          navigation.navigate("Login");
        }
      } else {
        Alert.alert(
          "Lỗi",
          "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi gọi API đặt lại mật khẩu:", error);
      console.log("Dữ liệu gửi đi:", {
        phoneNumber: phone,
        password: newPassword,
      }); // Log dữ liệu chi tiết khi lỗi
      Alert.alert(
        "Lỗi",
        "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.formContainer}>
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        <Text
          style={{
            fontSize: 25,
            color: COLORS.green,
            fontFamily: FONTS.bold,
            marginTop: 15,
          }}
        >
          Đặt lại mật khẩu
        </Text>
        <Text style={{ marginTop: 10, fontFamily: FONTS.medium }}>
          Số điện thoại:{" "}
          <Text style={{ fontWeight: "bold" }}>{"+84" + phone}</Text>
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Mật khẩu mới <Text style={{ color: COLORS.red }}>*</Text>
        </Text>
        <View style={styles.inputRow}>
          <Icon name="key-outline" size={18} color={COLORS.green} />
          <TextInput
            style={styles.textInput}
            secureTextEntry={!passwordVisible}
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Icon
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.green}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Xác nhận mật khẩu mới <Text style={{ color: COLORS.red }}>*</Text>
        </Text>
        <View style={styles.inputRow}>
          <Icon name="key-outline" size={18} color={COLORS.green} />
          <TextInput
            style={styles.textInput}
            secureTextEntry={!confirmPasswordVisible}
            placeholder="Nhập lại mật khẩu mới"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Icon
              name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.green}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ButtonFlex
        title={loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        onPress={handleResetPassword}
        disabled={loading}
        stylesButton={{
          paddingVertical: 15,
          elevation: 3,
          backgroundColor: COLORS.green,
          borderRadius: 10,
        }}
        stylesText={{ fontSize: 14 }}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: 20, alignItems: "center" }}
      >
        <Text style={{ color: COLORS.orange, fontFamily: FONTS.medium }}>
          Quay lại đăng nhập
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

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
});
