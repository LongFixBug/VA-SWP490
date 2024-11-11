import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";
import { ButtonFlex } from "../components/Button";

const OrderDetailScreen = ({ navigation }) => {
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);

  const orderStatus = {
    pending: { color: COLORS.orange, text: "đang chờ xác nhận" },
    in_progress: { color: COLORS.blue, text: "đang xử lí" },
    delivered: { color: COLORS.diamond, text: "đang giao hàng" },
    completed: { color: COLORS.green, text: "đã giao thành công" },
    cancelled: { color: COLORS.red, text: "đã hủy" },
  };

  useEffect(() => {
    const getOrderFromStorage = async () => {
      try {
        const orderData = await AsyncStorage.getItem("selectedOrder");
        if (orderData) {
          const parsedOrder = JSON.parse(orderData);
          setOrder(parsedOrder);
          fetchOrderDetails(parsedOrder.orderId);
        }
      } catch (error) {
        console.error("Error fetching order from AsyncStorage:", error);
      }
    };

    getOrderFromStorage();
  }, []);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderDetailByOrderId/${orderId}`
      );
      const data = await response.json();

      const dishesWithDetails = await Promise.all(
        data.map(async (detail) => {
          const dishResponse = await fetch(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${detail.dishId}`
          );
          const dish = await dishResponse.json();
          return { ...detail, dish };
        })
      );

      setOrderDetails(dishesWithDetails);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  return (
    <>
      <Header
        title="Chi tiết đơn hàng"
        leftIcon="arrow-back-outline"
        rightIcon="menu"
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white }}
        contentContainerStyle={{ padding: 15, paddingTop: 0 }}
      >
        {order && (
          <View style={styles.orderInfoContainer}>
            <View
              style={{
                backgroundColor: orderStatus[order.status]?.color,
                paddingHorizontal: 10,
                paddingVertical: 10,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}
            >
              <Text style={styles.statusText}>
                {orderStatus[order.status]?.text}
              </Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Thông tin vận chuyển</Text>
              <Text style={styles.infoText}>
                Thời gian đặt: {order.orderDate}
              </Text>
              <Text style={styles.infoText}>
                Địa chỉ: {order.deliveryAddress}
              </Text>
              <Text style={styles.infoText}>
                Phí vận chuyển: {order.deliveryFee}đ
              </Text>
              <Text style={styles.infoText}>
                Tổng tiền: {order.totalPrice}đ
              </Text>
            </View>
          </View>
        )}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <Text style={styles.notesText}>{order?.note || "Không"}</Text>
        </View>
        <View style={styles.discountContainer}>
          <Text style={styles.sectionTitle}>Giảm giá</Text>
          <Text style={styles.discountText}>Thành viên Bạc - 20%</Text>
        </View>
        <View style={styles.paymentContainer}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <Text style={styles.paymentText}>Thanh toán khi nhận hàng</Text>
        </View>
        <View style={styles.dishSection}>
          <Text style={styles.sectionTitle}>Món ăn</Text>
          {orderDetails.map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.listItem}
              key={index}
            >
              <Image
                source={{ uri: item.dish.imageUrl }}
                style={styles.dishImage}
              />
              <View style={styles.dishDetails}>
                <Text style={styles.textNameDish} numberOfLines={1}>
                  {item.dish.name}
                </Text>
                <Text style={styles.textDishType}>{item.dish.dishType}</Text>
                <Text style={styles.textDishPrice}>{item.price}đ</Text>
                <View style={styles.quantityContainer}>
                  <Text style={styles.textQuantity}>
                    Số lượng: x{item.quantity}
                  </Text>
                  <ButtonFlex
                    title="Đánh giá"
                    stylesButton={styles.buttonStyle}
                    stylesText={styles.buttonTextStyle}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ alignItems: "flex-end", padding: 10 }}>
            <Text style={styles.totalText}>
              Tổng tiền:{" "}
              <Text style={styles.totalPrice}>{order?.totalPrice}đ</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  orderInfoContainer: {
    borderWidth: 0.5,
    borderColor: COLORS.darkGrey,
    borderRadius: 10,
    marginBottom: 10,
  },
  statusText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.white,
  },
  infoContent: {
    padding: 10,
  },
  infoTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    marginBottom: 5,
  },
  infoText: {
    fontFamily: FONTS.medium,
    marginBottom: 5,
  },
  notesContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    marginBottom: 10,
  },
  notesText: {
    fontFamily: FONTS.medium,
    color: COLORS.greySolid,
  },
  discountContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  discountText: {
    fontFamily: FONTS.medium,
    color: COLORS.greySolid,
  },
  paymentContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentText: {
    fontFamily: FONTS.medium,
    color: COLORS.greySolid,
  },
  dishSection: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
  },
  listItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 10,
  },
  dishImage: {
    width: 120,
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  },
  dishDetails: {
    flex: 1,
    paddingLeft: 10,
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
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textQuantity: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  buttonStyle: {
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.green,
  },
  buttonTextStyle: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  totalText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  totalPrice: {
    fontFamily: FONTS.bold,
    color: COLORS.green,
  },
});
