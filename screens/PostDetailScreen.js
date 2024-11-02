import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import COLORS from '../constants/color';
import FONTS from '../constants/font';
import Icon from 'react-native-vector-icons/Ionicons';
import IconAnt from 'react-native-vector-icons/AntDesign';

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params; // Nhận dữ liệu bài viết từ CommunityScreen
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);

  // Lấy dữ liệu bình luận từ API khi màn hình được mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${post.articleId}`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [post.articleId]);

  // Hàm xử lý khi người dùng đăng bình luận
  const handlePostComment = () => {
    if (newComment.trim()) {
      // Gửi dữ liệu bình luận mới lên server (giả lập)
      setComments([
        ...comments,
        {
          commentId: comments.length + 1,
          userName: 'Người dùng',
          content: newComment,
          postDate: new Date().toISOString(),
        },
      ]);
      setNewComment('');
    }
  };

  // Hàm hiển thị từng bình luận
  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Icon name="person-circle-outline" size={32} color={COLORS.black} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.userName}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <Text style={styles.commentTime}>{new Date(item.postDate).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* FlatList để hiển thị toàn bộ nội dung và bình luận */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.commentId.toString()}
        renderItem={renderComment}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={styles.backButton}>
                  <Icon name="arrow-back-outline" size={28} color={COLORS.green} />
                </View>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
            </View>

            {/* Thông tin tác giả và bài viết */}
            <View style={styles.authorInfo}>
              <Image
                source={{ uri: 'https://mighty.tools/mockmind-api/content/human/44.jpg' }}
                style={styles.authorImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>{post.authorName}</Text>
                <Text style={styles.postDate}>{post.createdAt}</Text>
              </View>
            </View>

            {/* Nội dung bài viết */}
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Hình ảnh của bài viết */}
            <View style={styles.imageContainer}>
              {post.images && post.images.map((imageUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUrl }}
                  style={styles.postImage}
                />
              ))}
            </View>

            {/* Hành động trên bài viết */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <IconAnt name="like2" size={28} color={COLORS.greySolid} />
                <Text style={styles.actionText}>{post.likes || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="chatbubble-outline" size={27} color={COLORS.greySolid} />
                <Text style={styles.actionText}>{comments.length}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.commentSectionTitle}>Bình luận</Text>
          </View>
        }
      />

      {/* Nhập bình luận mới */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Viết bình luận..."
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

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  backButton: {
    height: 50,
    width: 50,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginLeft: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorImage: {
    width: 45,
    height: 45,
    borderRadius: 50,
    marginRight: 10,
  },
  authorName: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  postDate: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 3,
  },
  postTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    marginBottom: 10,
  },
  postContent: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  imageContainer: {
    marginTop: 10,
  },
  postImage: {
    width: 200,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
    marginRight: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.greySolid,
    marginLeft: 5,
  },
  commentSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginTop: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  commentContent: {
    marginLeft: 10,
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.grey,
  },
  commentTime: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 5,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
});
