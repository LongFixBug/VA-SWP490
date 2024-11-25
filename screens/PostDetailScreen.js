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
      type: type, // Loại thông báo: 'success', 'error', 'info'
      text1: title, // Tiêu đề thông báo
      text2: message, // Nội dung thông báo
    });
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Gọi API lấy bình luận
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${post.articleId}`
        );
        const commentsData = await response.json();

        // Gọi API getUserByID để lấy avatar cho từng người dùng trong bình luận
        const commentsWithUserDetails = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const userResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${comment.userId}`
              );
              const userData = await userResponse.json();

              // Log ra userId và avatarUrl
              console.log(
                `userId: ${comment.userId}, avatarUrl: ${
                  userData.imageUrl || "https://via.placeholder.com/35"
                }`
              );

              // Trả về dữ liệu bình luận cùng avatar
              return {
                ...comment,
                avatarUrl:
                  userData.imageUrl || "https://via.placeholder.com/35", // Avatar mặc định nếu không có
              };
            } catch (error) {
              console.error(
                `Error fetching user data for userId ${comment.userId}`,
                error
              );
              return {
                ...comment,
                avatarUrl: "https://via.placeholder.com/35", // Avatar mặc định nếu API thất bại
              };
            }
          })
        );

        // Cập nhật state với dữ liệu bình luận kèm thông tin người dùng
        setComments(commentsWithUserDetails);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [post.articleId]);

  //lay du lieu like ,cmt
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

  //like
  const handleLike = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!liked) {
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
        }
      } else {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/removeArticleLike`,
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
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý like:", error);
    }
  };

  // const handlePostComment = async () => {
  //   if (newComment.trim()) {
  //     try {
  //       // Lấy thông tin người dùng hiện tại từ AsyncStorage
  //       const storedUserData = await AsyncStorage.getItem("userData");
  //       const parsedUserData = storedUserData ? JSON.parse(storedUserData) : {};

  //       const userId =
  //         parsedUserData.userId || (await AsyncStorage.getItem("userId"));
  //       const userName = parsedUserData.username || "Ẩn danh";
  //       const avatarUrl =
  //         parsedUserData.imageUrl || "https://via.placeholder.com/35";

  //       // Gửi bình luận lên API
  //       const response = await fetchWithAuth(
  //         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment`,
  //         {
  //           method: "POST",
  //           body: JSON.stringify({
  //             content: newComment,
  //             userId: userId,
  //             articleId: post.articleId,
  //           }),
  //         }
  //       );

  //       if (response.ok) {
  //         // Thêm bình luận mới vào danh sách bình luận
  //         const newCommentData = {
  //           content: newComment,
  //           userId: userId,
  //           articleId: post.articleId,
  //           userName: userName,
  //           avatarUrl: avatarUrl, // Đảm bảo avatar được hiển thị ngay
  //         };

  //         setComments((prevComments) => [newCommentData, ...prevComments]);
  //         setNewComment(""); // Reset nội dung bình luận
  //         setCommentCount((prev) => prev + 1); // Tăng số lượng bình luận
  //       }
  //     } catch (error) {
  //       console.error("Error posting comment:", error);
  //     }
  //   }
  // };

  //checkcomment
  const checkCommentContent = async (content) => {
    try {
      // Tách nội dung thành từng từ
      const words = content.split(/\s+/); // Tách theo khoảng trắng

      for (let word of words) {
        // Gọi API kiểm tra từng từ
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/check-comment-content?Content=${encodeURIComponent(
            word
          )}`,
          {
            method: "GET", // Phương thức GET
          }
        );

        if (!response.ok) {
          return { success: false, message: "Invalid content detected." };
        }

        const result = await response.json();

        // Nếu API trả về success là false, dừng kiểm tra và trả về lỗi
        if (!result.success) {
          return {
            success: false,
            message: `Invalid content detected: "${word}"`,
          };
        }
      }

      // Nếu tất cả từ đều hợp lệ
      return { success: true, message: "Content is valid." };
    } catch (error) {
      console.error("Error checking comment content:", error);
      return { success: false, message: "Error checking content." };
    }
  };

  const handlePostComment = async () => {
    if (newComment.trim()) {
      try {
        // Gọi API kiểm tra nội dung bình luận
        const checkResult = await checkCommentContent(newComment);

        if (!checkResult.success) {
          // Hiển thị thông báo lỗi dựa trên message từ API
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
          return; // Dừng xử lý nếu nội dung không hợp lệ
        }

        // Tiếp tục gửi bình luận nếu nội dung hợp lệ
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
          setNewComment(""); // Reset nội dung bình luận
          setCommentCount((prev) => prev + 1); // Tăng số lượng bình luận

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
            <Image
              source={{
                uri: post.authorImageUrl || "https://via.placeholder.com/45",
              }}
              style={styles.authorImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>
                {post.authorName || "Ẩn danh"}
              </Text>
              <Text style={styles.articleTime}>{post.createdAt}</Text>
            </View>
          </View>
          {/* Nội dung bài viết */}
          <Text style={styles.articleTitle}>{post.title}</Text>
          <Text style={styles.articleContent}>{post.content}</Text>

          {/* Hình ảnh bài viết */}
          <ScrollView horizontal style={styles.imageScroll}>
            {post.images &&
              post.images.map((image, index) => (
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
          {/* like - comment */}
          {/* like - comment */}
          {post.status === "accepted" && (
            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                alignItems: "center",
              }}
            >
              {/* Nút like */}
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

              {/* Nút comment */}
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

        {/* Khu vực hiển thị bình luận */}
        <View>
          <Text style={styles.commentHeader}>Bình luận</Text>
          {loadingComments ? (
            <Text style={styles.loadingText}>Đang tải bình luận...</Text>
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>Không có bình luận nào</Text>
          ) : (
            comments.map((item, index) => (
              <View key={index} style={styles.comment}>
                <Image
                  source={{ uri: item.avatarUrl }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>{item.userName}</Text>
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Input để nhập bình luận */}
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

      {/* Toast Message */}
      <Toast />

      {/* Modal hiển thị ảnh */}
      <Modal visible={imageView} transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageView(false)}
          >
            <Text style={styles.modalCloseText}>Đóng</Text>
          </TouchableOpacity>
          <ImageViewer
            imageUrls={post.images.map((img) => ({ url: img.imageUrl }))}
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
  commentHeader: { fontFamily: FONTS.semiBold, fontSize: 17, marginTop: 15 },
  noComments: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, textAlign: "center" },
  comment: { flexDirection: "row", marginTop: 15 },
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
});

export default PostDetailScreen;
