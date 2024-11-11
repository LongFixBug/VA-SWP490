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
      setLoading(true);

      // Fetch community posts
      const communityResponse = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/3"
      );
      const communityData = await communityResponse.json();

      // Fetch expert posts
      const expertResponse = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/5"
      );
      const expertData = await expertResponse.json();

      // Process posts with user info and images
      const processPosts = async (posts) => {
        const processedPosts = await Promise.all(
          posts.map(async (post) => {
            // Fetch user information
            const userResponse = await fetch(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${post.authorId}`
            );
            const userData = await userResponse.json();

            // Fetch post images
            const imageResponse = await fetch(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${post.articleId}`
            );
            const images = await imageResponse.json();

            return {
              ...post,
              authorName: userData.username || "Ẩn danh",
              authorImageUrl:
                userData.imageUrl || "https://via.placeholder.com/45",
              images: images.filter((img) => img.imageUrl), // Lọc ảnh hợp lệ
            };
          })
        );
        return processedPosts.filter((post) => post.status === "accepted");
      };

      const filteredCommunityPosts = await processPosts(communityData);
      const filteredExpertPosts = await processPosts(expertData);

      setCommunityPosts(filteredCommunityPosts);
      setExpertPosts(filteredExpertPosts);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const renderPost = (item) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("PostDetailScreen", { post: item })}
    >
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
          <Icon name="ellipsis-horizontal" color={COLORS.greySolid} size={24} />
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
          <ScrollView
            horizontal
            style={{ marginTop: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {item.images &&
              item.images.map((image, index) => (
                <Image
                  key={`${item.articleId}-${index}`}
                  source={{ uri: image.imageUrl }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    marginRight: 10,
                  }}
                />
              ))}
          </ScrollView>
        </View>
      </View>
    </TouchableOpacity>
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
