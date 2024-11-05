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
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";

const dataTabViewOrder = [
  {
    id: 0,
    name: "Tất cả",
  },
  {
    id: 1,
    name: "Chờ xác nhận",
  },
  {
    id: 2,
    name: "Đang xử lí",
  },
  {
    id: 3,
    name: "Đang giao hàng",
  },
  {
    id: 4,
    name: "Đã giao",
  },
  {
    id: 5,
    name: "Đã hủy",
  },
];

const favouriteList = [
  {
    id: "1",
    name: "Đậu hũ, sườn non, canh măng, đậu ve ",
    time: "23",
    image:
      "https://cellphones.com.vn/sforum/wp-content/uploads/2023/09/mon-chay-ngon-de-lam-1.jpg",
    status: "pending",
  },
  {
    id: "2",
    name: "Sườn non",
    time: "70",
    image:
      "https://file.hstatic.net/1000341804/file/canh-chay-ngu-sac_dafc5d8509b64f6c82afc1477065ed66_grande.jpeg",
    status: "cancelled",
  },
  {
    id: "3",
    name: "Canh măng",
    time: "60",
    image:
      "https://cdn.nguyenkimmall.com/images/companies/_1/tin-tuc/kinh-nghiem-meo-hay/n%E1%BA%A5u%20%C4%83n/canh-bong-h%E1%BA%B9-n%E1%BA%A5u-n%E1%BA%A5m.jpg.jpg",
    status: "completed",
  },
];

const OrderScreen = ({ navigation }) => {
  const [currentTabViewOrder, setCurrentTabViewOrder] = React.useState(0);

  const orderStatus = {
    pending: { color: COLORS.orange, text: "Chờ xác nhận" },
    in_progress: { color: COLORS.blue, text: "Đang xử lí" },
    delivered: { color: COLORS.green, text: "Đang giao hàng" },
    completed: { color: COLORS.green, text: "Đã giao" },
    cancelled: { color: COLORS.red, text: "Đã hủy" },
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
          Đơn hàng
        </Text>
        <Icon name="menu" size={28} color={COLORS.green} />
      </View>
      <View style={{ height: "auto" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{}}
        >
          {dataTabViewOrder.map((tabView, index) => (
            <TouchableOpacity
              activeOpacity={0.8}
              key={index}
              onPress={() => setCurrentTabViewOrder(tabView.id)}
              style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderBottomWidth: 3,
                borderBottomColor:
                  currentTabViewOrder === tabView.id
                    ? COLORS.green
                    : COLORS.greyPastel,
                backgroundColor: COLORS.white,
                borderTopWidth: 1,
                borderTopColor: COLORS.greyPastel,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  fontSize: 16,
                  color:
                    currentTabViewOrder === tabView.id
                      ? COLORS.green
                      : COLORS.black,
                }}
              >
                {tabView.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {currentTabViewOrder === 0 && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={favouriteList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("OrderDetails");
              }}
              activeOpacity={0.8}
              key={index}
              style={{
                backgroundColor: COLORS.white,
                padding: 10,
                marginHorizontal: 5,
                marginBottom: 5,
                flexDirection: "row",
                borderWidth: 2,
                borderColor: COLORS.greyPastel,
                borderRadius: 10,
              }}
            >
              <Image
                source={{ uri: item.image }}
                style={{ height: "auto", width: 100, borderRadius: 5 }}
              />
              <View
                style={{
                  flex: 1,
                  padding: 0,
                  paddingLeft: 15,
                  paddingTop: 5,
                }}
              >
                <Text
                  style={{ fontFamily: FONTS.semiBold, fontSize: 15 }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    fontSize: 12,
                    color: COLORS.grey,
                    marginTop: 5,
                  }}
                >
                  Số lượng: 3
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    alignSelf: "flex-start",
                    fontSize: 13,
                    color: COLORS.green,
                    marginTop: 5,
                  }}
                >
                  Tổng tiền: 159.000đ
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    alignSelf: "flex-end",
                    fontSize: 13,
                    marginTop: 10,
                    color: orderStatus[item.status].color,
                  }}
                >
                  {orderStatus[item.status].text}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          style={{ backgroundColor: COLORS.white, paddingTop: 5 }}
        />
      )}
    </>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({});
