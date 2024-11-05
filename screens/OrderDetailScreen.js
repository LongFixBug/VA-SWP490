import {
  StyleSheet,
  View,
  Image,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";
import { Dropdown } from "react-native-element-dropdown";

const dataOrder = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const dataPayment = [
  {
    id: "COD",
    name: "Thanh toán khi nhận hàng",
  },
  {
    id: "QR",
    name: "Thanh toán qua QR code",
  },
];

const dataDiscount = [
  {
    id: 1,
    name: "Thành viên Vàng - giảm 30%",
  },
  {
    id: 2,
    name: "Thành viên Bạc - giảm 15%",
  },
  {
    id: 3,
    name: "Thành viên Kim cương - giảm 40%",
  },
];

const OrderDetailScreen = ({ navigation }) => {
  const [currentPayment, setCurrentPayment] = React.useState("COD");
  const [currentDiscount, setCurrentDiscount] = React.useState(null);

  return (
    <>
      <Header
        title={"Chi tiết đơn hàng"}
        leftIcon={"arrow-back-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: COLORS.white, marginBottom: 120 }}
        contentContainerStyle={{ padding: 10 }}
      >
        <View
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: COLORS.greyPastel,
            borderRadius: 10,
            flexDirection: "row",
          }}
        >
          <Icon
            name="location-sharp"
            size={22}
            color={COLORS.orange}
            style={{ marginHorizontal: 5 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.semiBold, fontSize: 15 }}>
              Nguyễn Hải Long
            </Text>
            <Text style={{ fontFamily: FONTS.medium, marginTop: 3 }}>
              (+84) 838439296
            </Text>
            <Text
              style={{ fontFamily: FONTS.medium, marginTop: 3, lineHeight: 22 }}
            >
              159 Đường Đỗ Xuân Hợp, Phường Phú Hữu, Thành phố Hồ Chí Minh.
            </Text>
          </View>
        </View>
        <View
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: COLORS.greyPastel,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <Text style={{ fontFamily: FONTS.semiBold, fontSize: 15 }}>
            Ghi chú (nếu có)
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              name="create-outline"
              size={22}
              color={COLORS.green}
              style={{ marginRight: 5 }}
            />
            <TextInput
              style={{
                fontFamily: FONTS.medium,
                height: 60,
                flex: 1,
              }}
              placeholder="Nhập ghi chú"
              multiline
              maxLength={150}
              numberOfLines={2}
            />
          </View>
        </View>
        <View
          style={{
            padding: 5,
            borderWidth: 1,
            borderColor: COLORS.greyPastel,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          {dataOrder.map((item, index) => (
            <View style={styles.listItem} key={index}>
              <Image
                source={{
                  uri: "https://statics.vincom.com.vn/xu-huong/0-0-0-0-mon-chay-ngon/image2.png",
                }}
                style={{
                  width: 110,
                  height: "100%",
                  resizeMode: "cover",
                  borderRadius: 8,
                }}
              />
              <View style={{ padding: 5, marginLeft: 5, flex: 1 }}>
                <Text style={styles.textNameDish} numberOfLines={1}>
                  Đậu hũ nhồi nấm
                </Text>
                <Text style={styles.textDishType}>Món khai vị</Text>
                <Text style={styles.textDishPrice}>15.000đ</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignSelf: "flex-end",
                    alignItems: "center",
                    backgroundColor: COLORS.white,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: FONTS.semiBold,
                    }}
                  >
                    x12
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: COLORS.greyPastel,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <Text style={{ fontFamily: FONTS.semiBold, fontSize: 15 }}>
            Giảm giá
          </Text>
          <Dropdown
            style={[styles.dropdown]}
            containerStyle={{ borderRadius: 10 }}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            dropdownPosition={"auto"}
            fontFamily={FONTS.medium}
            autoScroll={false}
            data={dataDiscount}
            maxHeight={300}
            labelField="name"
            valueField="id"
            placeholder={"Chọn mã giảm giá"}
            value={currentDiscount}
            onChange={(item) => {
              setCurrentDiscount(item.id);
            }}
            renderLeftIcon={() => (
              <Icon
                style={styles.icon}
                color={currentDiscount ? COLORS.grey : COLORS.darkGrey}
                name="caret-forward-outline"
                size={20}
              />
            )}
          />
        </View>
        <View
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: COLORS.greyPastel,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <Text style={{ fontFamily: FONTS.semiBold, fontSize: 15 }}>
            Phương thức thanh toán
          </Text>
          {dataPayment.map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.6}
              key={index}
              onPress={() => setCurrentPayment(item.id)}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 10,
                borderWidth: 1,
                borderColor:
                  currentPayment === item.id ? COLORS.green : COLORS.greyPastel,
                borderRadius: 8,
                marginTop: 10,
              }}
            >
              <Text style={{ fontFamily: FONTS.medium }}>{item.name}</Text>
              <Icon
                name={
                  currentPayment === item.id
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={currentPayment === item.id ? COLORS.green : COLORS.grey}
                style={{ marginRight: 5 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.containerButtonFloatBottom}>
        <View
          style={{
            backgroundColor: COLORS.white,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 10,
            paddingHorizontal: 20,
            elevation: 20,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 15,
              color: COLORS.black,
            }}
          >
            Số tiền đã giảm:
          </Text>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 15,
              color: COLORS.green,
            }}
          >
            13.000đ
          </Text>
        </View>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity
            activeOpacity={0.8}
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
              Tổng thanh toán:
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
            onPress={() => navigation.navigate("Payment")}
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
              Thanh toán
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default OrderDetailScreen;

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
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGrey,
  },
  listItem: {
    flex: 1,
    margin: 10,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 10,
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
  dropdown: {
    height: 50,
    borderColor: COLORS.darkGrey,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    marginVertical: 10,
    width: "auto",
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 14,
    color: COLORS.lightGrey,
    fontFamily: FONTS.semiBold,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
