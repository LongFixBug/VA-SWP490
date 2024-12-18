import {
  StyleSheet,
  View,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";

const DetailMenuScreen = ({ navigation, route }) => {
  // Lấy dữ liệu menu từ route.params
  const { menu } = route.params;

  // Bảng màu viền theo loại món ăn
  const dishTypeColors = {
    "Khai vị": COLORS.orange,
    "Món chính": COLORS.green,
    "Đồ uống": COLORS.blue,
    "Tráng miệng": COLORS.purple,
    Canh: COLORS.red,
    default: COLORS.grey,
  };

  return (
    <>
      <Header
        title={"Chi Tiết Menu"}
        leftIcon={"arrow-back-outline"}
        // rightIcon={"heart-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white, padding: 10 }}
      >
        {/* <Text style={styles.menuTitle}>Chi tiết các món ăn</Text> */}

        {/* Duyệt qua từng món trong menu */}
        {menu?.menuItems?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dishCard,
              {
                borderColor:
                  dishTypeColors[item.dish?.dishType] || dishTypeColors.default,
              },
            ]}
            onPress={() =>
              navigation.navigate("DishDetail", { dishId: item.dish?.dishId })
            }
          >
            <Image
              source={{
                uri: item.dish?.imageUrl || "https://via.placeholder.com/100",
              }}
              style={styles.dishImage}
            />
            <View style={styles.dishInfo}>
              <Text style={styles.dishName} numberOfLines={1}>
                {item.dish?.name || "Không rõ tên món"}
              </Text>
              <Text style={styles.dishDetail} numberOfLines={1}>
                Loại món: {item.dish?.dishType || "Không xác định"}
              </Text>
              <Text style={styles.dishDetail}>
                Calories: {item.calories || 0} kcal
              </Text>
              <Text style={styles.dishDescription} numberOfLines={2}>
                Mô tả: {item.dish?.description || "Không có mô tả"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

export default DetailMenuScreen;

const styles = StyleSheet.create({
  menuTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 10,
    textAlign: "center",
  },
  dishCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 2, // Viền được áp dụng màu tại đây
    height: 120, // Đặt chiều cao cố định để các item đồng đều
  },
  dishImage: {
    width: 100,
    height: "100%",
    borderRadius: 8,
    marginRight: 10,
  },
  dishInfo: {
    flex: 1,
    justifyContent: "center",
  },
  dishName: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 3,
  },
  dishDetail: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 3,
  },
  dishDescription: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.grey,
  },
});
