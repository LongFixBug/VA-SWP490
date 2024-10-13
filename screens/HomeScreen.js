import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; 
import COLORS from '../constants/color'; 
import FONTS from '../constants/font';   

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    name: 'Nguyễn Thị XXX',
    points: 333,
    rank: 'hạng đồng',
    avatar: 'https://via.placeholder.com/100'
  });
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Gọi API lấy danh sách món ăn
  const fetchDishes = async () => {
    try {
      const response = await fetch('https://va-api-2efefb5aee82.herokuapp.com/dishes');
      const jsonData = await response.json();
      setDishes(jsonData.data); 
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  // Lọc món ăn dựa trên từ khóa tìm kiếm
  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewAll = () => {
    navigation.navigate('AllDishes'); 
  };

  const renderDishItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('DishDetail', { dish: item })}>
      <View style={styles.dishItem}>
        <Text>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

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
          <TouchableOpacity onPress={handleViewAll}>
            <Icon name="restaurant-outline" size={32} color={COLORS.black} />
            <Text style={styles.iconLabel}>Món Ăn</Text>
          </TouchableOpacity>
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
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm món ăn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDishes} // Lọc món ăn dựa trên từ khóa tìm kiếm
        renderItem={renderDishItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: '5%',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
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
