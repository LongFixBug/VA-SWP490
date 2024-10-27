import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const memberTier = [
  {
    id: "COOPER",
    name: "ĐỒNG",
    color: COLORS.cooper,
    point: "0",
    description: "Thành viên mặc định",
  },
  {
    id: "SILVER",
    name: "BẠC",
    color: COLORS.silver,
    point: "1000",
    description: "Giảm giá cho đơn hàng 10%",
  },
  {
    id: "GOLD",
    name: "VÀNG",
    color: COLORS.gold,
    point: "2000",
    description: "Giảm giá cho đơn hàng 20%",
  },
  {
    id: "DIAMOND",
    name: "KIM CƯƠNG",
    color: COLORS.diamond,
    point: "3000",
    description: "Giảm giá cho đơn hàng 30%",
  },
];

const MembershipScreen = ({ navigation }) => {
  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View
          style={{
            width: "100%",
            // height: "40%",
            height: "auto",
          }}
        >
          <ImageBackground
            source={{
              uri: "https://img.freepik.com/premium-photo/glowing-green-gradient-background-smooth-gradient-flat-design-high-resolution-high-quality-high_1110519-4518.jpg",
            }}
            style={{
              width: "100%",
              height: "auto",
              resizeMode: "cover",
            }}
          >
            <Header
              title={"Thành viên"}
              leftIcon={"arrow-back-outline"}
              rightIcon={"people"}
              colorBackground={"transparent"}
              colorLeftIcon={COLORS.white}
              colorRightIcon={COLORS.white}
              colorText={COLORS.white}
              onPress={() => navigation.goBack()}
              // onPressRight={() => setShowModalInformation(!showModalInformation)}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.white,
                elevation: 10,
                marginBottom: 70,
                marginHorizontal: 20,
                borderRadius: 10,
                padding: 20,
                justifyContent: "space-between",
                paddingRight: 20,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    fontSize: 20,
                    color: COLORS.black,
                  }}
                >
                  Nguyễn Hải Long
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    fontSize: 15,
                    color: COLORS.greySolid,
                    marginTop: 10,
                  }}
                >
                  1215 điểm
                </Text>
              </View>
              <View
                style={{
                  alignItems: "center",
                  width: "30%",
                  backgroundColor: COLORS.white,
                }}
              >
                <Image
                  source={{
                    uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
                  }}
                  style={{
                    height: 70,
                    width: 70,
                    borderRadius: 50,
                  }}
                />
                <Icon
                  name="ribbon"
                  size={30}
                  color={COLORS.diamond}
                  style={{
                    marginTop: -20,
                    paddingHorizontal: 5,
                    paddingVertical: 8,
                    backgroundColor: COLORS.white,
                    borderRadius: 50,
                    textAlign: "center",
                  }}
                />
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    fontSize: 15,
                    color: COLORS.greySolid,
                    marginTop: 5,
                  }}
                >
                  KIM CƯƠNG
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginTop: -50,
            paddingHorizontal: 25,
            paddingTop: 15,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.bold,
              fontSize: 20,
              color: COLORS.greySolid,
              marginTop: 10,
            }}
          >
            CẤP BẬC
          </Text>
          {memberTier.map((item, index) => (
            <View
              style={{
                marginTop: 15,
                flexDirection: "row",
                paddingVertical: 15,
                backgroundColor: COLORS.white,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.greyPastel,
                borderRadius: 0,
              }}
              key={item.id}
            >
              <View
                style={{
                  alignItems: "center",
                  width: "35%",
                  backgroundColor: COLORS.white,
                }}
              >
                <Icon name="ribbon" size={40} color={item.color} style={{}} />
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    fontSize: 13,
                    color: COLORS.greySolid,
                    marginTop: 10,
                  }}
                >
                  {item.name}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    fontSize: 15,
                    color: COLORS.greySolid,
                    marginTop: 10,
                  }}
                >
                  {item.point} điểm
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.medium,
                    fontSize: 13,
                    color: COLORS.greySolid,
                    marginTop: 5,
                  }}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default MembershipScreen;

const styles = StyleSheet.create({});
