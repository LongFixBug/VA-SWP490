import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/color';
import FONTS from '../constants/font';

const CommunityScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Cộng đồng');

  // Sample posts for the community
  const communityPosts = [
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
    {
      id: '3',
      username: 'nbnbn',
      title: 'Title',
      content: 'ajhvdfjahsvb dcjn asdadasdacasdasf acacacscdacacbajbhcba....',
      images: [],
    },
  ];

  // Sample posts for the expert tab
  const expertPosts = [
    {
      id: '1',
      username: 'chuyengia',
      title: 'Expert Post Title',
      content: 'ajhvdfjahsvb dcjn asdadasdacasdasf acacacscdacac...',
      images: [
        { id: 'img1', uri: 'https://via.placeholder.com/100' },
        { id: 'img2', uri: 'https://via.placeholder.com/100' },
      ],
    },
  ];

  // Render new post section (only for the "Cộng đồng" tab)
  const renderNewPostSection = () => (
    <TouchableOpacity style={styles.newPostContainer} onPress={() => navigation.navigate('NewPostScreen')}>
      <View style={styles.newPostHeader}>
        <Icon name="person-circle-outline" size={32} color={COLORS.black} />
        <Text style={styles.username}>lukaku</Text>
      </View>
      <Text style={styles.newPostText}>What your content?</Text>
      <View style={styles.newPostActions}>
        <Icon name="image-outline" size={24} color={COLORS.grey} />
        <Icon name="camera-outline" size={24} color={COLORS.grey} />
      </View>
    </TouchableOpacity>
  );

  // Render a post (either community or expert posts)
  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Icon name="person-circle-outline" size={32} color={COLORS.black} />
        <View>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </View>
      <Text style={styles.content}>{item.content}</Text>

      {item.images.length > 0 && (
        <View style={styles.imageContainer}>
          {item.images.map((image) => (
            <Image key={image.id} source={{ uri: image.uri }} style={styles.postImage} />
          ))}
        </View>
      )}

      <View style={styles.interactionBar}>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="heart-outline" size={20} color={COLORS.grey} />
          <Text style={styles.iconText}>12</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="chatbubble-outline" size={20} color={COLORS.grey} />
          <Text style={styles.iconText}>5</Text>
        </TouchableOpacity>
      </View>
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

      {/* Only show new post section if in the "Cộng đồng" tab */}
      {activeTab === 'Cộng đồng' && renderNewPostSection()}

      {/* List of posts */}
      <FlatList
        data={activeTab === 'Cộng đồng' ? communityPosts : expertPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
      />
    </View>
  );
};

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
  newPostContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  newPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  newPostText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginBottom: 10,
  },
  newPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  postContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  username: {
    marginLeft: 10,
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

export default CommunityScreen;
