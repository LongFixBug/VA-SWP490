import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
} from "react-native";
import React from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import { ButtonFlex } from "../components/Button";
import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";

const RegisterScreen = ({ navigation }) => {
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [noti, setNoti] = React.useState();
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [confirm, setConfirm] = React.useState(null);
  const [code, setCode] = React.useState(""); // Để lưu mã OTP

  // Hàm gửi OTP qua Firebase
  async function signInWithPhoneNumber(phoneNumber) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation); // Lưu đối tượng xác nhận OTP
      console.log("Đã gửi OTP");
      setModalVisible(true); // Mở modal để nhập mã OTP
    } catch (error) {
      console.log("Lỗi khi gửi OTP:", error);
      setNoti("Có lỗi khi gửi OTP. Vui lòng thử lại.");
    }
  }

  // Xác nhận mã OTP
  async function confirmCode() {
    try {
      await confirm.confirm(code); // Xác thực mã OTP
      console.log("Xác nhận thành công");
      setModalVisible(false);
      navigation.navigate("InputProfile"); // Chuyển đến trang hồ sơ sau khi xác nhận thành công
    } catch (error) {
      console.log("Invalid code.");
      Alert.alert("Thông báo", "Mã OTP không đúng.");
    }
  }

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
      {/* <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email (tùy chọn)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="vegetarianassistant@gmail.com"
            placeholderTextColor={COLORS.lightGrey}
            onChangeText={(txtEmail) => setEmail(txtEmail)}
          />
        </View>
      </View> */}
      {noti && (
        <Text
          style={{
            fontFamily: FONTS.medium,
            color: COLORS.red,
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
            ? setNoti("Vui lòng nhập số điện thoại!")
            : phone.length === 9
            ? signInWithPhoneNumber("+84" + phone)
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

      {/* Modal để nhập mã OTP */}
      <Modal visible={isModalVisible}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập mã OTP"
            keyboardType="numeric"
            onChangeText={(txtCode) => setCode(txtCode)}
            value={code}
          />
          <ButtonFlex
            title={"Xác nhận mã OTP"}
            stylesButton={{
              paddingVertical: 15,
              elevation: 3,
              backgroundColor: COLORS.green,
              borderRadius: 10,
            }}
            stylesText={{ fontSize: 14 }}
            onPress={confirmCode} // Xác thực mã OTP
          />
        </View>
      </Modal>
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
});
