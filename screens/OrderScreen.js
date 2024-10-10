import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import COLORS from '../constants/color'; // Import màu sắc
import FONTS from '../constants/font';  // Import fonts

const OrderScreen = () => {
  const [activeTab, setActiveTab] = useState('Chưa hoàn thành'); // Tab hiện tại

  // Dữ liệu mẫu cho các đơn hàng chưa hoàn thành
  const pendingOrders = [
    { id: '1', name: 'Gà chay, bò tay', status: 'Chờ xác nhận', quantity: 3, total: '888.888vnd' },
    { id: '2', name: 'Gà chay, bò tay', status: 'Đã xác nhận', quantity: 3, total: '888.888vnd' },
    { id: '3', name: 'Gà chay, bò tay', status: 'Đang giao', quantity: 3, total: '888.888vnd' },
  ];

  // Dữ liệu mẫu cho các đơn hàng đã hoàn thành
  const completedOrders = [
    { id: '1', name: 'Tên món ăn', status: 'Đã nhận hàng', quantity: 3, total: '888.888vnd' },
    { id: '2', name: 'Tên món ăn', status: 'Đã hủy', quantity: 3, total: '888.888vnd' },
    { id: '3', name: 'Tên món ăn', status: 'Đã nhận hàng', quantity: 3, total: '888.888vnd' },
  ];

  const handleCancelOrder = (id) => {
    // Xử lý khi nhấn nút hủy đơn hàng
    Alert.alert('Hủy đơn hàng', `Bạn có chắc chắn muốn hủy đơn hàng ${id}?`, [
      { text: 'Không', style: 'cancel' },
      { text: 'Hủy', onPress: () => console.log(`Đơn hàng ${id} đã bị hủy`) },
    ]);
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderInfo}>
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }} // Placeholder hình ảnh
          style={styles.orderImage}
        />
        <View style={styles.orderDetails}>
          <Text style={styles.orderName}>{item.name}</Text>
          <Text style={styles.orderQuantity}>Số lượng: {item.quantity}</Text>
          <Text style={styles.orderTotal}>Tổng số tiền: {item.total}</Text>
        </View>
      </View>
  
      {/* Kiểm tra trạng thái và bo góc cho tất cả */}
      <View style={[
        styles.orderStatus,
        getStatusStyle(item.status), // Áp dụng style màu sắc dựa trên trạng thái
        item.status === 'Đã hủy' && { borderRadius: 5 } // Bo góc cho trạng thái "Đã hủy"
      ]}>
        <Text style={styles.orderStatusText}>{item.status}</Text>
      </View>
  
      {/* Hiển thị nút hủy nếu trạng thái là "Chờ xác nhận" */}
      {item.status === 'Chờ xác nhận' && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelOrder(item.id)}>
          <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return { backgroundColor: COLORS.yellow };
      case 'Đã xác nhận':
        return { backgroundColor: COLORS.green };
      case 'Đang giao':
        return { backgroundColor: COLORS.blue };
      case 'Đã nhận hàng':
        return { backgroundColor: COLORS.green };
      case 'Đã hủy':
        return { backgroundColor: COLORS.red };
      default:
        return { backgroundColor: COLORS.grey };
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs Chưa hoàn thành / Đã hoàn thành */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Chưa hoàn thành' && styles.activeTab]}
          onPress={() => setActiveTab('Chưa hoàn thành')}
        >
          <Text style={styles.tabText}>Chưa hoàn thành</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Đã hoàn thành' && styles.activeTab]}
          onPress={() => setActiveTab('Đã hoàn thành')}
        >
          <Text style={styles.tabText}>Đã hoàn thành</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách đơn hàng */}
      <FlatList
        data={activeTab === 'Chưa hoàn thành' ? pendingOrders : completedOrders} // Thay đổi dữ liệu dựa vào tab đang chọn
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.grey,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: COLORS.green,
  },
  tabText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  orderCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Căn hai phần (image và thông tin) cách xa nhau
  },
  orderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  orderDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  orderName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  orderQuantity: {
    fontSize: 14,
    color: COLORS.grey,
  },
  orderTotal: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.black,
  },
  orderStatus: {
    width: 100, // Đặt chiều rộng cố định
    height: 30, // Đặt chiều cao cố định
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5, // Bo góc cho tất cả các trạng thái, bao gồm "Đã hủy"
    alignSelf: 'flex-end', // Căn sang bên phải
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
    marginTop: -25, // Điều chỉnh vị trí
  },
  orderStatusText: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: FONTS.regular,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: COLORS.red,
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
});


export default OrderScreen;
