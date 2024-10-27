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
  FlatList,
  Pressable,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";

const dataCart = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const CartScreen = ({ navigation }) => {
  return (
    <>
      <Header
        title={"Giỏ hàng"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"menu"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
        // onPressRight={() => setShowModalInformation(!showModalInformation)}
      />
      <FlatList
        data={dataCart}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            //   onPress={()=> navigation.navigate("")}
            style={styles.listItem}
          >
            <Image
              source={{
                uri: "https://statics.vincom.com.vn/xu-huong/0-0-0-0-mon-chay-ngon/image2.png",
              }}
              style={{
                width: 110,
                height: "100%",
                resizeMode: "cover",
              }}
            />
            <View style={{ padding: 5, marginLeft: 5, flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.textNameDish} numberOfLines={1}>
                  Đậu hũ nhồi nấm
                </Text>
                <Icon name="trash-outline" size={22} color={COLORS.red} />
              </View>
              <Text style={styles.textDishType}>Món khai vị</Text>
              <Text style={styles.textDishPrice}>15.000đ</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignSelf: "flex-end",
                  alignItems: "center",
                  backgroundColor: COLORS.white,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: COLORS.darkGrey,
                }}
              >
                <TouchableOpacity
                  style={{
                    fontSize: 16,
                    fontFamily: FONTS.semiBold,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: FONTS.semiBold,
                      color: COLORS.green,
                    }}
                  >
                    -
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontFamily: FONTS.semiBold,
                    width: 50,
                    borderLeftWidth: 1,
                    borderRightWidth: 1,
                    borderColor: COLORS.darkGrey,
                  }}
                >
                  12
                </Text>
                <TouchableOpacity style={{ paddingHorizontal: 10 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: FONTS.semiBold,
                      color: COLORS.green,
                    }}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        style={{ backgroundColor: COLORS.white, marginBottom: 77 }}
      />
      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity
            activeOpacity={0.8}
            // onPress={() => showToastAddToCart()}
            style={{
              width: "40%",
              backgroundColor: COLORS.white,
              alignItems: "flex-end",
              justifyContent: "center",
              marginHorizontal: 20,
              marginVertical: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "transparent",
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: 16,
                color: COLORS.black,
              }}
            >
              Tổng số tiền:
            </Text>
            <Text
              style={{
                fontFamily: FONTS.bold,
                fontSize: 18,
                color: COLORS.green,
              }}
            >
              247.990đ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Checkout")}
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
                fontSize: 18,
                color: COLORS.white,
              }}
            >
              Tiếp tục
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default CartScreen;

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
  listItem: {
    flex: 1,
    margin: 10,
    marginHorizontal: 15,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 5,
  },
  textNameDish: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishType: {
    color: COLORS.grey,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishPrice: {
    color: COLORS.green,
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
});
