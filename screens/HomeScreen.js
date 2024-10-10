import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/color'; 
import FONTS from '../constants/font';   

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [userData, setUserData] = useState({
    name: 'Nguyễn Thị XXX',
    points: 333,
    rank: 'hạng đồng',
    avatar: 'https://via.placeholder.com/100'
  });

  const [dishes, setDishes] = useState([
    { id: '1', name: 'Món ăn 1' },
    { id: '2', name: 'Món ăn 2' },
    { id: '3', name: 'Món ăn 3' },
    { id: '4', name: 'Món ăn 4' },
  ]);

  return (
    <View style={styles.container}>
      {/* Phần chào người dùng */}
      <View style={styles.userInfo}>
        <Image source={{ uri: userData.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.greeting}>xin chào,</Text>
          <Text style={styles.username}>{userData.name}</Text>
        </View>
        <View style={styles.points}>
          <Text style={styles.pointNumber}>{userData.points} điểm</Text>
          <Text style={styles.pointLabel}>{userData.rank}</Text>
        </View>
      </View>

      {/* Biểu tượng chức năng */}
      <View style={styles.featureIcons}>
        <View style={styles.iconItem}>
          <Icon name="restaurant-outline" size={32} color={COLORS.black} />
          <Text style={styles.iconLabel}>Món Ăn</Text>
        </View>
        <View style={styles.iconItem}>
          <Icon name="book-outline" size={32} color={COLORS.black} />
          <Text style={styles.iconLabel}>Menu</Text>
        </View>
        <View style={styles.iconItem}>
          <Icon name="heart-outline" size={32} color={COLORS.black} />
          <Text style={styles.iconLabel}>Danh sách yêu thích</Text>
        </View>
      </View>

      {/* Thanh tìm kiếm và giỏ hàng */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={24} color={COLORS.grey} />
        <Text style={styles.searchInput}>Tìm món ăn...</Text>
        <View style={styles.cartIconContainer}>
          <Icon name="cart-outline" size={24} color={COLORS.black} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
        </View>
      </View>

      {/* Phần danh sách món ăn và "Xem tất cả" */}
      <View style={styles.dishHeader}>
        <Text style={styles.sectionTitle}>Món ăn dành cho bạn</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={dishes}
        renderItem={({ item }) => (
          <View style={styles.dishItem}>
            <Text>{item.name}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Chia đều chiều cao màn hình
    backgroundColor: COLORS.white,
    paddingHorizontal: '5%',
    justifyContent: 'space-around', // Trải đều các thành phần trong màn hình
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    height: height * 0.15, // Chiếm 15% chiều cao màn hình
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.grey,
  },
  username: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  points: {
    alignItems: 'center',
  },
  pointNumber: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  pointLabel: {
    fontSize: 12,
    color: COLORS.grey,
  },
  featureIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    height: height * 0.15, // Chiếm 15% chiều cao màn hình
  },
  iconItem: {
    alignItems: 'center',
    width: '30%',
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: height * 0.08, // Chiếm 8% chiều cao màn hình
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.grey,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: height * 0.05, // Chiếm 5% chiều cao màn hình
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  viewAll: {
    fontSize: 14,
    color: COLORS.green,
    fontFamily: FONTS.regular,
  },
  dishItem: {
    backgroundColor: COLORS.lightGray,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width: (width / 2) - 30, 
  },
});

export default HomeScreen;
