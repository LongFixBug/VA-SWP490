import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";

const dataMenu = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const dataDishOfMenu = Array.from({ length: 11 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const MenuScreen = ({ navigation }) => {
  return (
    <>
      <Header
        title={"Menu"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"menu"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white }}
        contentContainerStyle={{ padding: 10 }}
      >
        {dataMenu.map((item, index) => (
          <TouchableOpacity
            activeOpacity={0.9}
            key={index}
            onPress={() => navigation.navigate("DetailMenu")}
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: COLORS.greyPastel,
              borderRadius: 8,
              backgroundColor: COLORS.white,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: FONTS.semiBold, fontSize: 15 }}>
                Menu {item.id}
              </Text>
              <Icon name="heart-outline" size={30} color={COLORS.lightGrey} />
            </View>
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: 13,
                color: COLORS.grey,
                marginVertical: 3,
              }}
            >
              935 kcal
            </Text>
            <ScrollView
              horizontal
              contentContainerStyle={{
                marginTop: 5,
              }}
            >
              {dataDishOfMenu.map((item, index) => (
                <Image
                  key={index}
                  source={{
                    uri: "https://file.hstatic.net/1000341804/file/canh-chay-ngu-sac_dafc5d8509b64f6c82afc1477065ed66_grande.jpeg",
                  }}
                  style={{
                    width: 70,
                    height: 60,
                    resizeMode: "cover",
                    borderRadius: 8,
                    marginLeft: index === 0 ? 0 : 10,
                  }}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                />
              ))}
            </ScrollView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

export default MenuScreen;

const styles = StyleSheet.create({});
