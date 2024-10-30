import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../constants/color'; 
import FONTS from '../constants/font'; 

const OrderDetailScreen = () => {
  const navigation = useNavigation(); 
  const route = useRoute();
  const order = route.params?.order;

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy thông tin đơn hàng!</Text>
      </View>
    );
  }

  const total = order.total_price;
  const totalAfterDiscount = total - (order.discount ? order.discount.discount_amount : 0);

  const handleFeedback = (dishId) => {
    navigation.navigate('FeedbackScreen', { dishId });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollViewContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        </View>

        {/* Thông tin giao hàng */}
        <View style={styles.boxShadow}>
          <View style={styles.shippingInfo}>
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
            <Text>Địa chỉ: {order.delivery_address}</Text>
            <Text>Ngày đặt: {order.order_date}</Text>
            <Text>Ghi chú: {order.note}</Text>
          </View>
        </View>

        {/* Phương thức thanh toán */}
        <View style={styles.boxShadow}>
          <View style={styles.paymentMethod}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <Text>{order.payment_method}</Text>
          </View>
        </View>

        {/* Discount */}
        <View style={styles.boxShadow}>
          <View style={styles.discountInfo}>
            <Text>Discount: {order.discount ? order.discount.discount_name : 'Không có'}</Text>
          </View>
        </View>

        {/* Danh sách món ăn */}
        {order.order_items.map((item) => (
          <View key={item.dish_id} style={[styles.orderItem, styles.boxShadow]}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text>{item.name}</Text>
              <Text>{item.price.toLocaleString('vi-VN')} VND</Text>
              <Text>Số lượng: {item.quantity}</Text>
            </View>
            {order.status === 'delivered' && !item.feedback_given && (
              <TouchableOpacity style={styles.feedbackButton} onPress={() => handleFeedback(item.dish_id)}>
                <Text style={styles.feedbackText}>Feedback</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Phần tổng tiền luôn cố định dưới */}
      <View style={styles.fixedBottom}>
        <View style={styles.totalContainer}>
          <Text>Tổng tiền: {total.toLocaleString('vi-VN')} VND</Text>
          <Text>Sau khi dùng Discount: {totalAfterDiscount.toLocaleString('vi-VN')} VND</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'space-between',  // Đặt phần tổng tiền ở dưới cùng
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
  },
  boxShadow: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
    padding: 20,
  },
  shippingInfo: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
  },
  paymentMethod: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginBottom: 5,
  },
  discountInfo: {
    backgroundColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 10,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  feedbackButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  feedbackText: {
    color: COLORS.white,
    fontFamily: FONTS.regular,
  },
  totalContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 10,
  },
  fixedBottom: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
});

export default OrderDetailScreen;
