import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/color';
import FONTS from '../constants/font';

// Đây là mock data, sau này bạn sẽ thay thế nó bằng dữ liệu từ API
const foodItems = [
  {
    id: '1',
    name: 'Tên món ăn 1',
    price: '30.000 vnd',
    rating: 5.0,
    comments: '999 bình luận',
  },
  {
    id: '2',
    name: 'Tên món ăn 2',
    price: '30.000 vnd',
    rating: 4.5,
    comments: '888 bình luận',
  },
  {
    id: '3',
    name: 'Tên món ăn 3',
    price: '40.000 vnd',
    rating: 4.8,
    comments: '765 bình luận',
  },
  {
    id: '4',
    name: 'Tên món ăn 4',
    price: '50.000 vnd',
    rating: 4.9,
    comments: '543 bình luận',
  },
  // Thêm các món ăn khác ở đây nếu cần
];

const SuggestedDishesScreen = () => {
  const navigation = useNavigation();

  const renderFoodItem = ({ item }) => (
    <View style={styles.foodCard}>
      <Image
        source={{ uri: 'https://via.placeholder.com/100' }} // Placeholder cho hình ảnh món ăn
        style={styles.foodImage}
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>{item.price}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.comments}>({item.comments})</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xem tất cả</Text>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Tìm kiếm món ăn" />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <View style={styles.tagContainer}>
        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>Vegan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>Vegetarian</Text>
        </TouchableOpacity>
        {/* Thêm nhiều tag khác nếu cần */}
      </View>

      {/* List of Food Items */}
      <FlatList
        data={foodItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 10,
  },
  filterText: {
    fontSize: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Hiệu ứng bóng đổ trên Android
  },
  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  foodInfo: {
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  foodPrice: {
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
    color: 'gold',
  },
  rating: {
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 5,
  },
  comments: {
    fontSize: 14,
    color: COLORS.grey,
    marginLeft: 5,
  },
});

export default SuggestedDishesScreen;
