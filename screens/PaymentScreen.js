import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";
import { ButtonFloatBottom } from "../components/Button";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const PaymentScreen = ({ navigation }) => {
  const showButtonConfirmPayment = () =>
    Alert.alert("Xác nhận", "Bạn có chắc đã thanh toán?", [
      {
        text: "Hủy",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          // createOrder();
          navigation.navigate("Đơn hàng");
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View
        style={{
          width: "100%",
          height: "40%",
          height: windowHeight * 0.38,
        }}
      >
        <ImageBackground
          source={{
            uri: "https://img.freepik.com/premium-photo/glowing-green-gradient-background-smooth-gradient-flat-design-high-resolution-high-quality-high_1110519-4518.jpg",
          }}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "cover",
          }}
        >
          <Header
            title={"Mã QR"}
            leftIcon={"arrow-back-outline"}
            rightIcon={"qr-code-outline"}
            colorBackground={"transparent"}
            colorLeftIcon={COLORS.white}
            colorRightIcon={COLORS.white}
            colorText={COLORS.white}
            onPress={() => navigation.goBack()}
            // onPressRight={() => setShowModalInformation(!showModalInformation)}
          />
        </ImageBackground>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          width: "100%",
          alignItems: "center",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: -50,
          paddingHorizontal: 15,
          paddingTop: 15,
        }}
      >
        <View
          style={{
            borderRadius: 20,
            marginTop: -100,
            backgroundColor: COLORS.white,
            paddingVertical: 30,
          }}
        >
          <Image
            source={{
              uri: "https://lead.com.vn/wp-content/uploads/2023/07/QRCODE-VNPAY.jpg",
            }}
            style={{
              width: "100%",
              aspectRatio: 1,
              resizeMode: "contain",
              aspectRatio: 1,
            }}
          />
        </View>
      </View>
      <Text>PaymentScreen</Text>
      <ButtonFloatBottom
        title={"Xác nhận thanh toán"}
        buttonColor={COLORS.green}
        onPress={showButtonConfirmPayment}
      />
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({});
