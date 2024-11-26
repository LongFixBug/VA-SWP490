import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
const dataNoti = [
  {
    id: 1,
    title: "Bạn có đơn hàng đang trên đường",
    description:
      "Đơn hàng sắp được giao đến bạn, vui lòng kiểm tra điện thoại thường xuyên",
  },
  {
    id: 2,
    title: "Giao hàng thành công",
    description:
      "Đơn hàng đã giao đến bạn, vui lòng kiểm tra và đánh giá sản phẩm",
  },
  {
    id: 3,
    title: "Xác nhận đã thanh toán",
    description:
      "Thanh toán cho đơn hàng 235F35AV323 thành công. Vui lòng kiểm tra thời gian nhận hàng trong chi tiết đơn hàng.",
  },
  {
    id: 4,
    title: "Bạn có đơn hàng đang trên đường",
    description:
      "Đơn hàng sắp được giao đến bạn, vui lòng kiểm tra điện thoại thường xuyên, Đơn hàng sắp được giao đến bạn, vui lòng kiểm tra điện thoại thường xuyên",
  },
];

function NotificationScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View
            style={{
              marginTop: StatusBar.currentHeight,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.bold,
                fontSize: 25,
                color: COLORS.green,
              }}
            >
              Thông báo
            </Text>
            <Icon name="menu" size={28} color={COLORS.green} />
          </View>
        }
        data={dataNoti}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: "#ddd",
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.greyPastel,
            }}
          >
            <View style={{ marginRight: 15 }}>
              <Icon
                name="notifications-outline"
                size={28}
                color={COLORS.grey}
              />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: 15,
                  color: COLORS.greySolid,
                }}
              >
                {item.title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.medium,
                    width: "85%",
                    marginTop: 5,
                    color: COLORS.grey,
                  }}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
});
