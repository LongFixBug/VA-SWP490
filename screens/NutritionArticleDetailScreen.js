import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import IconAnt from "react-native-vector-icons/AntDesign";
import Header from "../components/Header";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Toast from "react-native-toast-message";
import ImageViewer from "react-native-image-zoom-viewer";

const NutritionArticleDetailScreen = ({ route, navigation }) => {
  const { articleId } = route.params;
  const [article, setArticle] = useState(null);
  const [articleBodies, setArticleBodies] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [imageView, setImageView] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [articleImages, setArticleImages] = useState([]); // Lưu hình ảnh từ API mới
  const [loadingComments, setLoadingComments] = useState(true); // Định nghĩa loadingComments

  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  const fetchArticleDetails = async () => {
    try {
      setLoadingComments(true); // Start loading comments
      // Fetch the main article
      const articleResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/${articleId}`
      );

      // Fetch article bodies
      const articleBodiesResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleBodies/getArticleBodyByArticleId/${articleId}`
      );

      // Fetch article images
      const articleImagesResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${articleId}`
      );

      // Fetch likes
      const likesResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${articleId}`
      );

      const userId = await AsyncStorage.getItem("userId");

      // Xử lý likes
      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        setLikes(likesData.length || 0); // Mặc định 0 nếu không có lượt like
        setLiked(likesData.some((like) => like.userId === parseInt(userId)));
      } else {
        setLikes(0); // Mặc định nếu không có dữ liệu
      }

      // Fetch comments
      const commentsResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${articleId}`
      );

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData || []); // Mặc định mảng rỗng nếu không có bình luận
        setCommentCount(commentsData.length || 0);
      } else {
        setComments([]); // Mặc định nếu không có dữ liệu
        setCommentCount(0);
      }

      // Validate and update article details
      if (articleResponse.ok) {
        const articleData = await articleResponse.json();
        setArticle(articleData || {}); // Nếu không có dữ liệu, gán object rỗng
      } else {
        setArticle({}); // Nếu lỗi, gán giá trị mặc định
      }

      // Xử lý article bodies
      if (articleBodiesResponse.ok) {
        const articleBodiesData = await articleBodiesResponse.json();
        setArticleBodies(articleBodiesData || []); // Nếu không có dữ liệu, gán mảng rỗng
      } else if (articleBodiesResponse.status === 404) {
        setArticleBodies([]); // Không báo lỗi nếu không có nội dung
      }

      // Xử lý article images
      if (articleImagesResponse.ok) {
        const articleImagesData = await articleImagesResponse.json();
        setArticleImages(articleImagesData || []); // Nếu không có dữ liệu, gán mảng rỗng
      } else if (articleImagesResponse.status === 404) {
        setArticleImages([]); // Không báo lỗi nếu không có ảnh
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    } finally {
      setLoading(false);
      setLoadingComments(false); // End loading comments
    }
  };

  useEffect(() => {
    fetchArticleDetails();
  }, [articleId]);

  const handleLike = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const url = liked
        ? `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/removeArticleLike`
        : `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleLike`;

      const method = liked ? "DELETE" : "POST";

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify({
          articleId,
          userId,
          likeDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setLiked(!liked);
        setLikes((prev) => (liked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

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
          // Hiển thị thông báo lỗi nếu nội dung không hợp lệ
          let toastMessage =
            "Bình luận của bạn không hợp lệ, hãy bình luận lại nhé!";
          if (checkResult.message.includes("adult language")) {
            toastMessage =
              "Bạn sử dụng ngôn từ thô tục, hãy bình luận lại nhé!";
          } else if (checkResult.message.includes("violent language")) {
            toastMessage =
              "Bạn sử dụng ngôn từ bạo lực, hãy bình luận lại nhé!";
          }

          Toast.show({
            type: "error",
            text1: "Lỗi bình luận",
            text2: toastMessage,
          });
          return;
        }

        // Tiếp tục gửi bình luận nếu nội dung hợp lệ
        const userId = await AsyncStorage.getItem("userId");
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment`,
          {
            method: "POST",
            body: JSON.stringify({
              content: newComment,
              userId,
              articleId,
            }),
          }
        );

        if (response.ok) {
          // Kiểm tra và xử lý nếu API không trả về JSON
          const responseText = await response.text(); // Lấy response dưới dạng text
          const newCommentData = responseText
            ? JSON.parse(responseText) // Nếu có dữ liệu JSON, parse nó
            : {
                content: newComment,
                userId,
                articleId,
                userName: "Ẩn danh",
                avatarUrl: "https://via.placeholder.com/35", // Avatar mặc định
              };

          // Thêm bình luận vào danh sách và reset nội dung input
          setComments((prev) => [newCommentData, ...prev]);
          setNewComment("");
          setCommentCount((prev) => prev + 1);

          Toast.show({
            type: "success",
            text1: "Thành công",
            text2: "Bình luận đã được đăng!",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: "Không thể gửi bình luận, vui lòng thử lại sau.",
          });
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Đã xảy ra lỗi, vui lòng thử lại sau.",
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập nội dung bình luận.",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text>Đang tải nội dung bài viết...</Text>
      </View>
    );
  }

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
        {/* Thông tin bài viết */}
        {/* Article Info */}
        <View style={styles.articleInfo}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{
                uri:
                  article?.authorImageUrl || "https://via.placeholder.com/45",
              }}
              style={styles.authorImage}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.authorName}>
                {article?.authorName || "Ẩn danh"}
              </Text>
              {/* <Text style={styles.articleDate}>
                Ngày đăng:{" "}
                {article?.createdAt
                  ? new Date(article.createdAt).toLocaleDateString()
                  : "Không rõ"}
              </Text> */}

              {/* {article?.moderateDate && (
                <Text style={styles.articleModerateDate}>
                  Ngày duyệt:{" "}
                  {new Date(article.moderateDate).toLocaleDateString()}
                </Text>
              )} */}
            </View>
          </View>

          <Text style={styles.articleTitle}>
            {article?.title || "Không có tiêu đề"}
          </Text>
          <Text style={styles.articleContent}>
            {article?.content || "Không có nội dung"}
          </Text>
          {/* First Article Image */}
          {articleImages.length > 0 && (
            <Image
              source={{ uri: articleImages[0]?.imageUrl }}
              style={styles.articleImage}
            />
          )}
        </View>
        {/* Article Bodies */}
        {articleBodies.map((body, index) => (
          <View key={index} style={styles.bodySection}>
            <Text style={styles.bodyContent}>{body.content}</Text>
            {body.imageUrl && (
              <Image source={{ uri: body.imageUrl }} style={styles.bodyImage} />
            )}
          </View>
        ))}
        {/* Nút hành động */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <IconAnt
              name={liked ? "like1" : "like2"}
              size={24}
              color={liked ? COLORS.green : COLORS.greySolid}
            />
            <Text style={styles.actionText}>{likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon
              name="chatbubble-outline"
              size={24}
              color={COLORS.greySolid}
            />
            <Text style={styles.actionText}>{commentCount || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Khu vực hiển thị bình luận */}
        <View>
          <Text style={styles.commentHeader}>Bình luận</Text>
          {loadingComments ? (
            <Text style={styles.loadingText}>Đang tải bình luận...</Text>
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>Không có bình luận nào</Text>
          ) : (
            comments.map((comment, index) => (
              <View key={index} style={styles.comment}>
                <Image
                  source={{
                    uri: comment.avatarUrl || "https://via.placeholder.com/35",
                  }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>{comment.userName}</Text>
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>{comment.content}</Text>
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  articleInfo: {
    marginBottom: 20,
  },
  authorImage: {
    width: 45,
    height: 45,
    borderRadius: 50,
  },
  authorName: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  articleDate: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.grey,
  },
  articleTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    marginVertical: 10,
  },
  articleContent: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  articleImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 16,
  },
  bodySection: {
    marginBottom: 16,
  },
  bodyContent: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 22,
  },
  bodyImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    marginLeft: 5,
  },
  commentHeader: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
    marginVertical: 10,
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    textAlign: "center",
  },
  noComments: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  comment: {
    flexDirection: "row",
    marginVertical: 10,
  },
  commentAvatar: {
    height: 35,
    width: 35,
    borderRadius: 50,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontFamily: FONTS.semiBold,
    marginBottom: 5,
  },
  commentBox: {
    backgroundColor: COLORS.darkGrey,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentText: {
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },
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
  articleModerateDate: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 2,
  },
});

export default NutritionArticleDetailScreen;
