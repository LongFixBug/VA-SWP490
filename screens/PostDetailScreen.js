import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Ionicons";
import IconAnt from "react-native-vector-icons/AntDesign";
import Header from "../components/Header";
import ImageViewer from "react-native-image-zoom-viewer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DetailArticleScreen = ({ navigation, route }) => {
  const { post } = route.params; // Dữ liệu bài viết được truyền vào từ route
  const [imageView, setImageView] = useState(false);
  const [selectedpictureOfArticle, setSelectedpictureOfArticle] = useState(0);
  const [comments, setComments] = useState([]); // Bình luận
  const [newComment, setNewComment] = useState(""); // Nội dung bình luận mới
  const [loadingComments, setLoadingComments] = useState(true);

  // Hàm fetch dữ liệu với xác thực
  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
      console.error("Không tìm thấy token.");
      throw new Error("Unauthorized: Missing token");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        console.error("Token hết hạn hoặc không hợp lệ.");
      }
      return response;
    } catch (error) {
      console.error("Error fetching with auth:", error);
      throw error;
    }
  };

  // Lấy dữ liệu bình luận từ API khi màn hình được mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${post.articleId}`
        );
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [post.articleId]);

  const handlePostComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: newComment,
              userId: post.authorId,
              articleId: post.articleId,
            }),
          }
        );

        if (response.ok || response.status === 201) {
          const storedUserData = await AsyncStorage.getItem("userData");
          const { username } = JSON.parse(storedUserData) || {
            username: "Ẩn danh",
          };

          const newCommentData = {
            content: newComment,
            userId: post.authorId,
            articleId: post.articleId,
            userName: username,
          };

          setComments((prevComments) => [newCommentData, ...prevComments]);
          setNewComment("");
        } else {
          const errorText = await response.text();
          console.error("Failed to post comment:", errorText);
        }
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    }
  };

  // Hàm hiển thị từng bình luận
  return (
    <>
      <Header
        title={"Chi tiết bài viết"}
        leftIcon={"close"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white }}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }} // Thêm paddingBottom
      >
        {/* Thông tin bài viết */}
        <View style={{ backgroundColor: COLORS.white, padding: 10 }}>
          {/* Tác giả */}
          <View style={{ flexDirection: "row" }}>
            <Image
              source={{
                uri: post.authorImageUrl || "https://via.placeholder.com/45",
              }}
              style={{
                width: 45,
                height: 45,
                borderRadius: 50,
                marginRight: 10,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.medium, fontSize: 14 }}>
                {post.authorName || "Ẩn danh"}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  fontSize: 12,
                  marginTop: 3,
                  color: COLORS.grey,
                }}
              >
                {post.createdAt}
              </Text>
            </View>
          </View>

          {/* Nội dung bài viết */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontFamily: FONTS.semiBold, fontSize: 15 }}>
              {post.title}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 14,
                lineHeight: 22,
                marginTop: 5,
              }}
            >
              {post.content}
            </Text>

            {/* Hình ảnh */}
            <ScrollView horizontal style={{ marginTop: 10 }}>
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
                      style={{
                        width: 200,
                        height: 150,
                        borderRadius: 8,
                        marginLeft: index === 0 ? 0 : 10,
                      }}
                    />
                  </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Like và Comment */}
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 20,
                }}
              >
                <IconAnt name="like1" size={28} color={COLORS.green} />
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    fontSize: 16,
                    color: COLORS.green,
                    marginLeft: 5,
                  }}
                >
                  {post.likes || 0}
                </Text>
              </TouchableOpacity>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="chatbubble-outline" size={27} color={COLORS.grey} />
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    fontSize: 16,
                    color: COLORS.grey,
                    marginLeft: 5,
                  }}
                >
                  {comments.length}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Danh sách bình luận */}
        <View style={{ marginTop: 15 }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 17,
              marginTop: 15,
              marginBottom: 10,
            }}
          >
            Bình luận
          </Text>
          {comments.length === 0 ? (
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 14,
                textAlign: "center",
                color: COLORS.grey,
                marginBottom: 20, // Khoảng cách với phần input
              }}
            >
              Không có bình luận nào
            </Text>
          ) : (
            comments.map((item, index) => (
              <View
                key={index}
                style={{
                  marginTop: 15,
                  flexDirection: "row",
                  marginBottom: index === comments.length - 1 ? 20 : 0, // Thêm marginBottom cho bình luận cuối
                }}
              >
                <Image
                  source={{
                    uri: "https://i.sstatic.net/l60Hf.png",
                  }}
                  style={{
                    height: 35,
                    width: 35,
                    borderRadius: 50,
                  }}
                />
                <View
                  style={{
                    marginLeft: 8,
                    height: "auto",
                    flex: 1,
                    alignItems: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.semiBold,
                      marginBottom: 5,
                      color: COLORS.greySolid,
                    }}
                  >
                    {item.userName}
                  </Text>
                  <View
                    style={{
                      backgroundColor: COLORS.darkGrey,
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontFamily: FONTS.medium, lineHeight: 20 }}>
                      {item.content}
                    </Text>
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

      {/* Modal xem ảnh */}
      <Modal visible={imageView} transparent>
        <ImageViewer
          imageUrls={post.images.map((img) => ({ url: img.imageUrl }))}
          index={selectedpictureOfArticle}
          onSwipeDown={() => setImageView(false)}
        />
      </Modal>
    </>
  );
};

export default DetailArticleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  header: {
    position: "absolute",
    top: 35,
    left: 20,
    zIndex: 9999,
  },
  closeText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.medium,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    padding: 10,
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
