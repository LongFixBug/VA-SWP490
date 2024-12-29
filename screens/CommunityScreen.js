import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  Pressable,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  TextInput, // Thêm TextInput
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Ionicons";
import IconAnt from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { RenderHTML } from "react-native-render-html";
import debounce from "lodash.debounce"; // Thêm debounce

const { width } = Dimensions.get("window");

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
  const [expandedDescription, setExpandedDescription] = useState({});
  const [communityPosts, setCommunityPosts] = useState([]);
  const [expertPosts, setExpertPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("Người dùng");
  const [userImage, setUserImage] = useState("https://via.placeholder.com/55");
  const [searchQuery, setSearchQuery] = useState(""); // Thêm trạng thái tìm kiếm
  const userRoleCache = {}; // Cache roleId theo userId

  // Fetch articles từ API
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
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUsername(parsedData.username || "Người dùng");
        setUserImage(parsedData.imageUrl || "https://via.placeholder.com/55");
      } else {
        console.error("No user data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching user details from AsyncStorage:", error);
    }
  };

  const fetchArticleImages = async (articleId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${articleId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.map((item) => item.imageUrl);
      } else {
        console.error(
          `Error fetching article images for article ID ${articleId}:`,
          response.status
        );
        return [];
      }
    } catch (error) {
      console.error(
        `Error fetching article images for article ID ${articleId}:`,
        error
      );
      return [];
    }
  };

  const fetchArticles = async () => {
    try {
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

      const processPosts = async (posts) => {
        const userId = await AsyncStorage.getItem("userId");

        return Promise.all(
          posts.map(async (post) => {
            try {
              const likesResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${post.articleId}`
              );
              const likesData = likesResponse.ok
                ? await likesResponse.json()
                : [];
              const userLiked = likesData.some(
                (like) => like.userId === parseInt(userId)
              );

              const commentsResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${post.articleId}`
              );
              const commentsData = commentsResponse.ok
                ? await commentsResponse.json()
                : [];
              const commentCount = commentsData.length;

              const userResponse = await fetchWithAuth(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${post.authorId}`
              );
              const userData = userResponse.ok
                ? await userResponse.json()
                : { username: "Ẩn danh", imageUrl: "" };

              const contentImageLinks = extractImageLinksFromContent(
                post.content
              );

              const articleImageLinks = await fetchArticleImages(
                post.articleId
              );

              const images =
                articleImageLinks.length > 0
                  ? articleImageLinks
                  : contentImageLinks;

              return {
                ...post,
                liked: userLiked,
                likes: likesData.length || 0,
                comments: commentCount,
                authorName: userData.username || "Ẩn danh",
                authorImageUrl:
                  userData.imageUrl || "https://via.placeholder.com/45",
                images: images,
              };
            } catch (error) {
              console.error(`Lỗi khi xử lý bài viết ${post.articleId}:`, error);
              return null;
            }
          })
        );
      };

      const [processedCommunityPosts, processedExpertPosts] = await Promise.all(
        [processPosts(communityData), processPosts(expertData)]
      );

      const sortedCommunityPosts = processedCommunityPosts
        .filter((post) => post?.status === "accepted")
        .sort((a, b) => b.articleId - a.articleId);

      const sortedExpertPosts = processedExpertPosts
        .filter((post) => post?.status === "accepted")
        .sort((a, b) => b.articleId - a.articleId);

      setCommunityPosts(sortedCommunityPosts);
      setExpertPosts(sortedExpertPosts);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bài viết:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
      fetchArticles();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles();
  };

  const toggleShowMore = (id) => {
    setExpandedDescription((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLike = async (articleId) => {
    try {
      const posts = currentTabView === 1 ? communityPosts : expertPosts;
      const postIndex = posts.findIndex((post) => post.articleId === articleId);

      if (postIndex === -1) {
        console.error(`Không tìm thấy bài viết với articleId: ${articleId}`);
        return;
      }

      const post = posts[postIndex];
      const userId = await AsyncStorage.getItem("userId");

      if (!post.liked) {
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
            liked: true,
            likes: post.likes + 1,
          };

          if (currentTabView === 1) setCommunityPosts(updatedPosts);
          else setExpertPosts(updatedPosts);
        }
      } else {
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/deleteArticleLikeByUserId`,
          {
            method: "DELETE",
            body: JSON.stringify({
              articleId,
              userId: userId,
            }),
          }
        );

        if (response.ok) {
          const updatedPosts = [...posts];
          updatedPosts[postIndex] = {
            ...post,
            liked: false,
            likes: post.likes - 1,
          };

          if (currentTabView === 1) setCommunityPosts(updatedPosts);
          else setExpertPosts(updatedPosts);
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý nút like/unlike:", error);
    }
  };

  const fetchArticleLikes = async (articleId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleLikeByArticleId/${articleId}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.length;
      } else {
        return 0;
      }
    } catch (error) {
      console.error(
        `Lỗi khi lấy số lượt like cho bài viết ${articleId}:`,
        error
      );
      return 0;
    }
  };

  const fetchArticleComments = async (articleId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/comment/${articleId}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.length || 0;
      } else if (response.status === 404) {
        return 0;
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
      return 0;
    }
  };

  const navigateToScreen = async (item) => {
    try {
      if (userRoleCache[item.authorId]) {
        const cachedRoleId = userRoleCache[item.authorId];
        console.log("Lấy roleId từ cache:", cachedRoleId);

        if (cachedRoleId === 5) {
          navigation.navigate("NutritionArticle", {
            articleId: item.articleId,
          });
        } else {
          navigation.navigate("PostDetailScreen", { post: item });
        }
        return;
      }

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${item.authorId}`
      );

      if (response.ok) {
        const userData = await response.json();
        userRoleCache[item.authorId] = userData.roleId;
        console.log("Thông tin người viết bài:", userData);

        if (userData.roleId === 5) {
          navigation.navigate("NutritionArticle", {
            articleId: item.articleId,
          });
        } else {
          navigation.navigate("PostDetailScreen", { post: item });
        }
      } else {
        console.error(
          "Không thể lấy thông tin người viết bài:",
          response.status
        );
      }
    } catch (error) {
      console.error("Lỗi khi gọi API getUserByID:", error);
    }
  };

  const extractImageLinksFromContent = (content) => {
    const imageLinks = [];
    const regex = /<img.*?src=["'](.*?)["']/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      imageLinks.push(match[1]);
    }
    return imageLinks;
  };

  const renderPost = useCallback(
    ({ item }) => (
      <PostItem
        item={item}
        navigateToScreen={navigateToScreen}
        handleLike={handleLike}
      />
    ),
    [navigateToScreen, handleLike]
  );

  const keyExtractor = useCallback((item) => item.articleId.toString(), []);

  // Lọc bài viết dựa trên từ khóa tìm kiếm
  const filteredPosts = useMemo(() => {
    const posts = currentTabView === 1 ? communityPosts : expertPosts;
    if (searchQuery.trim() === "") return posts;

    const lowerQuery = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        (post.authorName &&
          post.authorName.toLowerCase().includes(lowerQuery)) ||
        (post.title && post.title.toLowerCase().includes(lowerQuery)) ||
        (post.content && post.content.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery, communityPosts, expertPosts, currentTabView]);

  // Tạo hàm debounce cho tìm kiếm (tùy chọn)
  const handleSearch = useCallback(
    debounce((text) => {
      setSearchQuery(text);
    }, 300),
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <FlatList
        data={filteredPosts} // Sử dụng danh sách đã lọc
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        ListHeaderComponent={
          <>
            {/* Header */}
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
                  height: 225,
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
                      {/* Optional: Show user role or other info */}
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
                        borderRightWidth: 50,
                        borderBottomWidth: 50,
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
                      <Icon1
                        name="image-outline"
                        size={25}
                        color={COLORS.green}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>

            {/* Tabs */}
            <View
              style={{
                flexDirection: "row",
                marginTop: -25,
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
                  key={tabView.id}
                  activeOpacity={0.8}
                  onPress={() => setCurrentTabView(tabView.id)}
                  style={{
                    backgroundColor:
                      currentTabView === tabView.id
                        ? COLORS.green
                        : COLORS.white,
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

            {/* Thanh Tìm Kiếm với Icon bên trong TextInput */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 30,
                marginBottom: 15,

                position: "relative", // Đặt relative để Icon có thể được đặt tuyệt đối bên trong
              }}
            >
              <Icon
                name="search"
                size={20}
                color={COLORS.green}
                style={{
                  position: "absolute",
                  left: 15,
                  zIndex: 1,
                }}
              />
              <TextInput
                style={{
                  flex: 1,
                  height: 40,
                  borderColor: COLORS.greyPastel,
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingLeft: 45, // Tăng paddingLeft để không bị che Icon
                  paddingRight: 15,
                  backgroundColor: COLORS.white,
                }}
                placeholder="Tìm kiếm bài viết..."
                onChangeText={handleSearch} // Sử dụng hàm debounce
              />
            </View>
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text style={{ color: COLORS.grey, fontFamily: FONTS.medium }}>
                Không có bài viết nào.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && (
            <ActivityIndicator
              size="large"
              color={COLORS.green}
              style={{ marginVertical: 20 }}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.green}
            colors={[COLORS.green]}
            progressBackgroundColor={COLORS.white}
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
};

// Memoized PostItem to prevent unnecessary re-renders
const PostItem = memo(({ item, navigateToScreen, handleLike }) => {
  const stripAndTruncateHTML = (html, maxLength) => {
    const plainText = html.replace(/<[^>]+>/g, "");
    return plainText.length > maxLength
      ? plainText.slice(0, maxLength) + "..."
      : plainText;
  };

  const truncatedTitle = stripAndTruncateHTML(item.title || "", 50);
  const truncatedContent = stripAndTruncateHTML(item.content || "", 100);
  const imageHeight = 300;

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.greyPastel,
        padding: 10,
        borderRadius: 8,
        margin: 10,
        width: "95%",
      }}
      key={item.articleId}
    >
      <TouchableOpacity
        onPress={() => navigateToScreen(item)}
        activeOpacity={0.8}
      >
        {/* Header */}
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
              {/* {new Date(item.createdAt).toLocaleDateString()} */}
            </Text>
            {item.moderateDate && (
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  fontSize: 12,
                  color: COLORS.grey,
                  marginTop: -15,
                }}
              >
                Ngày duyệt: {new Date(item.moderateDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Title and Content */}
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 14,
              lineHeight: 20,
              color: COLORS.black,
            }}
            numberOfLines={1}
          >
            {truncatedTitle}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.medium,
              fontSize: 13,
              lineHeight: 22,
              color: COLORS.black,
              marginTop: 5,
            }}
            numberOfLines={2}
          >
            {truncatedContent}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Images Carousel */}
      {item.images && item.images.length > 0 && (
        <ScrollView
          horizontal={item.images.length > 1}
          style={{ marginTop: 10, height: imageHeight }}
          showsHorizontalScrollIndicator={false}
        >
          {item.images.map((image, index) => (
            <Image
              key={`${item.articleId}-${index}`}
              source={{ uri: image }}
              style={{
                width: item.images.length > 1 ? 250 : "100%",
                height: item.images.length > 1 ? "100%" : imageHeight,
                borderRadius: 8,
                marginRight: item.images.length > 1 ? 10 : 0,
                resizeMode: "cover",
              }}
            />
          ))}
        </ScrollView>
      )}
      {/* Interactions */}
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
            name={item.liked ? "like1" : "like2"}
            size={28}
            color={item.liked ? COLORS.green : COLORS.greySolid}
          />
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: 16,
              color: item.liked ? COLORS.green : COLORS.greySolid,
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
          onPress={() => navigateToScreen(item)}
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
});

export default CommunityScreen;

const styles = StyleSheet.create({});
