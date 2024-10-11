import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/color';
import FONTS from '../constants/font';

// Dữ liệu mẫu cho đánh giá
const reviews = [
  { id: '1', username: 'cxzvc', comment: 'Lksdkfdsfjsd', rating: 5, time: '3 ngày trước' },
  { id: '2', username: 'abcxyz', comment: 'Ngon tuyệt vời', rating: 4, time: '5 ngày trước' },
];

const DishDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { dish } = route.params;  // Lấy thông tin món ăn từ params

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.reviewRating}>
          {Array(item.rating).fill().map((_, i) => (
            <Icon key={i} name="star" size={14} color="gold" />
          ))}
        </View>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dishes detail</Text>
        <Icon name="cart-outline" size={24} color={COLORS.black} />
      </View>

      {/* Món ăn */}
      
      <View style={styles.dishInfo}>
      <Image source={{ uri: dish.imageUrl }} style={styles.dishImage} />
        <View style={styles.priceAndFavorite}>
          <Text style={styles.price}>{dish.price} vnd</Text>
          <Icon name="heart-outline" size={24} color={COLORS.black} />
        </View>
        <Text style={styles.dishName}>{dish.name}</Text>
        <View style={styles.dishRating}>
          <Text style={styles.rating}>{dish.rating}</Text>
          {Array(5).fill().map((_, i) => (
            <Icon key={i} name="star" size={16} color={i < dish.rating ? 'gold' : 'gray'} />
          ))}
        </View>

        {/* Mô tả món ăn */}
        <Text style={styles.sectionTitle}>Mô tả</Text>
        <Text style={styles.description}>{dish.description}</Text>

        {/* Nguyên liệu */}
        <Text style={styles.sectionTitle}>Nguyên liệu</Text>
        <Text style={styles.description}>{dish.ingredients}</Text>

        {/* Công thức */}
        <Text style={styles.sectionTitle}>Công thức</Text>
        <Text style={styles.description}>{dish.recipe}</Text>
      </View>

      {/* Đánh giá */}
      <Text style={styles.sectionTitle}>Đánh giá</Text>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        style={styles.reviewList}
      />

      {/* Nút thêm vào giỏ hàng */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.buttonText}>THÊM VÀO GIỎ HÀNG</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buttonText}>MUA NGAY</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  dishImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    marginBottom: 15,
  },
  dishInfo: {
    marginBottom: 20,
  },
  priceAndFavorite: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  dishName: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginVertical: 10,
  },
  dishRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: COLORS.black,
    marginRight: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginVertical: 10,
    color: COLORS.black,
  },
  description: {
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 10,
  },
  reviewList: {
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  username: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  comment: {
    fontSize: 14,
    color: COLORS.grey,
  },
  time: {
    fontSize: 12,
    color: COLORS.grey,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: COLORS.grey,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});

export default DishDetailScreen;
