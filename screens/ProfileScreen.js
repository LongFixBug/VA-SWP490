import React, { useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/color';
import FONTS from '../constants/font';

const PersonalScreen = () => {
  const [userData, setUserData] = useState({
    username: 'lukaku',
    avatar: 'https://via.placeholder.com/100',
    postCount: 2,
    followingCount: 1,
    followerCount: 1,
  });

  const [userPosts, setUserPosts] = useState([
    {
      id: '1',
      title: 'Title',
      content: 'ajhvdfjahsvb dcjn asdadasdacasdasf acacacsdacacac.....',
      images: [
        { id: 'img1', uri: 'https://via.placeholder.com/100' },
        { id: 'img2', uri: 'https://via.placeholder.com/100' },
      ],
    },
    {
      id: '2',
      title: 'Title',
      content: 'ajhvdfjahsvb dcjn asdadasdacasdasf acacacsdacacac.....',
      images: [],
    },
  ]);

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: userData.avatar }} style={styles.avatarSmall} />
          <Text style={styles.username}>{userData.username}</Text>
        </View>
        <Icon name="ellipsis-horizontal" size={20} color={COLORS.black} />
      </View>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>

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
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="chatbubble-outline" size={20} color={COLORS.grey} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with user profile */}
      <View style={styles.header}>
        <View style={styles.userInfoContainer}>
          <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          <Text style={styles.username}>{userData.username}</Text>
        </View>
        <Icon name="menu-outline" size={28} color={COLORS.black} />
      </View>

      {/* User stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData.postCount}</Text>
          <Text style={styles.statLabel}>Bài đăng</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData.followerCount}</Text>
          <Text style={styles.statLabel}>Bài chờ...</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData.followingCount}</Text>
          <Text style={styles.statLabel}>Đang theo...</Text>
        </View>
      </View>

      {/* User's posts */}
      <FlatList
        data={userPosts}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
  postList: {
    paddingHorizontal: 15,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  postTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  postContent: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginVertical: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default PersonalScreen;
