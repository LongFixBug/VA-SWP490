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
    const otp = await sendOTP(phone);
    if (otp) {
      setOtpSent(true);
      navigation.navigate("InputOTP", { phone: phone, otp: otp });
    }
    // const otp = "123456";
    // navigation.navigate("InputOTP", { phone: phone, otp: otp });
  };

  // const [confirm, setConfirm] = React.useState(null);
  // const [code, setCode] = React.useState('');

  // function onAuthStateChanged(user) {
  //   if (user) {
  //     // Some Android devices can automatically process the verification code (OTP) message, and the user would NOT need to enter the code.
  //     // Actually, if he/she tries to enter it, he/she will get an error message because the code was already used in the background.
  //     // In this function, make sure you hide the component(s) for entering the code and/or navigate away from this screen.
  //     // It is also recommended to display a message to the user informing him/her that he/she has successfully logged in.
  //     console.log("User: ", user)
  //   }
  // }

  // React.useEffect(() => {
  //   const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
  //   return subscriber;
  // }, []);

  // async function signInWithPhoneNumber(phoneNumber) {
  //   const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
  //   setConfirm(confirmation);
  //   console.log("Đã gửi OTP")
  // }

  // async function confirmCode(code) {
  //   try {
  //     await confirm.confirm(code);
  //   } catch (error) {
  //     console.log('Invalid code.');
  //   }
  // }

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
        onPress={() =>
          !phone
            ? setNoti("Vui lòng nhập số điện thoại! ")
            : phone.length === 9
            ? handleSendOTP()
            : setNoti("Không đúng định dạng!")
        }
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

      {/* <Modal visible={isModalVisible}>
        <OTPVerification
          onVisible={isModalVisible}
          identifier={"+84" + phone}
          onCompletion={(data) => {
            console.log(data); // Get your response of success/failure.
            if (data) {
              const newData = JSON.parse(data);
              if (newData.type === "success") {
                setModalVisible(false);
                navigation.navigate("Register", { phone: phone });
              } else if (newData.type === "error") {
                Alert.alert("Thông báo", "OTP không đúng.");
              } else if (newData.closeByUser) {
                navigation.goBack();
              }
            } else {
              Alert.alert("Thông báo", "Có lỗi xảy ra!");
            }
          }}
          widgetId={"336c6e617452343132343333"} // Get widgetId from MSG91 OTP Widget Configuration
          authToken={"411800TuqEAgy4b5WN657a0b32P1"}
          // Get authToken from MSG91 OTP Tokens
        />
      </Modal> */}
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
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
