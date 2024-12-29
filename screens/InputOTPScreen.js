import React, { useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import COLORS from "../constants/color";
import { TextInput } from "react-native-gesture-handler";
import { ButtonFlex } from "../components/Button";
import FONTS from "../constants/font";
import createAxios from "../utils/axios";
const API = createAxios();
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InputOTPScreen({ navigation, route }) {
  const phone = route.params.phone;
  const otp = route.params.otp;
  const fromScreen = route.params.fromScreen; // Nhận thông tin từ màn hình trước (Register hoặc Login)

  const [noti, setNoti] = React.useState();

  let textInput = useRef(null);
  const lengthInput = 6;
  const [internalVal, setInternalVal] = React.useState("");
  const onChangeText = (value) => {
    setInternalVal(value);
  };

  // Hàm xử lý xác minh OTP
  const handleCheckOTP = async () => {
    if (internalVal.length !== 6) {
      setNoti("Vui lòng nhập đủ 6 ký tự của mã OTP!");
      return;
    }

    if (internalVal.toString() !== otp.toString()) {
      setNoti("OTP không đúng. Vui lòng thử lại!");
      return;
    }

    // Logic khi OTP hợp lệ
    if (fromScreen === "Register") {
      // Điều hướng đến InputProfile nếu từ Register
      navigation.navigate("InputProfile", { phone: phone });
    } else if (fromScreen === "Login") {
      // Gọi API login nếu từ Login
      try {
        const loginResponse = await axios.post(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/login",
          { phoneNumber: phone, password: "dummyPassword" } // Mật khẩu giả
        );

        const { token, user } = loginResponse.data;

        // Lưu thông tin người dùng và token
        await AsyncStorage.multiSet([
          ["authToken", token],
          ["userId", String(user.userId)],
          ["username", user.username],
        ]);

        Alert.alert("Thành công", `Chào mừng ${user.username}!`);
        navigation.navigate("Home");
      } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        Alert.alert("Lỗi", "Đăng nhập thất bại! Vui lòng thử lại.");
      }
    }
  };

  React.useEffect(() => {
    textInput.focus();
  }, []);

  React.useEffect(() => {
    console.log("Phone nè: ", phone);
    console.log("OTP nè: ", otp);
  }, [phone, otp]);

  React.useEffect(() => {
    console.log("TextInternalVal: ", internalVal);
  }, [internalVal]);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 0,
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
            Nhập OTP
          </Text>
        </View>

        <Text
          style={{
            fontFamily: FONTS.semiBold,
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          Nhập mã OTP đã được gửi đến số điện thoại
        </Text>
        <Text
          style={{
            fontFamily: FONTS.bold,
            marginTop: 10,
            marginBottom: 10,
            fontSize: 16,
            letterSpacing: 1,
          }}
        >
          {phone && "+84" + phone}
        </Text>
        <View>
          <TextInput
            ref={(input) => (textInput = input)}
            onChangeText={onChangeText}
            style={{ width: 1, height: 1 }}
            value={internalVal}
            maxLength={lengthInput}
            returnKeyType="done"
            keyboardType="numeric"
            autoFocus={true}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {Array(lengthInput)
              .fill()
              .map((data, index) => (
                <View
                  style={{
                    paddingVertical: 11,
                    width: 40,
                    margin: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    borderBottomWidth: 1.5,
                    borderBottomColor:
                      index === internalVal.length
                        ? COLORS.green
                        : COLORS.black,
                  }}
                  key={index}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      fontFamily: FONTS.semiBold,
                    }}
                    onPress={() => textInput.focus()}
                  >
                    {internalVal && internalVal.length > 0
                      ? internalVal[index]
                      : ""}
                  </Text>
                </View>
              ))}
          </View>
        </View>
        {noti && (
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 12,
              color: COLORS.red,
              marginTop: 15,
            }}
          >
            {noti}
          </Text>
        )}
        <ButtonFlex
          title="Xác nhận"
          onPress={handleCheckOTP}
          stylesButton={{
            borderRadius: 20,
            paddingHorizontal: 30,
            paddingVertical: 10,
            marginBottom: 20,
            elevation: 5,
            marginTop: 15,
            backgroundColor: COLORS.green,
          }}
          stylesText={{ fontSize: 16 }}
        />
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontFamily: FONTS.medium }}>Đã có tài khoản? </Text>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={{ color: COLORS.green, fontFamily: FONTS.bold }}>
              Quay lại đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
