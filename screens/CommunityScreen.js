import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  Pressable,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Ionicons";
import IconAnt from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowWidth = Dimensions.get("window").width;

const dataTabView = [
  {
    id: 1,
    name: "Cộng đồng",
  },
  {
    id: 2,
    name: "Chuyên gia",
  },
];

const CommunityScreen = ({ navigation }) => {
  const [currentTabView, setCurrentTabView] = useState(1);
  const [expandedDecription, setExpandedDecription] = useState({});
  const [communityPosts, setCommunityPosts] = useState([]);
  const [expertPosts, setExpertPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("Người dùng");
  const [userImage, setUserImage] = useState("https://via.placeholder.com/55");

  // Fetch articles from the API

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

  const fetchUserDetails = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData"); // Lấy toàn bộ thông tin từ AsyncStorage
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData); // Chuyển chuỗi JSON thành đối tượng
        setUsername(parsedData.username || "Người dùng"); // Lấy tên người dùng
        setUserImage(parsedData.imageUrl || "https://via.placeholder.com/55"); // Lấy ảnh người dùng hoặc sử dụng ảnh mặc định
      } else {
        console.error("No user data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching user details from AsyncStorage:", error);
    }
  };

  const fetchArticles = async () => {
    try {
      // Gọi API để lấy bài viết của "Cộng đồng" và "Chuyên gia"
      const communityResponse = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/3"
      );
      const expertResponse = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/5"
      );

      const communityData = communityResponse.ok
        ? await communityResponse.json()
        : [];
      const expertData = expertResponse.ok ? await expertResponse.json() : [];

      // Hàm xử lý bài viết
      const processPosts = async (posts) => {
        const userId = await AsyncStorage.getItem("userId");

        return Promise.all(
          posts.map(async (post) => {
            try {
              // Gọi API lấy thông tin "likes"
              const likesResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${post.articleId}`
              );
              const likesData = likesResponse.ok
                ? await likesResponse.json()
                : [];
              const userLiked = likesData.some(
                (like) => like.userId === parseInt(userId)
              );

              // Gọi API lấy số lượng bình luận
              const commentsResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${post.articleId}`
              );
              const commentsData = commentsResponse.ok
                ? await commentsResponse.json()
                : [];
              const commentCount = commentsData.length;

              // Gọi API lấy thông tin tác giả bài viết
              const userResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${post.authorId}`
              );
              const userData = userResponse.ok
                ? await userResponse.json()
                : { username: "Ẩn danh", imageUrl: "" };

              // Gọi API lấy ảnh bài viết
              const imageResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${post.articleId}`
              );
              const images = imageResponse.ok ? await imageResponse.json() : [];

              // Kết hợp tất cả dữ liệu vào bài viết
              return {
                ...post,
                liked: userLiked,
                likes: likesData.length || 0,
                comments: commentCount,
                authorName: userData.username || "Ẩn danh",
                authorImageUrl:
                  userData.imageUrl || "https://via.placeholder.com/45",
                images: images.filter((img) => img.imageUrl), // Chỉ lấy ảnh hợp lệ
              };
            } catch (error) {
              console.error(`Lỗi khi xử lý bài viết ${post.articleId}:`, error);
              return null; // Bỏ qua bài viết nếu có lỗi
            }
          })
        );
      };

      // Xử lý bài viết của cộng đồng và chuyên gia
      const processedCommunityPosts = await processPosts(communityData);
      const processedExpertPosts = await processPosts(expertData);

      // Lọc bài viết có trạng thái "accepted"
      setCommunityPosts(
        processedCommunityPosts.filter((post) => post?.status === "accepted")
      );
      setExpertPosts(
        processedExpertPosts.filter((post) => post?.status === "accepted")
      );
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bài viết:", error);
    } finally {
      setLoading(false); // Tắt trạng thái loading
      setRefreshing(false); // Kết thúc làm mới
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchArticles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles();
  };

  const toggleShowMore = (id) => {
    setExpandedDecription((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLike = async (articleId) => {
    try {
      const posts = currentTabView === 1 ? communityPosts : expertPosts; // Xác định danh sách bài viết hiện tại
      const postIndex = posts.findIndex((post) => post.articleId === articleId);

      if (postIndex === -1) {
        console.error(`Không tìm thấy bài viết với articleId: ${articleId}`);
        return;
      }

      const post = posts[postIndex];
      const userId = await AsyncStorage.getItem("userId");

      if (!post.liked) {
        // Nếu chưa like, gọi API để like
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleLike`,
          {
            method: "POST",
            body: JSON.stringify({
              articleId,
              userId: userId,
              likeDate: new Date().toISOString(),
            }),
          }
        );

        if (response.ok) {
          const updatedPosts = [...posts];
          updatedPosts[postIndex] = {
            ...post,
            liked: true, // Đánh dấu đã like
            likes: post.likes + 1, // Tăng số lượt like
          };

          // Cập nhật danh sách bài viết
          if (currentTabView === 1) setCommunityPosts(updatedPosts);
          else setExpertPosts(updatedPosts);
        }
      } else {
        console.warn("Bạn đã like bài viết này, không cần thực hiện thêm.");
      }
    } catch (error) {
      console.error("Lỗi khi xử lý nút like:", error);
    }
  };

  //get like
  const fetchArticleLikes = async (articleId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${articleId}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.length; // Trả về số lượng "like"
      } else {
        return 0; // Mặc định nếu không có lượt like
      }
    } catch (error) {
      console.error(
        `Lỗi khi lấy số lượt like cho bài viết ${articleId}:`,
        error
      );
      return 0; // Mặc định nếu có lỗi
    }
  };

  const fetchArticleComments = async (articleId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${articleId}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.length || 0; // Trả về số lượng bình luận hoặc 0 nếu không có
      } else if (response.status === 404) {
        return 0; // Trả về 0 nếu bài viết không có bình luận
      } else {
        console.error(
          `Không thể lấy số lượng bình luận cho bài viết ${articleId}`
        );
        return 0;
      }
    } catch (error) {
      console.error(
        `Lỗi khi lấy số lượng bình luận cho bài viết ${articleId}:`,
        error
      );
      return 0; // Trả về 0 trong trường hợp lỗi
    }
  };

  const renderPost = (item) => (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.greyPastel,
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
      }}
      key={item.articleId}
    >
      {/* Thông tin bài viết */}
      <TouchableOpacity
        onPress={() => navigation.navigate("PostDetailScreen", { post: item })}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            source={{
              uri: item.authorImageUrl || "https://via.placeholder.com/45",
            }}
            style={{
              width: 45,
              height: 45,
              borderRadius: 50,
              marginRight: 10,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 14,
              }}
            >
              {item.authorName || "Ẩn danh"}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 12,
                marginTop: 3,
                color: COLORS.grey,
              }}
            >
              {item.createdAt}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.medium,
              fontSize: 13,
              lineHeight: 22,
              marginTop: 5,
            }}
            numberOfLines={2}
          >
            {item.content}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Cuộn ảnh ngang */}
      {item.images && item.images.length > 0 && (
        <ScrollView
          horizontal
          style={{ marginTop: 10 }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          {item.images.map((image, index) => (
            <Image
              key={`${item.articleId}-${index}`}
              source={{
                uri: image.imageUrl, // URL mặc định nếu không có imageUrl
              }}
              style={{
                width: 150,
                height: 100,
                borderRadius: 8,
                marginRight: 10,
              }}
            />
          ))}
        </ScrollView>
      )}

      {/* Tương tác thích và bình luận */}
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 20,
          }}
          onPress={() => handleLike(item.articleId)}
        >
          <IconAnt
            name={item.liked ? "like1" : "like2"} // Biểu tượng outline hoặc full
            size={28}
            color={item.liked ? COLORS.green : COLORS.greySolid} // Đổi màu khi đã like
          />
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 16,
              color: item.liked ? COLORS.green : COLORS.greySolid, // Đổi màu số lượt like
              marginLeft: 5,
            }}
          >
            {item.likes || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 20,
          }}
          onPress={() =>
            navigation.navigate("PostDetailScreen", { post: item })
          }
        >
          <Icon name="chatbubble-outline" size={27} color={COLORS.greySolid} />
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 16,
              color: COLORS.greySolid,
              marginLeft: 5,
            }}
          >
            {item.comments || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.white }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {refreshing && (
        <Text
          style={{
            textAlign: "center",
            marginVertical: 10,
            color: COLORS.green,
          }}
        >
          Đang làm mới trang...
        </Text>
      )}
      <View
        style={{
          width: "100%",
          height: "auto",
        }}
      >
        <ImageBackground
          source={{
            uri: "https://t4.ftcdn.net/jpg/08/03/08/29/360_F_803082915_4gPN1abhjLZVnIgXCQNNfH1cIo1ZxKLt.jpg",
          }}
          style={{
            width: "100%",
            height: "auto",
            resizeMode: "cover",
          }}
        >
          {/* Header */}
          <View
            style={{
              padding: 20,
              marginTop: 15,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Membership")}
            >
              <Image
                source={{
                  uri: userImage,
                }}
                style={{
                  height: 55,
                  width: 55,
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: COLORS.white,
                }}
              />

              <View
                style={{
                  alignItems: "flex-start",
                  marginRight: 5,
                  padding: 5,
                  borderRadius: 5,
                  elevation: 0,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    color: COLORS.white,
                    fontSize: 15,
                    alignSelf: "center",
                    marginBottom: 5,
                  }}
                >
                  {username}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    color: COLORS.diamond,
                    fontSize: 12,
                    backgroundColor: COLORS.white,
                    borderRadius: 50,
                    paddingVertical: 3,
                    paddingHorizontal: 8,
                  }}
                >
                  Kim cương
                </Text>
              </View>
            </TouchableOpacity>
            <Pressable>
              <View
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                }}
              >
                <Icon name="people" size={30} color={COLORS.white} />
              </View>
            </Pressable>
          </View>

          {/* New Post */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 110,
              marginHorizontal: 20,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate("NewPostScreen")}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 15,
                backgroundColor: COLORS.white,
                borderRadius: 15,
                elevation: 10,
                flex: 1,
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: -15,
                  left: 20,
                  width: 0,
                  height: 0,
                  borderRightWidth: 15,
                  borderBottomWidth: 15,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderBottomColor: COLORS.white,
                }}
              />
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  color: COLORS.grey,
                  marginBottom: 10,
                }}
              >
                Hãy viết gì đó...
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Icon1
                  name="camera-plus-outline"
                  size={24}
                  color={COLORS.green}
                  style={{ marginRight: 3 }}
                />
                <Icon1 name="image-outline" size={25} color={COLORS.green} />
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      {/* Tabs */}
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.greyPastel,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          marginTop: -50,
          paddingHorizontal: 15,
          paddingTop: 15,
          elevation: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            marginTop: -50,
            marginHorizontal: 30,
            borderRadius: 15,
            overflow: "hidden",
            elevation: 3,
            backgroundColor: COLORS.white,
            marginBottom: 15,
          }}
        >
          {dataTabView.map((tabView) => (
            <TouchableOpacity
              key={tabView.id} // Sử dụng id thay vì index
              activeOpacity={0.8}
              onPress={() => setCurrentTabView(tabView.id)}
              style={{
                backgroundColor:
                  currentTabView === tabView.id ? COLORS.green : COLORS.white,
                alignItems: "center",
                padding: 20,
                flex: 1,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                  color:
                    currentTabView === tabView.id
                      ? COLORS.white
                      : COLORS.greySolid,
                  fontSize: 16,
                }}
              >
                {tabView.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Display posts */}
        {loading ? (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>
            Loading...
          </Text>
        ) : (
          <View>
            {currentTabView === 1
              ? communityPosts.map((post, index) => (
                  <View key={`${post.articleId}-${index}`}>
                    {renderPost(post)}
                  </View>
                ))
              : expertPosts.map((post, index) => (
                  <View key={`${post.articleId}-${index}`}>
                    {renderPost(post)}
                  </View>
                ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({});
