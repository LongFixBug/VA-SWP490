import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
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
  const [selectedPictureOfArticle, setSelectedPictureOfArticle] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [postImages, setPostImages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userData, setUserData] = useState({});
  const [isCommentOptionsVisible, setIsCommentOptionsVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] =
    useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editCommentText, setEditCommentText] = useState("");
  const [isPostOptionsVisible, setIsPostOptionsVisible] = useState(false);
  const [isDeletePostConfirmationVisible, setIsDeletePostConfirmationVisible] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // New state for loading
  const [invalidWords, setInvalidWords] = useState([]);

  // Hàm hỗ trợ fetch với Authorization
  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  // Hàm hiển thị toast
  const showToast = (type, title, message) => {
    Toast.show({
      type: type,
      text1: title,
      text2: message,
      text1Style: {
        fontSize: 18,
        fontFamily: FONTS.semiBold,
        color: COLORS.black,
      },
      text2Style: {
        fontSize: 15,
        fontFamily: FONTS.medium,
        color: COLORS.grey,
      },
      style: {
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 30,
      },
    });
  };

  // Tải userId và userData từ AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        setCurrentUserId(userId ? parseInt(userId, 10) : null);

        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  // Tạo hàm fetchComments để tái sử dụng
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${post.articleId}`
      );
      const commentsData = await response.text(); // Nếu API trả về text

      // Giả sử commentsData là một chuỗi JSON
      let parsedComments;
      try {
        parsedComments = JSON.parse(commentsData);
      } catch (parseError) {
        console.error("Error parsing comments data:", parseError);
        parsedComments = [];
      }

      const commentsWithUserDetails = await Promise.all(
        parsedComments.map(async (comment) => {
          try {
            const userResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${comment.userId}`
            );
            const userInfo = await userResponse.json();

            return {
              ...comment,
              avatarUrl: userInfo.imageUrl || "https://via.placeholder.com/35",
              userName: userInfo.username || "Ẩn danh",
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

      // Sắp xếp bình luận theo postDate giảm dần (mới nhất trước)
      commentsWithUserDetails.sort(
        (a, b) => new Date(b.postDate) - new Date(a.postDate)
      );

      setComments(commentsWithUserDetails);
      setCommentCount(parsedComments.length);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Tải bình luận khi component mount hoặc khi articleId thay đổi
  useEffect(() => {
    fetchComments();
  }, [post.articleId]);

  // Tải lượt thích và số bình luận (nếu cần)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");

        const likesResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${post.articleId}`
        );
        const likesData = await likesResponse.json();
        setLikes(likesData.length);

        const userLiked = likesData.some(
          (like) => like.userId === parseInt(userId)
        );
        setLiked(userLiked);

        // Đã tải số bình luận trong fetchComments
      } catch (error) {
        console.log("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [post.articleId]);

  // Tải hình ảnh của bài viết
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

  // Xử lý like/unlike bài viết
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
          showToast("success", "Thông báo", "Bạn đã thích bài viết này!❤️");
        } else {
          showToast(
            "error",
            "Lỗi",
            "Không thể thích bài viết. Vui lòng thử lại."
          );
        }
      } else {
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

  // Tải danh sách từ cấm
  useEffect(() => {
    const fetchInvalidWords = async () => {
      try {
        const words = await getInvalidWords();
        setInvalidWords(words);
      } catch (error) {
        console.error("Error fetching invalid words:", error);
      }
    };
    fetchInvalidWords();
  }, []);

  // Hàm lấy danh sách từ cấm
  const getInvalidWords = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/invalid-word/getall",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data; // Mảng các object {id, content}
    } catch (error) {
      console.error("Error fetching invalid words:", error);
      return [];
    }
  };

  // Kiểm tra nội dung bình luận
  const checkCommentContent = (content) => {
    const userCommentLower = content.toLowerCase();

    for (const badWord of invalidWords) {
      const badWordLower = badWord.content.toLowerCase();
      if (userCommentLower.includes(badWordLower)) {
        return {
          success: false,
          message: `Nội dung chứa từ cấm: "${badWord.content}"`,
        };
      }
    }

    return { success: true, message: "Nội dung hợp lệ" };
  };

  // Xử lý đăng bình luận
  const handlePostComment = async () => {
    if (!newComment.trim()) {
      showToast("error", "Lỗi", "Vui lòng nhập nội dung bình luận.");
      return;
    }

    // 1. Kiểm tra nội dung dựa trên mảng invalidWords
    const checkResult = checkCommentContent(newComment);
    if (!checkResult.success) {
      showToast("error", "Lỗi bình luận", checkResult.message);
      return;
    }

    try {
      const userId = currentUserId;

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newComment,
            userId: userId,
            articleId: post.articleId,
          }),
        }
      );

      if (response.ok) {
        // Tái tải danh sách bình luận sau khi đăng thành công
        await fetchComments();

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
  };

  // Các hàm mở/đóng modal tùy chọn bình luận
  const openCommentOptions = (comment) => {
    setSelectedComment(comment);
    setIsCommentOptionsVisible(true);
  };

  const closeCommentOptions = () => {
    setIsCommentOptionsVisible(false);
    setSelectedComment(null);
  };

  // Các hàm mở/đóng modal xác nhận xóa bình luận
  const openDeleteConfirmation = () => {
    setIsCommentOptionsVisible(false);
    setIsDeleteConfirmationVisible(true);
  };

  const closeDeleteConfirmation = () => {
    setIsDeleteConfirmationVisible(false);
    setSelectedComment(null);
  };

  // Xử lý xóa bình luận
  const handleDeleteComment = async () => {
    closeDeleteConfirmation();
    if (selectedComment) {
      try {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/deleteCommentByUserId`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              commentId: selectedComment.commentId,
              userId: selectedComment.userId,
              articleId: selectedComment.articleId,
            }),
          }
        );

        if (response.status === 200) {
          setComments((prevComments) =>
            prevComments.filter(
              (c) => c.commentId !== selectedComment.commentId
            )
          );
          setCommentCount((prev) => prev - 1);
          showToast("success", "Thành công", "Bình luận đã được xóa!");
        } else {
          showToast("error", "Lỗi", "Bạn không thể thực hiện chức năng này");
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        showToast("error", "Lỗi", "Bạn không thể thực hiện chức năng này");
      } finally {
        setSelectedComment(null);
      }
    }
  };

  // Các hàm mở/đóng modal chỉnh sửa bình luận
  const openEditModal = () => {
    setIsCommentOptionsVisible(false);
    setEditCommentText(selectedComment.content);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedComment(null);
    setEditCommentText("");
  };

  // Xử lý chỉnh sửa bình luận
  const handleEditComment = async () => {
    if (editCommentText.trim()) {
      const checkResult = checkCommentContent(editCommentText);
      if (!checkResult.success) {
        showToast("error", "Lỗi bình luận", checkResult.message);
        return;
      }

      try {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/feedbacks/updateCommentByUserId`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              commentId: selectedComment.commentId,
              userId: selectedComment.userId,
              content: editCommentText,
              postDate: selectedComment.postDate,
              userName: selectedComment.userName,
              articleId: selectedComment.articleId,
            }),
          }
        );

        if (response.status === 200) {
          setComments((prevComments) =>
            prevComments.map((c) =>
              c.commentId === selectedComment.commentId
                ? { ...c, content: editCommentText }
                : c
            )
          );
          showToast("success", "Thành công", "Bình luận đã được cập nhật!");
          closeEditModal();
        } else {
          showToast("error", "Lỗi", "Bạn không thể thực hiện chức năng này");
        }
      } catch (error) {
        console.error("Error updating comment:", error);
        showToast("error", "Lỗi", "Bạn không thể thực hiện chức năng này");
      }
    } else {
      showToast("error", "Lỗi", "Nội dung bình luận không được để trống.");
    }
  };

  // Các hàm để fetch và xóa các thành phần liên quan đến bài viết

  // Fetch all likes for an article
  const fetchAllLikes = async (articleId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${articleId}`
      );
      if (response.ok) {
        const likesData = await response.json();
        return likesData;
      } else {
        console.log("Failed to fetch likes:");
        return [];
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
      return [];
    }
  };

  // Delete a single like
  const deleteLike = async (likeId, articleId, userId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/deleteArticleLikeByUserId`,
        {
          method: "DELETE",
          body: JSON.stringify({
            likeId: likeId,
            articleId: articleId,
            userId: userId,
            likeDate: new Date().toISOString(), // Assuming likeDate is required
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete like ${likeId}: ${errorData}`);
      }
    } catch (error) {
      console.error(`Error deleting like ${likeId}:`, error);
      throw error;
    }
  };

  // Fetch all comments for an article
  const fetchAllComments = async (articleId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${articleId}`
      );
      if (response.ok) {
        const commentsData = await response.text(); // Nếu API trả về text

        let parsedComments;
        try {
          parsedComments = JSON.parse(commentsData);
        } catch (parseError) {
          console.error("Error parsing comments data:", parseError);
          parsedComments = [];
        }

        return parsedComments;
      } else {
        console.error("Failed to fetch comments:", await response.text());
        return [];
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  // Delete a single comment
  const deleteComment = async (commentId, userId, articleId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/deleteCommentByUserId`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commentId: commentId,
            userId: userId,
            articleId: articleId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete comment ${commentId}: ${errorData}`);
      }
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      throw error;
    }
  };

  // Fetch all images for an article
  const fetchAllImages = async (articleId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${articleId}`
      );
      if (response.ok) {
        const imagesData = await response.json();
        return imagesData;
      } else {
        console.error("Failed to fetch images:", await response.text());
        return [];
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      return [];
    }
  };

  // Delete a single image
  const deleteImage = async (articleImageId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/deleteArticleImageByArticleImageId/${articleImageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to delete image ${articleImageId}: ${errorData}`
        );
      }
    } catch (error) {
      console.error(`Error deleting image ${articleImageId}:`, error);
      throw error;
    }
  };

  // Hàm xử lý xóa bài viết
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      const userId = await AsyncStorage.getItem("userId");
      const parsedUserId = userId ? parseInt(userId, 10) : null;

      if (!parsedUserId) {
        showToast("error", "Lỗi", "Không tìm thấy thông tin người dùng.");
        return;
      }

      const articleId = post.articleId;

      // Bước 1: Xóa tất cả các Like
      const likes = await fetchAllLikes(articleId);
      for (const like of likes) {
        await deleteLike(like.likeId, articleId, like.userId);
      }

      // Bước 2: Xóa tất cả các Bình luận
      const allComments = await fetchAllComments(articleId);
      for (const comment of allComments) {
        await deleteComment(comment.commentId, comment.userId, articleId);
      }

      // Bước 3: Xóa tất cả các Hình ảnh
      const images = await fetchAllImages(articleId);
      for (const image of images) {
        await deleteImage(image.articleImageId);
      }

      // Bước 4: Xóa bài viết
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/deleteArticleByUserId`,
        {
          method: "DELETE",
          body: JSON.stringify({
            articleId: articleId,
            authorId: parsedUserId,
          }),
        }
      );

      if (response.ok) {
        // Hiển thị toast thành công
        showToast("success", "Thành công", "Bài viết đã được xóa!");

        // Thực hiện điều hướng sau khi toast hiển thị
        setTimeout(() => {
          navigation.goBack();
        }, 100); // Sử dụng một độ trễ nhỏ để đảm bảo toast hiển thị trước
      } else {
        const errorData = await response.json();
        console.error("Failed to delete post", errorData);
        showToast("error", "Lỗi", "Không thể xóa bài viết. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast("error", "Lỗi", "Đã xảy ra lỗi, vui lòng thử lại sau.");
    } finally {
      setIsDeleting(false);
      setIsDeletePostConfirmationVisible(false);
      setIsPostOptionsVisible(false);
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
          {/* Thông tin tác giả và nút "..." nếu là bài viết của người dùng */}
          <View style={styles.authorRow}>
            <TouchableOpacity
              onPress={() => {
                if (currentUserId === post.authorId) {
                  navigation.navigate("Profile"); // Điều hướng đến hồ sơ cá nhân
                } else {
                  navigation.navigate("UserProfileScreen", {
                    userId: post.authorId,
                  });
                }
              }}
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Image
                source={{
                  uri: post.authorImageUrl || "https://via.placeholder.com/45",
                }}
                style={styles.authorImage}
              />
              <View>
                <Text style={styles.authorName}>
                  {post.authorName || "Ẩn danh"}
                </Text>

                {post.moderateDate && (
                  <Text style={styles.articleModerateDate}>
                    Ngày duyệt:{" "}
                    {new Date(post.moderateDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            {currentUserId === post.authorId && (
              <TouchableOpacity
                style={styles.postOptionsButton}
                onPress={() => setIsPostOptionsVisible(true)}
              >
                <Icon
                  name="ellipsis-horizontal"
                  size={18}
                  color={COLORS.greySolid}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Nội dung bài viết */}
          <Text style={styles.articleTitle}>{post.title}</Text>
          <Text style={styles.articleContent}>{post.content}</Text>

          {/* Hình ảnh bài viết */}
          {postImages.length > 0 && (
            <ScrollView horizontal style={styles.imageScroll}>
              {postImages.map((image, index) => (
                <TouchableOpacity
                  key={image.articleImageId || index}
                  onPress={() => {
                    setImageView(true);
                    setSelectedPictureOfArticle(index);
                  }}
                >
                  <Image
                    source={{ uri: image.imageUrl }}
                    style={styles.articleImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

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
                onPress={() => {
                  // Có thể cuộn xuống phần bình luận
                  // Bạn cần thêm ref cho ScrollView và cuộn tới cuối
                }}
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
            comments.map((item) => (
              <View key={item.commentId} style={styles.comment}>
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
                {currentUserId === item.userId && (
                  <TouchableOpacity
                    style={styles.commentOptionsButton}
                    onPress={() => openCommentOptions(item)}
                  >
                    <Icon
                      name="ellipsis-horizontal"
                      size={18}
                      color={COLORS.greySolid}
                    />
                  </TouchableOpacity>
                )}
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
            index={selectedPictureOfArticle}
          />
        </View>
      </Modal>

      {/* Modal tùy chọn bình luận */}
      <Modal
        visible={isCommentOptionsVisible}
        transparent
        onRequestClose={closeCommentOptions}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeCommentOptions}
        >
          <View style={styles.commentOptionsModal}>
            <TouchableOpacity
              style={styles.commentOption}
              onPress={openEditModal}
            >
              <Text style={styles.commentOptionText}>Sửa bình luận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.commentOption}
              onPress={openDeleteConfirmation}
            >
              <Text style={[styles.commentOptionText, { color: "red" }]}>
                Xóa bình luận
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal xác nhận xóa bình luận */}
      <Modal
        visible={isDeleteConfirmationVisible}
        transparent
        onRequestClose={closeDeleteConfirmation}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn xóa bình luận này?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={closeDeleteConfirmation}
              >
                <Text style={styles.textStyle}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonConfirm]}
                onPress={handleDeleteComment}
              >
                <Text style={styles.textStyle}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal sửa bình luận */}
      <Modal
        visible={isEditModalVisible}
        transparent
        onRequestClose={closeEditModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Sửa bình luận</Text>
            <TextInput
              style={styles.editInput}
              multiline
              value={editCommentText}
              onChangeText={setEditCommentText}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={closeEditModal}
              >
                <Text style={styles.textStyle}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonConfirm]}
                onPress={handleEditComment}
              >
                <Text style={styles.textStyle}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal tùy chọn bài viết */}
      <Modal
        visible={isPostOptionsVisible}
        transparent
        onRequestClose={() => setIsPostOptionsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPostOptionsVisible(false)}
        >
          <View style={styles.postOptionsModal}>
            <TouchableOpacity
              style={styles.postOption}
              onPress={() => setIsDeletePostConfirmationVisible(true)}
            >
              <Text style={[styles.postOptionText, { color: "red" }]}>
                Xóa bài viết
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal xác nhận xóa bài viết */}
      <Modal
        visible={isDeletePostConfirmationVisible}
        transparent
        onRequestClose={() => setIsDeletePostConfirmationVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn xóa bài viết này?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setIsDeletePostConfirmationVisible(false)}
              >
                <Text style={styles.textStyle}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonConfirm]}
                onPress={handleDeletePost}
              >
                <Text style={styles.textStyle}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isDeleting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>Đang xóa bài viết...</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  articleInfo: { padding: 10 },
  authorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  authorImage: { width: 45, height: 45, borderRadius: 50, marginRight: 10 },
  authorName: { fontFamily: FONTS.medium, fontSize: 14 },
  articleModerateDate: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 2,
  },
  postOptionsButton: {
    padding: 5,
  },
  articleTitle: { fontFamily: FONTS.semiBold, fontSize: 20, marginTop: 5 },
  articleContent: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
  },
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
  comment: {
    flexDirection: "row",
    marginTop: 15,
    marginHorizontal: 10,
    position: "relative",
  },
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
    backgroundColor: COLORS.white,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    fontFamily: FONTS.medium,
    fontSize: 14,
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
  commentOptionsButton: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  commentOptionsModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  commentOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: "center",
  },
  commentOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.black,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "100%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: "30%",
    alignItems: "center",
  },
  buttonConfirm: {
    backgroundColor: COLORS.green,
  },
  buttonCancel: {
    backgroundColor: COLORS.greySolid,
  },
  textStyle: {
    color: "white",
    fontFamily: FONTS.semiBold,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  editInput: {
    borderWidth: 1,
    borderColor: COLORS.greySolid,
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    width: "100%",
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  postOptionsModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  postOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: "center",
  },
  postOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.black,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
});

export default PostDetailScreen;
