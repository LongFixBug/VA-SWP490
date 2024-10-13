import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import COLORS from '../constants/color';
import FONTS from '../constants/font';
import { useNavigation } from '@react-navigation/native'; 

const OrderScreen = () => {
  const navigation = useNavigation(); 
  const [activeTab, setActiveTab] = useState('pending'); // Mặc định là "Chưa hoàn thành"
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const response = await fetch('https://va-api-2efefb5aee82.herokuapp.com/orders');
      const data = await response.json();
      setOrders(data.data); // Lưu trữ danh sách đơn hàng vào state
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderDetails = (order) => {
    navigation.navigate('OrderDetails', { order });
  };

  const handleCancelOrder = (id) => {
    Alert.alert('Hủy đơn hàng', `Bạn có chắc chắn muốn hủy đơn hàng ${id}?`, [
      { text: 'Không', style: 'cancel' },
      { text: 'Hủy', onPress: () => console.log(`Đơn hàng ${id} đã bị hủy`) },
    ]);
  };

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') {
      return order.status === 'pending' || order.status === 'in_progress' || order.status === 'delivering';
    } else {
      return order.status === 'delivered' || order.status === 'cancelled';
    }
  });

  const renderOrder = ({ item }) => (
    <TouchableOpacity onPress={() => handleOrderDetails(item)}>
      <View style={styles.orderCard}>
        <View style={styles.orderInfo}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }} 
            style={styles.orderImage}
          />
          <View style={styles.orderDetails}>
            <Text style={styles.orderName}>{item.order_items.map(dish => dish.name).join(', ')}</Text>
            <Text style={styles.orderQuantity}>Số lượng: {item.order_items.length}</Text>
            <Text style={styles.orderTotal}>Tổng số tiền: {item.total_price} VND</Text>
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

        {item.status === 'pending' && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelOrder(item.order_id)}>
            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: COLORS.yellow };
      case 'in_progress':
        return { backgroundColor: COLORS.orange };
      case 'delivering':
        return { backgroundColor: COLORS.blue };
      case 'delivered':
        return { backgroundColor: COLORS.green };
      case 'cancelled':
        return { backgroundColor: COLORS.red };
      default:
        return { backgroundColor: COLORS.grey };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={styles.tabText}>Chưa hoàn thành</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={styles.tabText}>Đã hoàn thành</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.order_id.toString()}
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
    elevation: 5, 
    marginBottom: 15,
    padding: 10,
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
    paddingVertical: 5,
    paddingHorizontal: 10, 
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginTop: -30,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderScreen;
