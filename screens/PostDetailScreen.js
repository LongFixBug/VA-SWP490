import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import COLORS from '../constants/color';
import FONTS from '../constants/font';

const PostDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { article } = route.params; // Received from CommunityScreen
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, username: 'lukaku', content: 'Nice post!', time: '1 hour ago' },
    { id: 2, username: 'messi', content: 'Very informative.', time: '2 days ago' },
    { id: 3, username: 'neymar', content: 'Loved it.', time: '3 days ago' },
  ]);

  const handlePostComment = () => {
    if (newComment) {
      setComments([...comments, { id: comments.length + 1, username: 'lukaku', content: newComment, time: 'Just now' }]);
      setNewComment('');
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Icon name="person-circle-outline" size={32} color={COLORS.black} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
      <Text style={styles.commentTime}>{item.time}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.postContent}>
      
      <View style={styles.postHeader}>
        <Icon name="person-circle-outline" size={32} color={COLORS.black} />
        <Text style={styles.username}>{article.author_role}</Text>
        {/* <Text style={styles.username}>{article.author_role}</Text> */}
        
      </View>
      <View>
          <Text style={styles.title}>{article.title}</Text>      
        </View>
      <Text style={styles.content}>{article.content}</Text>

      {/* Likes and Comments */}
      <View style={styles.interactionBar}>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="heart-outline" size={20} color={COLORS.grey} />
          <Text style={styles.iconText}>{article.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="chatbubble-outline" size={20} color={COLORS.grey} />
          <Text style={styles.iconText}>{article.comments}</Text>
        </TouchableOpacity>
      </View>

      {/* Comment Section Title */}
      <Text style={styles.commentSectionTitle}>Bình luận</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xem bài viết</Text>
      </View>

      {/* FlatList with Post Content as Header and Comments as List */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
      />

      {/* New Comment Input */}
      <View style={styles.commentInputContainer}>
        <Icon name="person-circle-outline" size={32} color={COLORS.black} />
        <TextInput
          style={styles.commentInput}
          placeholder="Bình luận của bạn"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={handlePostComment}>
          <Icon name="send-outline" size={24} color={COLORS.green} />
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    marginLeft: 10,
  },
  postContent: {
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 5,
    marginRight: 5,
    textAlign: 'center',  // Căn giữa nội dung của text
  },
  
  content: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginBottom: 15,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
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
  commentSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginTop: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 20,
  },
  commentContent: {
    marginLeft: 10,
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  commentText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
  commentTime: {
    fontSize: 12,
    color: COLORS.grey,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default PostDetailScreen;
