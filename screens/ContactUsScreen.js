import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import * as Linking from "expo-linking";

const ContactUsScreen = ({ navigation }) => {
  const phoneNumber = "+84 975899130";
  const email = "VACONTACT@gmail.com";

  const makeCall = () => {
    const url = `tel:${phoneNumber}`;

    Linking.openURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert(`Không thể gọi số này: ${phoneNumber}`);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const makeEmail = () => {
    const url = `mailto:${email}`;

    Linking.openURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert(`Không thể gửi mail đến: ${email}`);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => Alert.alert(`Thiết bị không hỗ trợ gửi mail !`));
  };

  const makeInstagram = () => {
    const instagramUsername = "100008708886782";
    const url = `https://www.facebook.com/profile.php?id=${instagramUsername}`;

    Linking.openURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Không thể mở Instagram");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) =>
        Alert.alert("Thiết bị không hỗ trợ mở liên kết Instagram")
      );
  };
  return (
    <>
      <Header
        title={"Trung tâm trợ giúp"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"headset-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <Image
            source={require("../assets/VEGETARIANSLOGO1.png")}
            resizeMode="contain"
            style={{ width: 150, height: 160, backgroundColor: COLORS.white }}
          />
          <Text
            style={{
              fontFamily: FONTS.bold,
              fontSize: 22,
              color: COLORS.green,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            Vegetarian Assistant
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: COLORS.black,
              fontFamily: FONTS.medium,
              marginTop: 10,
              flexShrink: 1,
              textAlign: "center",
            }}
          >
            Liên hệ với chúng tôi theo những cách sau nếu bạn cần hỗ trợ !
          </Text>
        </View>
        <View
          style={{
            marginTop: 30,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={makeCall}
            activeOpacity={0.8}
            style={{
              marginBottom: 15,
              alignItems: "center",
              padding: 20,
              backgroundColor: COLORS.white,
              borderRadius: 10,
              elevation: 1,
              flex: 1,
              marginRight: 20,
            }}
          >
            <Icon
              name="call"
              size={32}
              color={COLORS.white}
              style={{
                padding: 10,
                backgroundColor: COLORS.green,
                borderRadius: 10,
              }}
            />
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: 15,
                color: COLORS.black,
                marginTop: 10,
              }}
            >
              {phoneNumber}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={makeEmail}
            activeOpacity={0.8}
            style={{
              marginBottom: 15,
              alignItems: "center",
              padding: 20,
              backgroundColor: COLORS.white,
              borderRadius: 10,
              elevation: 1,
              flex: 1,
            }}
          >
            <Icon
              name="mail"
              size={32}
              color={COLORS.white}
              style={{
                padding: 10,
                backgroundColor: COLORS.green,
                borderRadius: 10,
              }}
            />
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: 15,
                color: COLORS.black,
                marginTop: 10,
              }}
            >
              {email}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={makeInstagram}
          activeOpacity={0.8}
          style={{
            marginBottom: 15,
            alignItems: "center",
            padding: 20,
            backgroundColor: COLORS.white,
            borderRadius: 10,
            elevation: 1,
            marginRight: 20,
            width: "100%",
          }}
        >
          <Icon
            name="logo-facebook"
            size={32}
            color={COLORS.white}
            style={{
              padding: 10,
              backgroundColor: COLORS.green,
              borderRadius: 10,
            }}
          />
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 15,
              color: COLORS.black,
              marginTop: 10,
            }}
          >
            @VegetarianAssistant
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ContactUsScreen;

const styles = StyleSheet.create({});
