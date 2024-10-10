import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import COLORS from '../constants/color';
import FONTS from '../constants/font';

const CommunityScreen = () => {
  const [activeTab, setActiveTab] = useState('Cộng đồng');

  // Dữ liệu mẫu cho các bài đăng cộng đồng
  const communityPosts = [
    {
      id: '1',
      username: 'lukaku',
      content: 'What your content?',
      images: [],
    },
    {
      id: '2',
      username: 'cxzvc',
      title: 'Title',
      content: 'ajhvdfjahsvb dcjn asdadasdacasdasf acacacscdacac...',
      images: [
        { id: 'img1', uri: 'https://via.placeholder.com/100' },
        { id: 'img2', uri: 'https://via.placeholder.com/100' },
      ],
    },
  ];

  // Dữ liệu mẫu cho các bài đăng từ chuyên gia
  const expertPosts = [
    {
      id: '1',
      username: 'chuyengia',
      title: 'Title',
      content: 'ajhvdfjahsvb dcjn asdadasdacasdasf acacacscdacac...',
      images: [
        { id: 'img1', uri: 'https://via.placeholder.com/100' },
        { id: 'img2', uri: 'https://via.placeholder.com/100' },
      ],
    },
    {
      id: '2',
      username: 'chuyengia',
      title: 'Title',
      content: 'ajhvdfjahsvb dcjn asdadasdacasdasf acacacscdacacbajbhcba....',
      images: [],
    },
  ];

  // Hiển thị một bài đăng trong cộng đồng
  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Text style={styles.content}>{item.content}</Text>
  
      {item.images.length > 0 && (
        <View style={styles.imageContainer}>
          {item.images.map((image) => (
            <Image key={image.id} source={{ uri: image.uri }} style={styles.postImage} />
          ))}
        </View>
      )}
  
      {/* Chỉ hiện nút tym và comment cho các bài đăng không phải của user */}
      {item.username !== 'lukaku' && (
        <View style={styles.interactionBar}>
          <TouchableOpacity style={styles.iconContainer}>
            <Text style={styles.iconText}>❤️</Text> {/* Thêm icon bằng văn bản hoặc thay thế bằng Image */}
            <Text style={styles.iconText}>12</Text> {/* Số lượng likes */}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer}>
            <Text style={styles.iconText}>💬</Text> {/* Thêm icon bằng văn bản hoặc thay thế bằng Image */}
            <Text style={styles.iconText}>5</Text> {/* Số lượng comments */}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Cộng đồng' && styles.activeTab]}
          onPress={() => setActiveTab('Cộng đồng')}
        >
          <Text style={styles.tabText}>Cộng đồng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Chuyên gia' && styles.activeTab]}
          onPress={() => setActiveTab('Chuyên gia')}
        >
          <Text style={styles.tabText}>Chuyên gia</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách bài đăng */}
      <FlatList
        data={activeTab === 'Cộng đồng' ? communityPosts : expertPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
      />
    </View>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    padding: 15,
    backgroundColor: COLORS.grey,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
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
  postList: {
    paddingHorizontal: 20,
  },
  postContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  title: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
  content: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    marginLeft: 5,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
});
