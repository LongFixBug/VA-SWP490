import React, { useRef, useState } from "react";
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
import axios from "axios";

export default function OTPScreen({ navigation, route }) {
  const phone = route.params?.phone;
  const otp = route.params?.otp; // Assuming OTP is passed if available for testing
  const fromScreen = route.params?.fromScreen;

  const [internalVal, setInternalVal] = useState("");
  const [noti, setNoti] = useState("");
  const lengthInput = 6;
  let textInput = useRef(null);

  const onChangeText = (value) => {
    setInternalVal(value);
  };

  const handleVerifyOTP = async () => {
    if (internalVal.length !== lengthInput) {
      setNoti(`Vui lòng nhập đủ ${lengthInput} ký tự của mã OTP!`);
      return;
    }

    // For testing, if OTP is passed as a parameter, compare with that
    const otpToVerify = otp;

    if (otpToVerify && internalVal.toString() !== otpToVerify.toString()) {
      setNoti("OTP không đúng. Vui lòng thử lại!");
      return;
    }

    // Logic for successful OTP verification in "Forgot Password" flow
    if (fromScreen === "ForgotPassword") {
      navigation.navigate("ForgotPasswordScreen", { phone: phone });
    } else {
      // Handle other cases if needed
      Alert.alert("Thành công", "OTP xác thực thành công!");
    }
  };

  React.useEffect(() => {
    if (textInput.current) {
      textInput.current.focus();
    }
  }, []);

  return (
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
          ref={textInput}
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
            .map((_, index) => (
              <View
                style={{
                  paddingVertical: 11,
                  width: 40,
                  margin: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottomWidth: 1.5,
                  borderBottomColor:
                    index === internalVal.length ? COLORS.green : COLORS.black,
                }}
                key={index}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontFamily: FONTS.semiBold,
                  }}
                  onPress={() => textInput.current && textInput.current.focus()}
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
        onPress={handleVerifyOTP}
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
      <TouchableOpacity
        style={{ flexDirection: "row" }}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={{ fontFamily: FONTS.medium }}>Quay lại đăng nhập </Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </SafeAreaView>
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
