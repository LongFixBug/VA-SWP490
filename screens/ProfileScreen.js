import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import IconAnt from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../constants/color";
import FONTS from "../constants/font";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPendingPosts, setShowPendingPosts] = useState(false);

  // Lấy thông tin người dùng từ AsyncStorage
  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);

        // Lấy số lượng người theo dõi
        const followersResponse = await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/follows/allFollowerByUserId/${parsedUserData.userId}`
        );
        const followersData = await followersResponse.json();
        setFollowersCount(followersData.length || 0);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Lấy danh sách bài viết với phân trang
  const fetchUserPosts = async (newPage) => {
    try {
      const response = await fetch(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleByAuthorId/${userData.userId}?page=${newPage}&limit=10`
      );
      const articles = await response.json();

      const acceptedPosts = [];
      const pendingPosts = [];

      for (const article of articles) {
        const imageResponse = await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${article.articleId}`
        );
        const images = await imageResponse.json();

        if (article.status === "accepted") {
          acceptedPosts.push({ ...article, images });
        } else if (article.status === "pending") {
          pendingPosts.push({ ...article, images });
        }
      }

      setUserPosts((prev) => [...prev, ...acceptedPosts]);
      setPendingPosts((prev) => [...prev, ...pendingPosts]);
      setHasMore(articles.length === 10); // Nếu số bài viết ít hơn `limit`, không tải thêm.
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Làm mới dữ liệu
  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setUserPosts([]);
    setPendingPosts([]);
    await fetchUserData();
    await fetchUserPosts(1);
    setRefreshing(false);
  };

  // Tải thêm bài viết khi cuộn đến cuối
  const loadMorePosts = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      fetchUserPosts(page + 1);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserPosts(1);
  }, []);

  const PostItem = ({ post }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("PostDetailScreen", { post })}
    >
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image
            source={{
              uri: userData.imageUrl || "https://via.placeholder.com/45",
            }}
            style={styles.postAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.postAuthor}>
              {userData.username || "Người dùng"}
            </Text>
            <Text style={styles.postDate}>
              {post.createdAt || "12:05, 22/10/2024"}
            </Text>
          </View>
          <Icon name="ellipsis-horizontal" size={24} color={COLORS.greySolid} />
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postContent} numberOfLines={2}>
          {post.content}
        </Text>

        <FlatList
          horizontal
          data={post.images}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
          )}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.interaction}>
          <TouchableOpacity style={styles.iconButton}>
            <IconAnt name="like2" size={20} color={COLORS.greySolid} />
            <Text style={styles.iconText}>{post.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="chatbubble-outline" size={20} color={COLORS.greySolid} />
            <Text style={styles.iconText}>{post.comments || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Trang cá nhân</Text>
        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
          <Icon name="settings-outline" size={28} color={COLORS.green} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={showPendingPosts ? pendingPosts : userPosts}
        renderItem={({ item }) => <PostItem post={item} />}
        keyExtractor={(item) => item.articleId.toString()}
        ListHeaderComponent={
          <>
            {/* Thông tin người dùng */}
            <View style={styles.userInfo}>
              <Image
                source={{
                  uri: userData.imageUrl || "https://via.placeholder.com/100",
                }}
                style={styles.avatar}
              />
              <View style={styles.stats}>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => setShowPendingPosts(false)}
                >
                  <Text style={styles.statValue}>{userPosts.length}</Text>
                  <Text style={styles.statLabel}>Bài đăng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => setShowPendingPosts(true)}
                >
                  <Text style={styles.statValue}>{pendingPosts.length}</Text>
                  <Text style={styles.statLabel}>Bài chờ duyệt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statItem}>
                  <Text style={styles.statValue}>{followersCount}</Text>
                  <Text style={styles.statLabel}>Người theo dõi</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.username}>
              {userData.username || "Người dùng"}
            </Text>
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && <ActivityIndicator size="large" />}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: StatusBar.currentHeight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 25,
    color: COLORS.green,
  },
  userInfo: {
    flexDirection: "row",
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  stats: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    marginTop: 5,
  },
  username: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
    marginLeft: 20,
  },
  postContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAvatar: {
    width: 45,
    height: 45,
    borderRadius: 50,
    marginRight: 10,
  },
  postAuthor: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  postDate: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.grey,
  },
  postTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    marginTop: 10,
  },
  postContent: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    marginTop: 5,
    lineHeight: 22,
  },
  postImage: {
    width: 150,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  interaction: {
    flexDirection: "row",
    marginTop: 10,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  iconText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    marginLeft: 5,
  },
});

export default ProfileScreen;
