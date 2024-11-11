import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import AsyncStorage from "@react-native-async-storage/async-storage";

const dataTabViewOrder = [
  { id: 0, name: "Tất cả" },
  { id: 1, name: "Chờ xác nhận" },
  { id: 2, name: "Đang xử lí" },
  { id: 3, name: "Đang giao hàng" },
  { id: 4, name: "Đã giao" },
  { id: 5, name: "Đã hủy" },
];

const OrderScreen = ({ navigation }) => {
  const [currentTabViewOrder, setCurrentTabViewOrder] = useState(0);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [userId, setUserId] = useState(null);

  const orderStatus = {
    pending: { color: COLORS.orange, text: "Chờ xác nhận" },
    in_progress: { color: COLORS.blue, text: "Đang xử lí" },
    shipping: { color: COLORS.green, text: "Đang giao hàng" },
    completed: { color: COLORS.green, text: "Đã giao" },
    cancelled: { color: COLORS.red, text: "Đã hủy" },
  };

  useEffect(() => {
    // Get userId from AsyncStorage on component mount
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("User ID from AsyncStorage:", storedUserId);
          fetchOrders(storedUserId); // Pass the userId to fetchOrders function
        } else {
          console.error("User ID is not available in AsyncStorage");
        }
      } catch (error) {
        console.error("Error retrieving userId:", error);
      }
    };
    getUserId();
  }, []);

  const fetchOrders = async (userId) => {
    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching orders:", errorData);
        return;
      }
      const data = await response.json();

      const ordersWithDetails = await Promise.all(
        data.map(async (order) => {
          const orderDetailResponse = await fetch(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderDetailByOrderId/${order.orderId}`
          );
          if (!orderDetailResponse.ok) {
            console.error(
              "Error fetching order details for orderId:",
              order.orderId
            );
            return { ...order, orderDetails: [] }; // Fallback to an empty array if orderDetails cannot be fetched
          }
          const orderDetails = await orderDetailResponse.json();

          const dishesWithDetails = await Promise.all(
            (orderDetails || []).map(async (detail) => {
              const dishResponse = await fetch(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${detail.dishId}`
              );
              if (!dishResponse.ok) {
                console.error(
                  "Error fetching dish details for dishId:",
                  detail.dishId
                );
                return { ...detail, dish: {} }; // Fallback to an empty object if dish details cannot be fetched
              }
              const dish = await dishResponse.json();
              return { ...detail, dish };
            })
          );

          return { ...order, orderDetails: dishesWithDetails };
        })
      );

      setOrders(ordersWithDetails);
      filterOrdersByStatus(currentTabViewOrder, ordersWithDetails);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const saveOrderToStorage = async (order) => {
    try {
      console.log("Order selected:", order); // Log order details
      await AsyncStorage.setItem("selectedOrder", JSON.stringify(order));
    } catch (error) {
      console.error("Error saving order to AsyncStorage:", error);
    }
  };

  const filterOrdersByStatus = (status, allOrders) => {
    if (status === 0) {
      setFilteredOrders(allOrders);
    } else {
      const filtered = allOrders.filter(
        (order) =>
          orderStatus[order.status]?.text === dataTabViewOrder[status].name
      );
      setFilteredOrders(filtered);
    }
  };

  useEffect(() => {
    filterOrdersByStatus(currentTabViewOrder, orders);
  }, [currentTabViewOrder, orders]);

  // Automatically refresh orders when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchOrders(userId);
      }
    }, [userId, currentTabViewOrder])
  );

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerText}>Đơn hàng</Text>
        <Icon name="menu" size={28} color={COLORS.green} />
      </View>
      <View style={{ height: "auto" }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dataTabViewOrder.map((tabView, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentTabViewOrder(tabView.id)}
              style={{
                ...styles.tabView,
                borderBottomColor:
                  currentTabViewOrder === tabView.id
                    ? COLORS.green
                    : COLORS.greyPastel,
              }}
            >
              <Text
                style={{
                  ...styles.tabText,
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
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              saveOrderToStorage(item); // Save the selected order to AsyncStorage
              navigation.navigate("OrderDetail", { orderId: item.orderId }); // Navigate to OrderDetail with orderId
            }}
            style={styles.orderContainer}
          >
            <Image
              source={{ uri: item.orderDetails[0]?.dish.imageUrl }}
              style={styles.orderImage}
            />
            <View style={styles.orderDetails}>
              <Text style={styles.orderName} numberOfLines={1}>
                {item.orderDetails.map((detail) => detail.dish.name).join(", ")}
              </Text>
              <Text style={styles.orderQuantity}>
                Số lượng:{" "}
                {item.orderDetails.reduce(
                  (acc, detail) => acc + detail.quantity,
                  0
                )}
              </Text>
              <Text style={styles.orderTotal}>
                Tổng tiền: {item.totalPrice}đ
              </Text>
              <Text
                style={{
                  ...styles.orderStatus,
                  color: orderStatus[item.status]?.color,
                }}
              >
                {orderStatus[item.status]?.text}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.orderId.toString()}
        style={styles.flatList}
      />
    </>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  header: {
    marginTop: StatusBar.currentHeight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
  },
  headerText: {
    fontFamily: FONTS.bold,
    fontSize: 25,
    color: COLORS.green,
  },
  tabView: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyPastel,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  orderContainer: {
    backgroundColor: COLORS.white,
    padding: 10,
    marginHorizontal: 5,
    marginBottom: 5,
    flexDirection: "row",
    borderWidth: 2,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
  },
  orderImage: {
    height: "auto",
    width: 100,
    borderRadius: 5,
  },
  orderDetails: {
    flex: 1,
    paddingLeft: 15,
    paddingTop: 5,
  },
  orderName: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  orderQuantity: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 5,
  },
  orderTotal: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.green,
    marginTop: 5,
  },
  orderStatus: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  flatList: {
    backgroundColor: COLORS.white,
    paddingTop: 5,
  },
});
