import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import IconAnt from "react-native-vector-icons/AntDesign";
import Header from "../components/Header";
import ImageViewer from "react-native-image-zoom-viewer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const PostDetailScreen = ({ navigation, route }) => {
  const { post } = route.params;
  const [imageView, setImageView] = useState(false);
  const [selectedpictureOfArticle, setSelectedpictureOfArticle] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [postImages, setPostImages] = useState([]);

  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  const showToast = (type, title, message) => {
    Toast.show({
      type: type,
      text1: title,
      text2: message,
    });
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${post.articleId}`
        );
        const commentsData = await response.json();

        // Lấy avatar người dùng cho từng comment
        const commentsWithUserDetails = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const userResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${comment.userId}`
              );
              const userData = await userResponse.json();

              return {
                ...comment,
                avatarUrl:
                  userData.imageUrl || "https://via.placeholder.com/35",
                userName: userData.username || "Ẩn danh",
              };
            } catch (error) {
              console.error(
                `Error fetching user data for userId ${comment.userId}`,
                error
              );
              return {
                ...comment,
                avatarUrl: "https://via.placeholder.com/35",
                userName: "Ẩn danh",
              };
            }
          })
        );

        setComments(commentsWithUserDetails);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [post.articleId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");

        // Lấy số lượt like và trạng thái đã like
        const likesResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${post.articleId}`
        );
        const likesData = await likesResponse.json();
        setLikes(likesData.length);

        // Kiểm tra nếu user đã like
        const userLiked = likesData.some(
          (like) => like.userId === parseInt(userId)
        );
        setLiked(userLiked);

        // Lấy số lượng bình luận
        const commentsResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${post.articleId}`
        );
        const commentsData = await commentsResponse.json();
        setCommentCount(commentsData.length);
      } catch (error) {
        return 0;
      }
    };

    fetchInitialData();
  }, [post.articleId]);

  // Lấy ảnh của bài viết từ API
  useEffect(() => {
    const fetchArticleImages = async () => {
      try {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${post.articleId}`
        );
        const imagesData = await response.json();
        setPostImages(imagesData);
      } catch (error) {
        console.error("Error fetching article images:", error);
      }
    };

    if (post.articleId) {
      fetchArticleImages();
    }
  }, [post.articleId]);

  const handleLike = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!liked) {
        // Chưa like -> gọi API like
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleLike`,
          {
            method: "POST",
            body: JSON.stringify({
              articleId: post.articleId,
              userId: userId,
              likeDate: new Date().toISOString(),
            }),
          }
        );

        if (response.ok) {
          setLiked(true);
          setLikes((prev) => prev + 1);
          showToast("success", "Thành công", "Bạn đã thích bài viết này!");
        } else {
          showToast(
            "error",
            "Lỗi",
            "Không thể thích bài viết. Vui lòng thử lại."
          );
        }
      } else {
        // Đã like -> gọi API unlike
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/deleteArticleLikeByUserId`,
          {
            method: "DELETE",
            body: JSON.stringify({
              articleId: post.articleId,
              userId: userId,
            }),
          }
        );

        if (response.ok) {
          setLiked(false);
          setLikes((prev) => Math.max(prev - 1, 0));
          showToast("success", "Thành công", "Bạn đã bỏ thích bài viết này!");
        } else {
          showToast(
            "error",
            "Lỗi",
            "Không thể bỏ thích bài viết. Vui lòng thử lại."
          );
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý like/unlike:", error);
      showToast("error", "Lỗi", "Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  const checkCommentContent = async (content) => {
    try {
      const words = content.split(/\s+/);
      for (let word of words) {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/check-comment-content?Content=${encodeURIComponent(
            word
          )}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          return { success: false, message: "Invalid content detected." };
        }

        const result = await response.json();
        if (!result.success) {
          return {
            success: false,
            message: `Invalid content detected: "${word}"`,
          };
        }
      }
      return { success: true, message: "Content is valid." };
    } catch (error) {
      console.error("Error checking comment content:", error);
      return { success: false, message: "Error checking content." };
    }
  };

  const handlePostComment = async () => {
    if (newComment.trim()) {
      try {
        const checkResult = await checkCommentContent(newComment);

        if (!checkResult.success) {
          let toastMessage =
            "Bình luận của bạn không hợp lệ, hãy bình luận lại nhé!";
          if (
            checkResult.message === "Invalid content: contains adult language."
          ) {
            toastMessage =
              "Bạn sử dụng ngôn từ thô tục, hãy bình luận lại nhé!";
          } else if (
            checkResult.message ===
            "Invalid content: contains violent language."
          ) {
            toastMessage =
              "Bạn sử dụng ngôn từ bạo lực, hãy bình luận lại nhé!";
          }

          showToast("error", "Lỗi bình luận", toastMessage);
          return;
        }

        const storedUserData = await AsyncStorage.getItem("userData");
        const parsedUserData = storedUserData ? JSON.parse(storedUserData) : {};

        const userId =
          parsedUserData.userId || (await AsyncStorage.getItem("userId"));
        const userName = parsedUserData.username || "Ẩn danh";
        const avatarUrl =
          parsedUserData.imageUrl || "https://via.placeholder.com/35";

        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment`,
          {
            method: "POST",
            body: JSON.stringify({
              content: newComment,
              userId: userId,
              articleId: post.articleId,
            }),
          }
        );

        if (response.ok) {
          const newCommentData = {
            content: newComment,
            userId: userId,
            articleId: post.articleId,
            userName: userName,
            avatarUrl: avatarUrl,
          };

          setComments((prevComments) => [newCommentData, ...prevComments]);
          setNewComment("");
          setCommentCount((prev) => prev + 1);

          showToast("success", "Thành công", "Bình luận đã được đăng!");
        } else {
          showToast(
            "error",
            "Lỗi",
            "Không thể gửi bình luận, vui lòng thử lại sau."
          );
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        showToast("error", "Lỗi", "Đã xảy ra lỗi, vui lòng thử lại sau.");
      }
    } else {
      showToast("error", "Lỗi", "Vui lòng nhập nội dung bình luận.");
    }
  };

  return (
    <>
      <Header
        title="Chi tiết bài viết"
        leftIcon="close"
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container}>
        <View style={styles.articleInfo}>
          {/* Thông tin tác giả */}
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserProfileScreen", {
                  userId: post.authorId,
                })
              }
            >
              <Image
                source={{
                  uri: post.authorImageUrl || "https://via.placeholder.com/45",
                }}
                style={styles.authorImage}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("UserProfileScreen", {
                    userId: post.authorId,
                  })
                }
              >
                <Text style={styles.authorName}>
                  {post.authorName || "Ẩn danh"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.articleTime}>{post.createdAt}</Text>
              {post.moderateDate && (
                <Text style={styles.articleModerateDate}>
                  Ngày duyệt: {new Date(post.moderateDate).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>

          {/* Nội dung bài viết */}
          <Text style={styles.articleTitle}>{post.title}</Text>
          <Text style={styles.articleContent}>{post.content}</Text>

          {/* Hình ảnh bài viết */}
          <ScrollView horizontal style={styles.imageScroll}>
            {postImages &&
              postImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setImageView(true);
                    setSelectedpictureOfArticle(index);
                  }}
                >
                  <Image
                    source={{ uri: image.imageUrl }}
                    style={styles.articleImage}
                  />
                </TouchableOpacity>
              ))}
          </ScrollView>

          {/* Like - Comment */}
          {post.status === "accepted" && (
            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 20,
                }}
                onPress={handleLike}
              >
                <IconAnt
                  name={liked ? "like1" : "like2"}
                  size={24}
                  color={liked ? COLORS.green : COLORS.greySolid}
                />
                <Text
                  style={{
                    fontFamily: FONTS.medium,
                    fontSize: 16,
                    marginLeft: 5,
                    color: liked ? COLORS.green : COLORS.greySolid,
                  }}
                >
                  {likes || 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => {}}
              >
                <Icon
                  name="chatbubble-outline"
                  size={24}
                  color={COLORS.greySolid}
                />
                <Text
                  style={{
                    fontFamily: FONTS.medium,
                    fontSize: 16,
                    marginLeft: 5,
                    color: COLORS.greySolid,
                  }}
                >
                  {commentCount || 0}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Khu vực bình luận */}
        <View>
          <Text style={styles.commentHeader}>Bình luận</Text>
          {loadingComments ? (
            <Text style={styles.loadingText}>Đang tải bình luận...</Text>
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>Không có bình luận nào</Text>
          ) : (
            comments.map((item, index) => (
              <View key={index} style={styles.comment}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("UserProfileScreen", {
                      userId: item.userId,
                    })
                  }
                >
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={styles.commentAvatar}
                  />
                </TouchableOpacity>
                <View style={styles.commentContent}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("UserProfileScreen", {
                        userId: item.userId,
                      })
                    }
                  >
                    <Text style={styles.commentAuthor}>{item.userName}</Text>
                  </TouchableOpacity>
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Input bình luận */}
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

      <Toast />

      {/* Modal xem ảnh */}
      <Modal visible={imageView} transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageView(false)}
          >
            <Text style={styles.modalCloseText}>Đóng</Text>
          </TouchableOpacity>
          <ImageViewer
            imageUrls={postImages.map((img) => ({ url: img.imageUrl }))}
            index={selectedpictureOfArticle}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  articleInfo: { padding: 10 },
  authorImage: { width: 45, height: 45, borderRadius: 50, marginRight: 10 },
  authorName: { fontFamily: FONTS.medium, fontSize: 14 },
  articleTime: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.grey },
  articleTitle: { fontFamily: FONTS.semiBold, fontSize: 15 },
  articleContent: { fontFamily: FONTS.medium, fontSize: 14, lineHeight: 22 },
  imageScroll: { marginTop: 10 },
  articleImage: { width: 400, height: 300, borderRadius: 8, marginRight: 10 },
  commentHeader: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
    marginTop: 15,
    marginLeft: 10,
  },
  noComments: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, textAlign: "center" },
  comment: { flexDirection: "row", marginTop: 15, marginHorizontal: 10 },
  commentAvatar: { height: 35, width: 35, borderRadius: 50 },
  commentContent: { marginLeft: 8, flex: 1 },
  commentAuthor: { fontFamily: FONTS.semiBold, marginBottom: 5 },
  commentBox: {
    backgroundColor: COLORS.darkGrey,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  commentText: { fontFamily: FONTS.medium, lineHeight: 20 },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  modalCloseText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  articleModerateDate: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.grey,
    marginTop: -10,
  },
});

export default PostDetailScreen;
