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
  Modal,
} from "react-native";
import React from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import { ButtonFlex } from "../components/Button";
import { sendOTP } from "../utils/otpService";

const RegisterScreen = ({ navigation }) => {
  const [phone, setPhone] = React.useState("");

  // const [email, setEmail] = React.useState("");
  const [noti, setNoti] = React.useState();
  const [isModalVisible, setModalVisible] = React.useState(false);

  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");

  const handleSendOTP = async () => {
    let formattedPhone = phone;

    // Tự động thêm số 0 nếu chưa có
    if (phone[0] !== "0") {
      formattedPhone = "0" + phone;
    }

    console.log("Số điện thoại sau khi định dạng:", formattedPhone); // Log số điện thoại sau khi thêm 0

    if (!formattedPhone || formattedPhone.length !== 10) {
      setNoti("Không đúng định dạng!");
      return;
    }

    console.log("Số điện thoại đang xử lý:", formattedPhone); // Log số điện thoại trước khi kiểm tra
    const checkResult = await checkPhoneExisted(formattedPhone);

    // Loại bỏ dấu ngoặc kép khỏi kết quả trả về
    const cleanResult = checkResult.replace(/['"]+/g, ""); // Xóa dấu ngoặc kép

    console.log("Kết quả API trả về sau khi làm sạch:", cleanResult); // Log kết quả sau khi làm sạch

    if (cleanResult === "Phone number already exists") {
      setNoti(
        "Số điện thoại đã tồn tại. Vui lòng nhập số khác, hoặc chuyển sang đăng nhập với số điện thoại này!"
      );
      return;
    } else if (cleanResult === "Phone number does not exist") {
      console.log("Số điện thoại hợp lệ. Gửi OTP."); // Log trạng thái hợp lệ
      const otp = await sendOTP(formattedPhone);
      if (otp) {
        setOtpSent(true);
        navigation.navigate("InputOTP", {
          phone: formattedPhone,
          otp: otp,
          fromScreen: "Login",
        });
      }
    } else {
      setNoti("Có lỗi xảy ra khi kiểm tra số điện thoại!");
    }
  };

  const checkPhoneExisted = async (phone) => {
    let formattedPhone = phone;

    // Tự động thêm số 0 nếu chưa có
    if (phone[0] !== "0") {
      formattedPhone = "0" + phone;
    }

    console.log("Số điện thoại truyền vào API:", formattedPhone); // Log số điện thoại sau khi thêm 0

    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/CheckPhoneExisted/${formattedPhone}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi gọi API");
      }

      const data = await response.text();
      console.log("Kết quả API trả về:", data); // Log kết quả trả về từ API
      return data;
    } catch (error) {
      console.error("Lỗi API:", error); // Log lỗi nếu có
      return null;
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
          ĐĂNG KÝ
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
            onChangeText={(txtPhone) => setPhone(txtPhone)}
          />
        </View>
      </View>

      {noti && (
        <Text
          style={{
            fontFamily: FONTS.medium,
            color: COLORS.red,
            fontFamily: FONTS.semiBold,
            alignSelf: "center",
            marginBottom: 15,
          }}
        >
          {noti}
        </Text>
      )}
      <ButtonFlex
        title={"Xác minh số điện thoại"}
        stylesButton={{
          paddingVertical: 15,
          elevation: 3,
          backgroundColor: COLORS.green,
          borderRadius: 10,
        }}
        stylesText={{ fontSize: 14 }}
        onPress={handleSendOTP}
      />
      <View style={styles.registerContainer}>
        <Text style={{ fontFamily: FONTS.medium }}>Quay lại đăng nhập? </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={{ color: COLORS.green, fontFamily: FONTS.bold }}>
            Đăng nhập
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;

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
