import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/color'; // Import màu sắc
import FONTS from '../constants/font';  // Import fonts

const OrderDetailScreen = () => {
  const navigation = useNavigation(); // Lấy navigation để quay lại

  // Dữ liệu mẫu cho đơn hàng
  const orderItems = [
    { id: '1', name: 'Gà chay', price: '30.000', quantity: 1 },
    { id: '2', name: 'Bò chay', price: '30.000', quantity: 1 },
  ];

  const discount = 'Giảm 10%';
  const total = 60000;
  const totalAfterDiscount = 30000;

  // Dữ liệu mẫu cho thông tin giao hàng
  const shippingInfo = {
    name: 'Nguyễn Văn A',
    phone: '0123456789',
    address: '123 Đường ABC, Quận XYZ',
    note: 'Giao hàng nhanh nhé!',
    paymentMethod: 'Thanh toán khi nhận hàng'
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề và nút quay lại */}
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
          <Text>Tên: {shippingInfo.name}</Text>
          <Text>SDT: {shippingInfo.phone}</Text>
          <Text>Địa chỉ: {shippingInfo.address}</Text>
          <Text>Ghi chú: {shippingInfo.note}</Text>
        </View>
      </View>

      {/* Phương thức thanh toán */}
      <View style={styles.boxShadow}>
        <View style={styles.paymentMethod}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <Text>{shippingInfo.paymentMethod}</Text>
        </View>
      </View>

      {/* Discount */}
      <View style={styles.boxShadow}>
        <View style={styles.discountInfo}>
          <Text>Discount của tôi: {discount}</Text>
        </View>
      </View>

      {/* Danh sách món ăn */}
      {orderItems.map((item) => (
        <View key={item.id} style={[styles.orderItem, styles.boxShadow]}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }} // Placeholder hình ảnh
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text>{item.name}</Text>
            <Text>{item.price}</Text>
          </View>
          <TouchableOpacity style={styles.feedbackButton}>
            <Text style={styles.feedbackText}>Feedback</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Tổng số tiền */}
      <View style={[styles.totalContainer, styles.boxShadow]}>
        <Text>Tổng tiền: {total.toLocaleString('vi-VN')} vnd</Text>
        <Text>Sau khi dùng Discount: {totalAfterDiscount.toLocaleString('vi-VN')} vnd</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    elevation: 5, // Tạo hiệu ứng mờ cho Android
    marginBottom: 15,
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
});

export default OrderDetailScreen;
