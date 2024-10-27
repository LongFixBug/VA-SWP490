import {
  StyleSheet,
  View,
  Image,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
  TextInput,
  Button,
  ScrollView,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Swiper from "react-native-swiper";
import Toast from "react-native-toast-message";

const dishDetail = [
  "https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2023/9/25/an-chay-1-1695615310939250177594.jpg",
  "https://cdn.tgdd.vn/2021/08/CookProduct/Suonnonchaychiensaot-1200x676.jpg",
  "https://cdn.tgdd.vn/Files/2021/08/03/1372828/suon-chay-lam-tu-gi-cac-mon-ngon-lam-tu-suon-chay-202201171310189048.jpg",
  "https://i.ytimg.com/vi/I-GSYy_1oEA/maxresdefault.jpg",
];

const dataFeedbacks = Array.from({ length: 11 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const DetailDishScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [showMoreAttribute, setShowMoreAttribute] = React.useState(false);

  const showToastAddToCart = () => {
    Toast.show({
      type: "success",
      text1: "Thông báo",
      text2: "Thêm vào giỏ hàng thành công !👋",
    });
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          marginTop: StatusBar.currentHeight,
          marginBottom: 80,
        }}
      >
        <View style={styles.top}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                height: 50,
                width: 50,
                marginLeft: 20,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: COLORS.white,
                borderRadius: 10,
                elevation: 0,
              }}
            >
              <Icon name="arrow-back-outline" size={28} color={COLORS.green} />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  color: COLORS.black,
                  marginLeft: 10,
                  fontSize: 20,
                }}
              >
                Chi tiết món ăn
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              activeOpacity={0.8}
              //   onPress={isFavourite ? deleteFavourite : createFavourite}
            >
              <View
                style={{
                  height: 50,
                  width: 50,
                  marginRight: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: COLORS.white,
                  borderRadius: 10,
                  elevation: 0,
                }}
              >
                <Icon name={"heart-outline"} size={30} color={COLORS.green} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Cart")}
            >
              <View
                style={{
                  height: 50,
                  width: 50,
                  marginRight: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: COLORS.white,
                  borderRadius: 10,
                  elevation: 0,
                }}
              >
                <Icon name={"cart-outline"} size={30} color={COLORS.green} />
                <Text style={styles.bagdeCart}>77</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 250 }}>
          <Swiper
            style={styles.wrapper}
            showsButtons={false}
            activeDotColor={COLORS.green}
            dotColor={COLORS.white}
            autoplay={false}
            //   paginationStyle={{}}
          >
            {dishDetail.map((item, index) => (
              <View style={styles.slide} key={index}>
                <Image
                  source={{
                    uri: item,
                  }}
                  style={styles.img}
                  resizeMode="cover"
                />
              </View>
            ))}
          </Swiper>
          <View
            style={{
              elevation: 2,
              position: "absolute",
              right: 10,
              bottom: 50,
              backgroundColor: COLORS.green,
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.bold,
                color: COLORS.white,
                fontSize: 17,
              }}
            >
              125.000đ
            </Text>
          </View>
        </View>
        <View style={{ padding: 15 }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              color: COLORS.black,
              fontSize: 22,
              marginBottom: 5,
            }}
          >
            Đậu hũ nhồi
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                fontFamily: FONTS.medium,
                color: COLORS.grey,
                fontSize: 15,
                marginBottom: 5,
              }}
            >
              Món khai vị
            </Text>
            <Text
              style={{
                fontFamily: FONTS.bold,
                color: COLORS.black,
                fontSize: 13,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.greyPastel,
                paddingBottom: 5,
              }}
            >
              <Icon name="star" size={16} color={COLORS.star} />
              <Icon name="star" size={16} color={COLORS.star} />
              <Icon name="star" size={16} color={COLORS.star} />
              <Icon name="star" size={16} color={COLORS.star} />
              <Icon name="star" size={16} color={COLORS.star} />
            </Text>
          </View>
          <View style={styles.containerAttribute}>
            <Text style={styles.titleAttribute}>Mô tả</Text>
            <Text style={styles.textAttribute}>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry.Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s.
            </Text>
            {showMoreAttribute === false && (
              <TouchableOpacity
                style={{ marginTop: 5 }}
                activeOpacity={0.6}
                onPress={() => setShowMoreAttribute(!showMoreAttribute)}
              >
                <Text
                  style={{ fontFamily: FONTS.semiBold, color: COLORS.blue }}
                >
                  Xem thêm
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {showMoreAttribute && (
            <>
              <View style={styles.containerAttribute}>
                <Text style={styles.textAttribute}>
                  <Text style={styles.titleAttribute}>Nguyên liệu: </Text>Lorem
                  Ipsum is simply dummy text of the printing and typesetting
                  industry.
                </Text>
              </View>
              <View style={styles.containerAttribute}>
                <Text style={styles.titleAttribute}>Công thức</Text>
                <Text style={styles.textAttribute}>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry.
                </Text>
                <TouchableOpacity
                  style={{ marginTop: 5 }}
                  activeOpacity={0.6}
                  onPress={() => setShowMoreAttribute(!showMoreAttribute)}
                >
                  <Text
                    style={{ fontFamily: FONTS.semiBold, color: COLORS.blue }}
                  >
                    Thu gọn
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          <View style={styles.containerAttribute}>
            <Text style={styles.titleAttribute}>Đánh giá (11)</Text>

            {dataFeedbacks.map((item, index) => (
              <View
                key={index}
                style={{ flexDirection: "row", marginTop: 10, marginBottom: 8 }}
              >
                <Image
                  source={{
                    uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
                  }}
                  style={{
                    width: 35,
                    height: 35,
                    resizeMode: "contain",
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: COLORS.green,
                  }}
                />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.medium }}>Nguyễn Long</Text>
                  <View style={{ flexDirection: "row", marginTop: 3 }}>
                    <Icon name="star" size={16} color={COLORS.star} />
                    <Icon name="star" size={16} color={COLORS.star} />
                    <Icon name="star" size={16} color={COLORS.star} />
                    <Icon name="star" size={16} color={COLORS.star} />
                    <Icon name="star" size={16} color={COLORS.star} />
                  </View>
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      marginTop: 3,
                      lineHeight: 20,
                    }}
                  >
                    It is a long established fact that a reader will be
                    distracted by the readable content of a page when looking at
                    its layout. The point of using Lorem Ipsum
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      color: COLORS.grey,
                      marginTop: 5,
                      fontSize: 13,
                    }}
                  >
                    12:40, 19/10/2024
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => showToastAddToCart()}
            style={{
              width: "30%",
              backgroundColor: COLORS.white,
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 10,
              marginVertical: 10,
              borderRadius: 10,
              elevation: 2,
              borderWidth: 1,
              borderColor: COLORS.green,
            }}
          >
            <Icon1 name={"cart-plus"} size={30} color={COLORS.green} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Cart")}
            style={{
              flex: 1,
              backgroundColor: COLORS.green,
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 10,
              borderRadius: 10,
              elevation: 2,
              marginRight: 10,
              borderWidth: 1,
              borderColor: COLORS.green,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: 20,
                color: COLORS.white,
              }}
            >
              Đặt hàng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default DishDetail;

const styles = StyleSheet.create({
  containerButtonFloatBottom: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
  },
  boxButtonFloatBottom: {
    backgroundColor: COLORS.white,
    height: 80,
    flexDirection: "row",
    // justifyContent: "space-between",
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGrey,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    height: 80,
  },
  img: {
    width: "100%",
    height: 300,
    borderRadius: 0,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerAttribute: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 10,
  },
  titleAttribute: {
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    fontSize: 15,
    marginBottom: 3,
  },
  textAttribute: {
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    fontSize: 15,
    lineHeight: 23,
  },
  bagdeCart: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 12,
    width: 23,
    height: 23,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: COLORS.red,
    borderRadius: 150,
    position: "absolute",
    top: 0,
    right: 0,
  },
});
