import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import IconAnt from "react-native-vector-icons/AntDesign";

import COLORS from "../constants/color";
import FONTS from "../constants/font";

const dataArticle = [
  {
    id: "1",
    name: "Đậu hũ ki",
    time: "23",
    image:
      "https://cellphones.com.vn/sforum/wp-content/uploads/2023/09/mon-chay-ngon-de-lam-1.jpg",
    latitude: 10.8441,
    longitude: 106.78288,
  },
  {
    id: "2",
    name: "Sườn non",
    time: "70",
    image:
      "https://file.hstatic.net/1000341804/file/canh-chay-ngu-sac_dafc5d8509b64f6c82afc1477065ed66_grande.jpeg",
    latitude: 10.790032685611157,
    longitude: 106.68744825401734,
  },
  {
    id: "3",
    name: "A Mà Kitchen",
    time: "60",
    image:
      "https://cdn.nguyenkimmall.com/images/companies/_1/tin-tuc/kinh-nghiem-meo-hay/n%E1%BA%A5u%20%C4%83n/canh-bong-h%E1%BA%B9-n%E1%BA%A5u-n%E1%BA%A5m.jpg.jpg",
    latitude: 10.7768469439067,
    longitude: 106.69026283867206,
  },
  {
    id: "4",
    name: "King BBQ",
    time: "50",
    image:
      "https://tiki.vn/blog/wp-content/uploads/2023/08/8DLbexQE5KIiDOBbhCUf0Myl39csYt_YRWOInLorMpT-6l-b4bFEwNXhj23bIUfqc9oDSv5f64GuEeMKWtPZIgQe_fm1BeGuTBlZ2GqWo_AMUFNfYo8mFqsVjn7iQe0zzAC_uiAa7dVlxUFLtndk3s.png",
    latitude: 10.847411218830398,
    longitude: 106.7762775617879,
  },
  {
    id: "5",
    name: "Hanuri-Korean Fast Food",
    time: "70",
    image:
      "https://storage.googleapis.com/ops-shopee-files-live/live/shopee-blog/2021/04/mon-kho-chay-2.jpg",
    latitude: 10.775871102987148,
    longitude: 106.68727154052584,
  },

  {
    id: "7",
    name: "Maison Mận-Đỏ",
    time: "75",
    image:
      "https://cdn.nguyenkimmall.com/images/companies/_1/tin-tuc/kinh-nghiem-meo-hay/n%E1%BA%A5u%20%C4%83n/dau-phu-sot-nam-dong-co.jpg",
    latitude: 10.793057450832194,
    longitude: 106.69022156701138,
  },
  {
    id: "8",
    name: "Maison Mận-Đỏ",
    time: "75",
    image:
      "https://cdn.nguyenkimmall.com/images/companies/_1/tin-tuc/kinh-nghiem-meo-hay/n%E1%BA%A5u%20%C4%83n/dau-phu-sot-nam-dong-co.jpg",
    latitude: 10.793057450832194,
    longitude: 106.69022156701138,
  },
];
const dataPictureOfArticle = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));
const ProfileScreen = () => {
  const [expandedDecription, setExpandedDecription] = React.useState({});
  const toggleShowMore = (id) => {
    setExpandedDecription((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  return (
    <>
      <View
        style={{
          marginTop: StatusBar.currentHeight,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          backgroundColor: COLORS.white,
        }}
      >
        <Text
          style={{ fontFamily: FONTS.bold, fontSize: 25, color: COLORS.green }}
        >
          Trang cá nhân
        </Text>
        <Icon name="settings-outline" size={28} color={COLORS.green} />
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white, padding: 10 }}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            source={{
              uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
            }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              marginRight: 10,
            }}
          />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                alignItems: "center",
                width: "30%",
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: 15,
                }}
              >
                123
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  marginTop: 8,
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                Bài đăng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: "center",
                width: "35%",
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: 15,
                }}
              >
                157
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  marginTop: 8,
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                Bài chờ duyệt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: "center", width: "35%" }}>
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: 15,
                }}
              >
                123
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  marginTop: 8,
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                Đang theo dõi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text
          style={{
            fontFamily: FONTS.semiBold,
            marginTop: 10,
            fontSize: 17,
            marginLeft: 5,
          }}
        >
          Nguyễn Hải Long
        </Text>
        <View style={{ marginTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: 5,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                marginVertical: 10,
                fontSize: 17,
              }}
            >
              Bài đăng
            </Text>
            <Icon name="options" size={24} color={COLORS.grey} />
          </View>
          {dataArticle.map((item, index) => (
            <View
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.greyPastel,
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
              key={index}
            >
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={{
                    uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
                  }}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 50,
                    marginRight: 10,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 14,
                    }}
                  >
                    Nguyễn Hải Long
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 12,
                      marginTop: 3,
                      color: COLORS.grey,
                    }}
                  >
                    12:05, 22/10/2024
                  </Text>
                </View>
                <Icon
                  name="ellipsis-horizontal"
                  color={COLORS.greySolid}
                  size={24}
                />
              </View>
              <View style={{ marginTop: 10 }}>
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  Lorem Ipsum is simply dummy text of the heck printing and
                  typesetting industry.
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.medium,
                    fontSize: 13,
                    lineHeight: 22,
                    marginTop: 5,
                  }}
                  numberOfLines={!expandedDecription[item.id] ? 2 : undefined}
                >
                  Simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever
                  since the 1500s, when an unknown printer took a galley of type
                  and scrambled it to make a type specimen book.
                </Text>
                {/* {item.text.length > 100 && ( */}
                <TouchableOpacity onPress={() => toggleShowMore(item.id)}>
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      color: COLORS.grey,
                      marginTop: 5,
                      fontSize: 13,
                    }}
                  >
                    {expandedDecription[item.id] ? "Ẩn bớt" : "Xem thêm"}
                  </Text>
                </TouchableOpacity>
                {/* )} */}
                <ScrollView
                  horizontal
                  contentContainerStyle={{
                    marginTop: 10,
                  }}
                >
                  {dataPictureOfArticle.map((item, index) => (
                    <Image
                      key={index}
                      source={{
                        uri: "https://file.hstatic.net/1000341804/file/canh-chay-ngu-sac_dafc5d8509b64f6c82afc1477065ed66_grande.jpeg",
                      }}
                      style={{
                        width: 200,
                        height: 150,
                        resizeMode: "cover",
                        borderRadius: 8,
                        marginLeft: index === 0 ? 0 : 10,
                      }}
                      onStartShouldSetResponder={() => true}
                      onMoveShouldSetResponder={() => true}
                    />
                  ))}
                </ScrollView>
                <View style={{ flexDirection: "row", marginTop: 10 }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                  >
                    <IconAnt name="like2" size={28} color={COLORS.greySolid} />
                    <Text
                      style={{
                        fontFamily: FONTS.semiBold,
                        fontSize: 16,
                        color: COLORS.greySolid,
                        marginLeft: 5,
                      }}
                    >
                      12
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                  >
                    <Icon
                      name="chatbubble-outline"
                      size={27}
                      color={COLORS.greySolid}
                    />
                    <Text
                      style={{
                        fontFamily: FONTS.semiBold,
                        fontSize: 16,
                        color: COLORS.greySolid,
                        marginLeft: 5,
                      }}
                    >
                      3
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
