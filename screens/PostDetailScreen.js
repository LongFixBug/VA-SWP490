import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRoute, useNavigation } from "@react-navigation/native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";

const PostDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { article } = route.params; // Received from CommunityScreen
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${article.articleId}`
        );
        const data = await response.json();
        setComments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setLoading(false);
      }
    };

    fetchComments();
  }, [article.articleId]);

  const handlePostComment = () => {
    if (newComment) {
      setComments([
        ...comments,
        {
          commentId: comments.length + 1,
          userName: "lukaku",
          content: newComment,
          postDate: "Just now",
        },
      ]);
      setNewComment("");
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Icon name="person-circle-outline" size={32} color={COLORS.black} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.userName}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <Text style={styles.commentTime}>
          {new Date(item.postDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.postContent}>
      <View style={styles.postHeader}>
        <Icon name="person-circle-outline" size={32} color={COLORS.black} />
        <Text style={styles.username}>{article.author_role}</Text>
      </View>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.content}>{article.content}</Text>

      <View style={styles.interactionBar}>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="heart-outline" size={20} color={COLORS.grey} />
          <Text style={styles.iconText}>{article.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="chatbubble-outline" size={20} color={COLORS.grey} />
          <Text style={styles.iconText}>{comments.length}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.commentSectionTitle}>Bình luận</Text>
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={COLORS.green}
        style={styles.loading}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <View
            style={{
              height: 50,
              width: 50,
              marginLeft: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.white,
              borderRadius: 10,
              elevation: 0,
            }}
          >
            <Icon name="arrow-back-outline" size={28} color={COLORS.green} />
          </View>
          <Text
            style={{
              fontFamily: FONTS.bold,
              color: COLORS.black,
              marginLeft: 10,
              fontSize: 20,
            }}
          >
            Chi tiết món ăn
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.commentId.toString()}
        ListHeaderComponent={renderHeader}
      />

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
  top: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    backgroundColor: "transparent",
  },
  postContent: {
    padding: 15,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  content: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginBottom: 15,
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    marginTop: 5,
    fontSize: 12,
    color: COLORS.grey,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PostDetailScreen;
