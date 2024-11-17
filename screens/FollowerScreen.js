import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import { ButtonFlex } from "../components/Button";

const dataTabView = [
  {
    id: 1,
    name: "Người theo dõi",
  },
  {
    id: 2,
    name: "Đang theo dõi",
  },
];

const dataFollower = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const dataFollowing = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const FollowerScreen = ({ navigation }) => {
  const [currentTabView, setCurrentTabView] = React.useState(1);

  return (
    <>
      <Header
        title={"Theo dõi"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"people-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <Image
          source={{
            uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
          }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 100,
            borderWidth: 5,
            borderColor: COLORS.white,
            alignSelf: "center",
          }}
        />
        <Text
          style={{
            fontFamily: FONTS.semiBold,
            fontSize: 17,
            alignSelf: "center",
            marginTop: 10,
          }}
        >
          Nguyễn Hải Long
        </Text>
        <View
          style={{
            flexDirection: "row",
            marginTop: 10,
            backgroundColor: COLORS.white,
            borderRadius: 10,
            elevation: 2,
            marginBottom: 15,
            marginHorizontal: 20,
          }}
        >
          {dataTabView.map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.8}
              key={index}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 15,
              }}
              onPress={() => setCurrentTabView(item.id)}
            >
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                  fontSize: 16,
                  color:
                    currentTabView === item.id ? COLORS.green : COLORS.black,
                  marginBottom: 3,
                }}
              >
                165
                {/* lấy list theo dõi hoặc đang theo dõi .length vào */}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  fontSize: 15,
                  color:
                    currentTabView === item.id ? COLORS.green : COLORS.black,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {currentTabView === 1 && (
          <View
            style={{
              paddingHorizontal: 20,
              marginHorizontal: 20,
              backgroundColor: COLORS.white,
              elevation: 1,
              borderRadius: 10,
              marginBottom: 20,
              paddingTop: 20,
            }}
          >
            {dataFollower.map((item, index) => (
              <TouchableOpacity
                activeOpacity={0.8}
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{
                      uri: "https://lifehacker.com/imagery/articles/01HF2GKNRQZ4MN1YA639Q53NQV/hero-image.fill.size_1248x702.v1699833590.png",
                    }}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 100,
                      resizeMode: "cover",
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 15,
                      color: COLORS.black,
                      marginLeft: 10,
                    }}
                  >
                    Long Nguyễn
                  </Text>
                </View>
                <View style={{ minWidth: 90 }}>
                  {/* item.id % 2 === 0 là minh họa, Tương tự với thuộc tính theo dõi hoặc không theo dõi */}
                  {item.id % 2 === 0 ? (
                    <ButtonFlex
                      title={"Theo dõi"}
                      stylesButton={{
                        elevation: 3,
                        backgroundColor: COLORS.green,
                        borderRadius: 5,
                        elevation: 1,
                        alignSelf: "stretch",
                      }}
                      stylesText={{ fontSize: 13, fontFamily: FONTS.medium }}
                      //   onPress={()=>{}}
                    />
                  ) : (
                    <ButtonFlex
                      title={"Hủy"}
                      stylesButton={{
                        elevation: 3,
                        backgroundColor: COLORS.orange,
                        borderRadius: 5,
                        elevation: 1,
                        alignSelf: "stretch",
                      }}
                      stylesText={{ fontSize: 13, fontFamily: FONTS.medium }}
                      //   onPress={()=>{}}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {currentTabView === 2 && (
          <View
            style={{
              paddingHorizontal: 20,
              marginHorizontal: 20,
              backgroundColor: COLORS.white,
              elevation: 1,
              borderRadius: 10,
              marginBottom: 20,
              paddingTop: 20,
            }}
          >
            {dataFollowing.map((item, index) => (
              <TouchableOpacity
                activeOpacity={0.8}
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Image
                    source={{
                      uri: "https://www.enewsletterhome.com/_eNewsletter/2020/2007_J_avatar.jpg?",
                    }}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 100,
                      resizeMode: "cover",
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 15,
                      color: COLORS.black,
                      marginLeft: 10,
                      flexShrink: 1,
                    }}
                  >
                    Sea Dragon Nguyen
                  </Text>
                </View>
                <ButtonFlex
                  title={"Hủy"}
                  stylesButton={{
                    elevation: 3,
                    backgroundColor: COLORS.orange,
                    borderRadius: 5,
                    elevation: 1,
                  }}
                  stylesText={{ fontSize: 13, fontFamily: FONTS.medium }}
                  //   onPress={()=>{}}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default FollowerScreen;

const styles = StyleSheet.create({});
