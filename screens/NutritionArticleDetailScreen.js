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
  useEffect(() => {
    fetchArticleDetails();
  }, [articleId]);

  const handleLike = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("Không tìm thấy userId trong AsyncStorage.");
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Bạn cần đăng nhập để thực hiện hành động này.",
        });
        return;
      }
      const url = liked
        ? `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/deleteArticleLikeByUserId`
        : `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleLike`;
      const method = liked ? "DELETE" : "POST";
      const bodyData = {
        articleId,
        userId,
        likeDate: new Date().toISOString(),
      };
      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(bodyData),
      });
      if (response.ok) {
        setLiked(!liked);
        setLikes((prev) => (liked ? Math.max(prev - 1, 0) : prev + 1));
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: liked
            ? "Bạn đã bỏ thích bài viết này!"
            : "Bạn đã thích bài viết này!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể thực hiện hành động. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Lỗi khi xử lý like/unlike:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi, vui lòng thử lại sau.",
      });
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
          const storedUserData = await AsyncStorage.getItem("userData");
          const parsedUserData = storedUserData
            ? JSON.parse(storedUserData)
            : {};
          const userName = parsedUserData.username || "Ẩn danh";
          const avatarUrl =
            parsedUserData.imageUrl || "https://via.placeholder.com/35";
          const newCommentData = {
            content: newComment,
            userId,
            articleId,
            userName,
            avatarUrl,
          };
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

          <View style={styles.titleContainer}>
            <RenderHTML
              contentWidth={width}
              source={{ html: article?.title || "<p>Không có nội dung</p>" }}
              customHTMLElementModels={customHTMLElementModels}
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
              }}
            />
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
  titleContainer: {
    marginBottom: 10,
  },
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
});

export default NutritionArticleDetailScreen;
