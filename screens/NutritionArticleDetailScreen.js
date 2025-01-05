import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import IconAnt from "react-native-vector-icons/AntDesign";
import Header from "../components/Header";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Toast from "react-native-toast-message";
import ImageViewer from "react-native-image-zoom-viewer";
import { RenderHTML } from "react-native-render-html";
import { Dimensions } from "react-native";
import { HTMLElementModel } from "react-native-render-html";
const { width } = Dimensions.get("window");
import { WebView } from "react-native-webview";

const NutritionArticleDetailScreen = ({ route, navigation }) => {
  const { articleId } = route.params;
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [invalidWords, setInvalidWords] = useState([]);
  const [isCommentOptionsVisible, setIsCommentOptionsVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] =
    useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editCommentText, setEditCommentText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

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
    });
  };

  // Tải userId và danh sách từ cấm khi component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Tải userId
        const userId = await AsyncStorage.getItem("userId");
        setCurrentUserId(userId ? parseInt(userId, 10) : null);

        // Tải danh sách từ cấm
        const words = await fetchWithAuth(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/invalid-word/getall",
          {
            method: "GET",
          }
        );
        if (words.ok) {
          const data = await words.json();
          setInvalidWords(data); // Mảng các object {id, content}
        } else {
          console.error("Failed to fetch invalid words:", await words.text());
        }

        // Tải chi tiết bài viết và bình luận
        await fetchArticleDetails();
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    loadInitialData();
  }, [articleId]);

  const fetchArticleDetails = async () => {
    try {
      setLoadingComments(true);
      const articleResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/${articleId}`
      );
      const likesResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${articleId}`
      );
      const userId = await AsyncStorage.getItem("userId");
      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        setLikes(likesData.length || 0);
        setLiked(likesData.some((like) => like.userId === parseInt(userId)));
      } else {
        setLikes(0);
      }
      const commentsResponse = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${articleId}`
      );
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        const enrichedComments = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const userResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${comment.userId}`
              );
              const userData = await userResponse.json();
              return {
                ...comment,
                userName: userData.username || "Ẩn danh",
                avatarUrl:
                  userData.imageUrl || "https://via.placeholder.com/35",
              };
            } catch (error) {
              console.error(
                `Error fetching user details for userId ${comment.userId}:`,
                error
              );
              return {
                ...comment,
                userName: "Ẩn danh",
                avatarUrl: "https://via.placeholder.com/35",
              };
            }
          })
        );
        // Sắp xếp bình luận theo postDate giảm dần (mới nhất trước)
        enrichedComments.sort(
          (a, b) => new Date(b.postDate) - new Date(a.postDate)
        );
        setComments(enrichedComments || []);
        setCommentCount(enrichedComments.length || 0);
      } else {
        setComments([]);
        setCommentCount(0);
      }
      if (articleResponse.ok) {
        const articleData = await articleResponse.json();
        const processedContent = await processArticleContent(
          articleData.content
        );
        setArticle({ ...articleData, processedContent } || {});
      } else {
        setArticle({});
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    } finally {
      setLoading(false);
      setLoadingComments(false);
    }
  };

  const processArticleContent = async (htmlContent) => {
    if (!htmlContent) return htmlContent;
    let processedHtml = htmlContent.replace(
      /<\/figure>(?=<p>)/g,
      "</figure><br /><p>"
    );
    return processedHtml;
  };

  const handleLike = async () => {
    try {
      if (!currentUserId) {
        showToast(
          "error",
          "Lỗi",
          "Bạn cần đăng nhập để thực hiện hành động này."
        );
        return;
      }

      const url = liked
        ? `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/deleteArticleLikeByUserId`
        : `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleLike`;
      const method = liked ? "DELETE" : "POST";
      const bodyData = {
        articleId,
        userId: currentUserId,
        likeDate: new Date().toISOString(),
      };
      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(bodyData),
      });
      if (response.ok) {
        setLiked(!liked);
        setLikes((prev) => (liked ? Math.max(prev - 1, 0) : prev + 1));
        showToast(
          "success",
          "Thành công",
          liked ? "Bạn đã bỏ thích bài viết này!" : "Bạn đã thích bài viết này!"
        );
      } else {
        showToast(
          "error",
          "Lỗi",
          "Không thể thực hiện hành động. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi khi xử lý like/unlike:", error);
      showToast("error", "Lỗi", "Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  // **Chỉnh Sửa Phần Kiểm Tra Nội Dung Bình Luận**
  const checkCommentContent = (content) => {
    const userCommentLower = content.toLowerCase();

    for (const badWord of invalidWords) {
      const badWordLower = badWord.content.toLowerCase();
      if (userCommentLower.includes(badWordLower)) {
        return {
          success: false,
          message: `Nội dung bình luận có chứa từ cấm: "${badWord.content}"`,
        };
      }
    }

    return { success: true, message: "Content is valid." };
  };

  // **Chỉnh Sửa Hàm Xử Lý Đăng Bình Luận**
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
      if (!currentUserId) {
        showToast("error", "Lỗi", "Không tìm thấy thông tin người dùng.");
        return;
      }

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newComment,
            userId: currentUserId,
            articleId: articleId,
          }),
        }
      );

      if (response.ok) {
        // Tải lại danh sách bình luận sau khi đăng thành công
        await fetchArticleDetails();

        setNewComment("");
        // Đã xóa dòng tăng commentCount ở đây

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
      showToast({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi, vui lòng thử lại sau.",
      });
    }
  };

  // **Thêm Chức Năng Mở Modal Tùy Chọn Bình Luận**
  const openCommentOptions = (comment) => {
    setSelectedComment(comment);
    setIsCommentOptionsVisible(true);
  };

  const closeCommentOptions = () => {
    setIsCommentOptionsVisible(false);
    setSelectedComment(null);
  };

  // **Thêm Chức Năng Mở/Đóng Modal Xác Nhận Xóa Bình Luận**
  const openDeleteConfirmation = () => {
    setIsCommentOptionsVisible(false);
    setIsDeleteConfirmationVisible(true);
  };

  const closeDeleteConfirmation = () => {
    setIsDeleteConfirmationVisible(false);
    setSelectedComment(null);
  };

  // **Thêm Chức Năng Xóa Bình Luận**
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
          // Tải lại danh sách bình luận sau khi xóa thành công
          await fetchArticleDetails();

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

  // **Thêm Chức Năng Mở/Đóng Modal Chỉnh Sửa Bình Luận**
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

  // **Thêm Chức Năng Chỉnh Sửa Bình Luận**
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
          // Tải lại danh sách bình luận sau khi chỉnh sửa thành công
          await fetchArticleDetails();

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

  const replaceOembedWithIframe = (htmlContent) => {
    if (!htmlContent) return htmlContent;
    const div = document.createElement("div");
    div.innerHTML = htmlContent;
    const oembedElements = div.querySelectorAll("oembed");
    oembedElements.forEach((oembed) => {
      const url = oembed.getAttribute("url");
      if (url && url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        const iframe = document.createElement("iframe");
        iframe.setAttribute("width", "560");
        iframe.setAttribute("height", "315");
        iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute(
          "allow",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        );
        iframe.setAttribute("allowfullscreen", "true");

        oembed.replaceWith(iframe);
      }
    });
    return div.innerHTML;
  };

  const customRenderers = {
    oembed: ({ TDefaultRenderer, tnode }) => {
      const oembedUrl = tnode.attributes.url;
      if (!oembedUrl) return null;
      if (oembedUrl.includes("youtube.com") || oembedUrl.includes("youtu.be")) {
        return (
          <WebView
            source={{ uri: oembedUrl }}
            style={{
              width: "100%",
              height: 200,
              marginVertical: 10,
            }}
            javaScriptEnabled={true}
            allowsFullscreenVideo={true}
          />
        );
      }
      return <Text>Unsupported embed format</Text>;
    },
  };

  const customHTMLElementModels = {
    oembed: HTMLElementModel.fromCustomModel({
      tagName: "oembed",
      mixedUAStyles: {
        width: "100%",
        height: 200,
      },
      contentModel: "void",
    }),
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text>Đang tải nội dung bài viết...</Text>
      </View>
    );
  }

  const handleImagePress = (src) => {
    setFullScreenImage(src);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
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
        {/* Thông tin bài viết */}
        {/* Article Info */}
        <View style={styles.articleInfo}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{
                uri:
                  article?.authorImageUrl ||
                  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?t=st=1731033718~exp=1731037318~hmac=2705f80ce81289818508e796cf321f2dbc40c8b93ee5cbe6aaf29a1728c38682&w=740",
              }}
              style={styles.authorImage}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.authorName}>
                {article?.authorName || "Ẩn danh"}
              </Text>
              {article?.moderateDate && (
                <Text style={styles.articleModerateDate}>
                  Ngày duyệt:{" "}
                  {new Date(article.moderateDate).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.articleTitleContainer}>
            <Text style={styles.articleTitle}>{article?.title}</Text>
          </View>

          {/* Render Image from content */}
          {article?.content && (
            <TouchableOpacity
              onPress={() => handleImagePress(article?.content)}
            >
              <View style={styles.contentContainer}>
                <RenderHTML
                  contentWidth={width}
                  source={{
                    html:
                      article?.processedContent || "<p>Không có nội dung</p>",
                  }}
                  customHTMLElementModels={customHTMLElementModels}
                  renderers={customRenderers}
                  ignoredDomTags={["iframe"]}
                  tagsStyles={{
                    p: {
                      fontFamily: FONTS.medium,
                      fontSize: 14,
                      color: COLORS.black,
                      marginBottom: 10,
                    },
                    h1: {
                      fontFamily: FONTS.semiBold,
                      fontSize: 20,
                      color: COLORS.black,
                      marginBottom: 10,
                    },
                    img: {
                      marginTop: 10,
                      width: "100%", // Đảm bảo ảnh không quá kích thước cha
                      height: "auto",
                      resizeMode: "contain",
                    },
                  }}
                />
              </View>
            </TouchableOpacity>
          )}

          {/* Nếu có URL YouTube riêng */}
          {article?.youtubeUrl && (
            <WebView
              source={{ uri: article.youtubeUrl }}
              style={{ width: "100%", height: 200, marginTop: 10 }}
              javaScriptEnabled={true}
              allowsFullscreenVideo={true}
            />
          )}
        </View>
        {/* Nút hành động */}
        <View style={styles.actions}>
          {/* Nút like */}
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <IconAnt
              name={liked ? "like1" : "like2"}
              size={24}
              color={liked ? COLORS.green : COLORS.greySolid}
            />
            <Text style={styles.actionText}>{likes || 0}</Text>
          </TouchableOpacity>

          {/* Nút comment */}
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
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
            comments.map((comment) => (
              <View key={comment.commentId} style={styles.comment}>
                <Image
                  source={{
                    uri: comment.avatarUrl || "https://via.placeholder.com/35",
                  }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("UserProfileScreen", {
                        userId: comment.userId,
                      })
                    }
                  >
                    <Text style={styles.commentAuthor}>{comment.userName}</Text>
                  </TouchableOpacity>
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                </View>
                {comment.userId === currentUserId && (
                  <TouchableOpacity
                    style={styles.commentOptionsButton}
                    onPress={() => openCommentOptions(comment)}
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
      {/* Modal hiển thị ảnh full màn hình */}
      <Modal
        visible={!!fullScreenImage}
        transparent={true}
        onRequestClose={closeFullScreenImage}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeFullScreenImage}
          >
            <Icon name="close-circle-outline" size={30} color={COLORS.white} />
          </TouchableOpacity>

          <ImageViewer
            imageUrls={[{ url: fullScreenImage }]}
            enableSwipeDown={true}
            onSwipeDown={closeFullScreenImage}
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
  articleTitleContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  articleTitle: { fontFamily: FONTS.semiBold, fontSize: 20 },
  contentContainer: {
    marginBottom: 15,
    flex: 1,
  },
  imageContainer: {
    marginBottom: 16,
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
    marginVertical: 10,
  },
  bodyImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "contain",
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 30,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
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
});

export default NutritionArticleDetailScreen;

// import React, { useEffect, useState } from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   ScrollView,
//   Image,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Modal,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Icon from "react-native-vector-icons/Ionicons";
// import IconAnt from "react-native-vector-icons/AntDesign";
// import Header from "../components/Header";
// import COLORS from "../constants/color";
// import FONTS from "../constants/font";
// import Toast from "react-native-toast-message";
// import ImageViewer from "react-native-image-zoom-viewer";
// import { RenderHTML } from "react-native-render-html";
// import { Dimensions } from "react-native";
// import { HTMLElementModel } from "react-native-render-html";
// const { width } = Dimensions.get("window");
// import { WebView } from "react-native-webview";

// const NutritionArticleDetailScreen = ({ route, navigation }) => {
//   const { articleId } = route.params;
//   const [article, setArticle] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newComment, setNewComment] = useState("");
//   const [liked, setLiked] = useState(false);
//   const [likes, setLikes] = useState(0);
//   const [commentCount, setCommentCount] = useState(0);
//   const [fullScreenImage, setFullScreenImage] = useState(null);
//   const [loadingComments, setLoadingComments] = useState(true);

//   const fetchWithAuth = async (url, options = {}) => {
//     const token = await AsyncStorage.getItem("authToken");
//     const headers = {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//       ...options.headers,
//     };
//     return fetch(url, { ...options, headers });
//   };

//   const fetchArticleDetails = async () => {
//     try {
//       setLoadingComments(true);
//       const articleResponse = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/${articleId}`
//       );
//       const likesResponse = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${articleId}`
//       );
//       const userId = await AsyncStorage.getItem("userId");
//       if (likesResponse.ok) {
//         const likesData = await likesResponse.json();
//         setLikes(likesData.length || 0);
//         setLiked(likesData.some((like) => like.userId === parseInt(userId)));
//       } else {
//         setLikes(0);
//       }
//       const commentsResponse = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${articleId}`
//       );
//       if (commentsResponse.ok) {
//         const commentsData = await commentsResponse.json();
//         const enrichedComments = await Promise.all(
//           commentsData.map(async (comment) => {
//             try {
//               const userResponse = await fetchWithAuth(
//                 `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${comment.userId}`
//               );
//               const userData = await userResponse.json();
//               return {
//                 ...comment,
//                 userName: userData.username || "Ẩn danh",
//                 avatarUrl:
//                   userData.imageUrl || "https://via.placeholder.com/35",
//               };
//             } catch (error) {
//               console.error(
//                 `Error fetching user details for userId ${comment.userId}:`,
//                 error
//               );
//               return {
//                 ...comment,
//                 userName: "Ẩn danh",
//                 avatarUrl: "https://via.placeholder.com/35",
//               };
//             }
//           })
//         );
//         setComments(enrichedComments || []);
//         setCommentCount(enrichedComments.length || 0);
//       } else {
//         setComments([]);
//         setCommentCount(0);
//       }
//       if (articleResponse.ok) {
//         const articleData = await articleResponse.json();
//         const processedContent = await processArticleContent(
//           articleData.content
//         );
//         setArticle({ ...articleData, processedContent } || {});
//       } else {
//         setArticle({});
//       }
//     } catch (error) {
//       console.error("Error fetching article details:", error);
//     } finally {
//       setLoading(false);
//       setLoadingComments(false);
//     }
//   };
//   const processArticleContent = async (htmlContent) => {
//     if (!htmlContent) return htmlContent;
//     let processedHtml = htmlContent.replace(
//       /<\/figure>(?=<p>)/g,
//       "</figure><br /><p>"
//     );
//     return processedHtml;
//   };
//   useEffect(() => {
//     fetchArticleDetails();
//   }, [articleId]);

//   const handleLike = async () => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         console.error("Không tìm thấy userId trong AsyncStorage.");
//         Toast.show({
//           type: "error",
//           text1: "Lỗi",
//           text2: "Bạn cần đăng nhập để thực hiện hành động này.",
//         });
//         return;
//       }
//       const url = liked
//         ? `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/deleteArticleLikeByUserId`
//         : `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleLike`;
//       const method = liked ? "DELETE" : "POST";
//       const bodyData = {
//         articleId,
//         userId,
//         likeDate: new Date().toISOString(),
//       };
//       const response = await fetchWithAuth(url, {
//         method,
//         body: JSON.stringify(bodyData),
//       });
//       if (response.ok) {
//         setLiked(!liked);
//         setLikes((prev) => (liked ? Math.max(prev - 1, 0) : prev + 1));
//         Toast.show({
//           type: "success",
//           text1: "Thành công",
//           text2: liked
//             ? "Bạn đã bỏ thích bài viết này!"
//             : "Bạn đã thích bài viết này!",
//         });
//       } else {
//         Toast.show({
//           type: "error",
//           text1: "Lỗi",
//           text2: "Không thể thực hiện hành động. Vui lòng thử lại.",
//         });
//       }
//     } catch (error) {
//       console.error("Lỗi khi xử lý like/unlike:", error);
//       Toast.show({
//         type: "error",
//         text1: "Lỗi",
//         text2: "Đã xảy ra lỗi, vui lòng thử lại sau.",
//       });
//     }
//   };

//   const checkCommentContent = async (content) => {
//     try {
//       const words = content.split(/\s+/);
//       for (let word of words) {
//         const response = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/check-comment-content?Content=${encodeURIComponent(
//             word
//           )}`,
//           {
//             method: "GET",
//           }
//         );
//         if (!response.ok) {
//           return { success: false, message: "Invalid content detected." };
//         }
//         const result = await response.json();
//         if (!result.success) {
//           return {
//             success: false,
//             message: `Invalid content detected: "${word}"`,
//           };
//         }
//       }
//       return { success: true, message: "Content is valid." };
//     } catch (error) {
//       console.error("Error checking comment content:", error);
//       return { success: false, message: "Error checking content." };
//     }
//   };

//   const handlePostComment = async () => {
//     if (newComment.trim()) {
//       try {
//         const checkResult = await checkCommentContent(newComment);
//         if (!checkResult.success) {
//           let toastMessage =
//             "Bình luận của bạn không hợp lệ, hãy bình luận lại nhé!";
//           if (checkResult.message.includes("adult language")) {
//             toastMessage =
//               "Bạn sử dụng ngôn từ thô tục, hãy bình luận lại nhé!";
//           } else if (checkResult.message.includes("violent language")) {
//             toastMessage =
//               "Bạn sử dụng ngôn từ bạo lực, hãy bình luận lại nhé!";
//           }
//           Toast.show({
//             type: "error",
//             text1: "Lỗi bình luận",
//             text2: toastMessage,
//           });
//           return;
//         }
//         const userId = await AsyncStorage.getItem("userId");
//         const response = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment`,
//           {
//             method: "POST",
//             body: JSON.stringify({
//               content: newComment,
//               userId,
//               articleId,
//             }),
//           }
//         );
//         if (response.ok) {
//           const storedUserData = await AsyncStorage.getItem("userData");
//           const parsedUserData = storedUserData
//             ? JSON.parse(storedUserData)
//             : {};
//           const userName = parsedUserData.username || "Ẩn danh";
//           const avatarUrl =
//             parsedUserData.imageUrl || "https://via.placeholder.com/35";
//           const newCommentData = {
//             content: newComment,
//             userId,
//             articleId,
//             userName,
//             avatarUrl,
//           };
//           setComments((prev) => [newCommentData, ...prev]);
//           setNewComment("");
//           setCommentCount((prev) => prev + 1);
//           Toast.show({
//             type: "success",
//             text1: "Thành công",
//             text2: "Bình luận đã được đăng!",
//           });
//         } else {
//           Toast.show({
//             type: "error",
//             text1: "Lỗi",
//             text2: "Không thể gửi bình luận, vui lòng thử lại sau.",
//           });
//         }
//       } catch (error) {
//         console.error("Error posting comment:", error);
//         Toast.show({
//           type: "error",
//           text1: "Lỗi",
//           text2: "Đã xảy ra lỗi, vui lòng thử lại sau.",
//         });
//       }
//     } else {
//       Toast.show({
//         type: "error",
//         text1: "Lỗi",
//         text2: "Vui lòng nhập nội dung bình luận.",
//       });
//     }
//   };

//   const replaceOembedWithIframe = (htmlContent) => {
//     if (!htmlContent) return htmlContent;
//     const div = document.createElement("div");
//     div.innerHTML = htmlContent;
//     const oembedElements = div.querySelectorAll("oembed");
//     oembedElements.forEach((oembed) => {
//       const url = oembed.getAttribute("url");
//       if (url && url.includes("youtube.com/watch")) {
//         const videoId = new URL(url).searchParams.get("v");
//         const iframe = document.createElement("iframe");
//         iframe.setAttribute("width", "560");
//         iframe.setAttribute("height", "315");
//         iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
//         iframe.setAttribute("frameborder", "0");
//         iframe.setAttribute(
//           "allow",
//           "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//         );
//         iframe.setAttribute("allowfullscreen", "true");

//         oembed.replaceWith(iframe);
//       }
//     });
//     return div.innerHTML;
//   };
//   const customRenderers = {
//     oembed: ({ TDefaultRenderer, tnode }) => {
//       const oembedUrl = tnode.attributes.url;
//       if (!oembedUrl) return null;
//       if (oembedUrl.includes("youtube.com") || oembedUrl.includes("youtu.be")) {
//         return (
//           <WebView
//             source={{ uri: oembedUrl }}
//             style={{
//               width: "100%",
//               height: 200,
//               marginVertical: 10,
//             }}
//             javaScriptEnabled={true}
//             allowsFullscreenVideo={true}
//           />
//         );
//       }
//       return <Text>Unsupported embed format</Text>;
//     },
//   };
//   const customHTMLElementModels = {
//     oembed: HTMLElementModel.fromCustomModel({
//       tagName: "oembed",
//       mixedUAStyles: {
//         width: "100%",
//         height: 200,
//       },
//       contentModel: "void",
//     }),
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.green} />
//         <Text>Đang tải nội dung bài viết...</Text>
//       </View>
//     );
//   }
//   const handleImagePress = (src) => {
//     setFullScreenImage(src);
//   };
//   const closeFullScreenImage = () => {
//     setFullScreenImage(null);
//   };

//   return (
//     <>
//       <Header
//         title="Chi tiết bài viết"
//         leftIcon="close"
//         colorBackground={COLORS.white}
//         colorText={COLORS.black}
//         onPress={() => navigation.goBack()}
//       />
//       <ScrollView style={styles.container}>
//         {/* Thông tin bài viết */}
//         {/* Article Info */}
//         <View style={styles.articleInfo}>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Image
//               source={{
//                 uri:
//                   article?.authorImageUrl ||
//                   "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?t=st=1731033718~exp=1731037318~hmac=2705f80ce81289818508e796cf321f2dbc40c8b93ee5cbe6aaf29a1728c38682&w=740",
//               }}
//               style={styles.authorImage}
//             />
//             <View style={{ marginLeft: 10 }}>
//               <Text style={styles.authorName}>
//                 {article?.authorName || "Ẩn danh"}
//               </Text>
//               {article?.moderateDate && (
//                 <Text style={styles.articleModerateDate}>
//                   Ngày duyệt:{" "}
//                   {new Date(article.moderateDate).toLocaleDateString()}
//                 </Text>
//               )}
//             </View>
//           </View>

//           <View style={styles.articleTitleContainer}>
//             <Text style={styles.articleTitle}>{article?.title}</Text>
//           </View>

//           {/* Render Image from content */}
//           {article?.content && (
//             <TouchableOpacity
//               onPress={() => handleImagePress(article?.content)}
//             >
//               <View style={styles.contentContainer}>
//                 <RenderHTML
//                   contentWidth={width}
//                   source={{
//                     html:
//                       article?.processedContent || "<p>Không có nội dung</p>",
//                   }}
//                   customHTMLElementModels={customHTMLElementModels}
//                   renderers={customRenderers}
//                   ignoredDomTags={["iframe"]}
//                   tagsStyles={{
//                     p: {
//                       fontFamily: FONTS.medium,
//                       fontSize: 14,
//                       color: COLORS.black,
//                       marginBottom: 10,
//                     },
//                     h1: {
//                       fontFamily: FONTS.semiBold,
//                       fontSize: 20,
//                       color: COLORS.black,
//                       marginBottom: 10,
//                     },
//                     img: {
//                       marginTop: 10,
//                       width: "100%", // Đảm bảo ảnh không quá kích thước cha
//                       height: "auto",
//                       resizeMode: "contain",
//                     },
//                   }}
//                 />
//               </View>
//             </TouchableOpacity>
//           )}

//           {/* Nếu có URL YouTube riêng */}
//           {article?.youtubeUrl && (
//             <WebView
//               source={{ uri: article.youtubeUrl }}
//               style={{ width: "100%", height: 200, marginTop: 10 }}
//               javaScriptEnabled={true}
//               allowsFullscreenVideo={true}
//             />
//           )}
//         </View>
//         {/* Nút hành động */}
//         <View style={styles.actions}>
//           {/* Nút like */}
//           <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
//             <IconAnt
//               name={liked ? "like1" : "like2"}
//               size={24}
//               color={liked ? COLORS.green : COLORS.greySolid}
//             />
//             <Text style={styles.actionText}>{likes || 0}</Text>
//           </TouchableOpacity>

//           {/* Nút comment */}
//           <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
//             <Icon
//               name="chatbubble-outline"
//               size={24}
//               color={COLORS.greySolid}
//             />
//             <Text style={styles.actionText}>{commentCount || 0}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Khu vực hiển thị bình luận */}
//         <View>
//           <Text style={styles.commentHeader}>Bình luận</Text>
//           {loadingComments ? (
//             <Text style={styles.loadingText}>Đang tải bình luận...</Text>
//           ) : comments.length === 0 ? (
//             <Text style={styles.noComments}>Không có bình luận nào</Text>
//           ) : (
//             comments.map((comment, index) => (
//               <View key={index} style={styles.comment}>
//                 <Image
//                   source={{
//                     uri: comment.avatarUrl || "https://via.placeholder.com/35",
//                   }}
//                   style={styles.commentAvatar}
//                 />
//                 <View style={styles.commentContent}>
//                   <Text style={styles.commentAuthor}>{comment.userName}</Text>
//                   <View style={styles.commentBox}>
//                     <Text style={styles.commentText}>{comment.content}</Text>
//                   </View>
//                 </View>
//               </View>
//             ))
//           )}
//         </View>
//       </ScrollView>
//       {/* Modal hiển thị ảnh full màn hình */}
//       <Modal
//         visible={!!fullScreenImage}
//         transparent={true}
//         onRequestClose={closeFullScreenImage}
//       >
//         <View style={styles.modalContainer}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={closeFullScreenImage}
//           >
//             <Icon name="close-circle-outline" size={30} color={COLORS.white} />
//           </TouchableOpacity>

//           <ImageViewer
//             imageUrls={[{ url: fullScreenImage }]}
//             enableSwipeDown={true}
//             onSwipeDown={closeFullScreenImage}
//           />
//         </View>
//       </Modal>

//       {/* Input để nhập bình luận */}
//       <View style={styles.commentInputContainer}>
//         <TextInput
//           style={styles.commentInput}
//           placeholder="Viết bình luận..."
//           value={newComment}
//           onChangeText={setNewComment}
//         />
//         <TouchableOpacity onPress={handlePostComment}>
//           <Icon name="send-outline" size={24} color={COLORS.green} />
//         </TouchableOpacity>
//       </View>

//       {/* Toast Message */}
//       <Toast />
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   articleInfo: {
//     marginBottom: 20,
//   },
//   authorImage: {
//     width: 45,
//     height: 45,
//     borderRadius: 50,
//   },
//   authorName: {
//     fontFamily: FONTS.medium,
//     fontSize: 14,
//   },
//   articleDate: {
//     fontFamily: FONTS.medium,
//     fontSize: 12,
//     color: COLORS.grey,
//   },
//   articleTitleContainer: {
//     marginTop: 5,
//     marginBottom: 10,
//   },
//   articleTitle: { fontFamily: FONTS.semiBold, fontSize: 20 },
//   contentContainer: {
//     marginBottom: 15,
//     flex: 1,
//   },
//   imageContainer: {
//     marginBottom: 16,
//   },
//   articleImage: {
//     width: "100%",
//     height: 200,
//     borderRadius: 8,
//     marginVertical: 16,
//   },
//   bodySection: {
//     marginBottom: 16,
//   },
//   bodyContent: {
//     fontFamily: FONTS.medium,
//     fontSize: 14,
//     lineHeight: 22,
//     marginVertical: 10,
//   },
//   bodyImage: {
//     width: "100%",
//     height: 200,
//     borderRadius: 8,
//     resizeMode: "contain",
//     marginTop: 10,
//   },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     alignItems: "center",
//     marginTop: 30,
//   },
//   actionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 20,
//   },
//   actionText: {
//     fontFamily: FONTS.medium,
//     fontSize: 16,
//     marginLeft: 5,
//   },
//   commentHeader: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 17,
//     marginVertical: 10,
//   },
//   loadingText: {
//     fontFamily: FONTS.medium,
//     fontSize: 14,
//     textAlign: "center",
//   },
//   noComments: {
//     fontFamily: FONTS.medium,
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   comment: {
//     flexDirection: "row",
//     marginVertical: 10,
//   },
//   commentAvatar: {
//     height: 35,
//     width: 35,
//     borderRadius: 50,
//     marginRight: 10,
//   },
//   commentContent: {
//     flex: 1,
//   },
//   commentAuthor: {
//     fontFamily: FONTS.semiBold,
//     marginBottom: 5,
//   },
//   commentBox: {
//     backgroundColor: COLORS.darkGrey,
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   commentText: {
//     fontFamily: FONTS.medium,
//     lineHeight: 20,
//   },
//   commentInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.lightGray,
//   },
//   commentInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: COLORS.lightGray,
//     borderRadius: 20,
//     padding: 10,
//     marginRight: 10,
//   },
//   articleModerateDate: {
//     fontFamily: FONTS.medium,
//     fontSize: 12,
//     color: COLORS.grey,
//     marginTop: 2,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   closeButton: {
//     position: "absolute",
//     top: 20,
//     right: 20,
//   },
//   fullScreenImage: {
//     width: "100%",
//     height: "100%",
//   },
// });

// export default NutritionArticleDetailScreen;
