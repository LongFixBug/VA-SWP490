import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import COLORS from '../constants/color';
import FONTS from '../constants/font';
import { useNavigation } from '@react-navigation/native'; 

const OrderScreen = () => {
  const navigation = useNavigation(); 

  const [activeTab, setActiveTab] = useState('Chưa hoàn thành');

  const pendingOrders = [
    { id: '1', name: 'Gà chay, bò tay', status: 'Chờ xác nhận', quantity: 3, total: '888.888vnd' },
    { id: '2', name: 'Gà chay, bò tay', status: 'Đã xác nhận', quantity: 3, total: '888.888vnd' },
    { id: '3', name: 'Gà chay, bò tay', status: 'Đang giao', quantity: 3, total: '888.888vnd' },
  ];

  const completedOrders = [
    { id: '1', name: 'Gà chay, bò tay', status: 'Đã nhận hàng', quantity: 3, total: '888.888vnd' },
    { id: '2', name: 'Tên món ăn', status: 'Đã hủy', quantity: 3, total: '888.888vnd' },
    { id: '3', name: 'Tên món ăn', status: 'Đã nhận hàng', quantity: 3, total: '888.888vnd' },
  ];

  const handleOrderDetails = (orderId) => {
    navigation.navigate('OrderDetails', { orderId }); 
  };

  const handleCancelOrder = (id) => {
    Alert.alert('Hủy đơn hàng', `Bạn có chắc chắn muốn hủy đơn hàng ${id}?`, [
      { text: 'Không', style: 'cancel' },
      { text: 'Hủy', onPress: () => console.log(`Đơn hàng ${id} đã bị hủy`) },
    ]);
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity onPress={() => handleOrderDetails(item.id)}>
      <View style={styles.orderCard}>
        <View style={styles.orderInfo}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }} 
            style={styles.orderImage}
          />
          <View style={styles.orderDetails}>
            <Text style={styles.orderName}>{item.name}</Text>
            <Text style={styles.orderQuantity}>Số lượng: {item.quantity}</Text>
            <Text style={styles.orderTotal}>Tổng số tiền: {item.total}</Text>
          </View>
        </View>

        <View
          style={[
            styles.orderStatus,
            getStatusStyle(item.status),
           
          ]}
        >
          <Text style={styles.orderStatusText}>{item.status}</Text>
        </View>

        {item.status === 'Chờ xác nhận' && (

          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelOrder(item.id)}>
            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
          </TouchableOpacity>         
        )}
      </View>
    </TouchableOpacity>
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

      <FlatList
        data={activeTab === 'Chưa hoàn thành' ? pendingOrders : completedOrders}
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
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Tạo hiệu ứng mờ cho Android
    marginBottom: 15,
    padding:10,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
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
    width: 100,
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  orderStatusText: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
  cancelButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.red,
    paddingVertical: 5, // Giữ padding như các nút status khác
    paddingHorizontal: 10, 
    borderRadius: 5,
    alignSelf: 'flex-end', // Căn nút sang trái giống các nút status khác
     marginTop: -30 ,  // Điều chỉnh margin để tương đồng với các nút trạng thái khác
  },
  
  cancelButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
});

export default OrderScreen;
