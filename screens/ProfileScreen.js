import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
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

  // Function to fetch user posts
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

  return (
    <>
      {/* Header */}
      <View
        style={{
          marginTop: StatusBar.currentHeight,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          backgroundColor: COLORS.white,
        }}
      >
        <Text
          style={{ fontFamily: FONTS.bold, fontSize: 25, color: COLORS.green }}
        >
          Trang cá nhân
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("EditProfile");
          }}
        >
          <Icon name="settings-outline" size={28} color={COLORS.green} />
        </TouchableOpacity>
      </View>

      {/* Nội dung chính */}
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white, padding: 10 }}
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

        {/* Thông tin người dùng */}
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <Image
            source={{
              uri: userData.imageUrl || "https://via.placeholder.com/100",
            }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              marginRight: 10,
            }}
          />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* Bài đăng */}
            <TouchableOpacity
              style={{
                alignItems: "center",
                width: "30%",
              }}
              onPress={() => setShowPendingPosts(false)}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: 15 }}>
                {userPosts.length}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  marginTop: 8,
                  fontSize: 12,
                }}
              >
                Bài đăng
              </Text>
            </TouchableOpacity>

            {/* Bài chờ duyệt */}
            <TouchableOpacity
              style={{
                alignItems: "center",
                width: "35%",
              }}
              onPress={() => setShowPendingPosts(true)}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: 15 }}>
                {pendingPosts.length}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  marginTop: 8,
                  fontSize: 12,
                }}
              >
                Bài chờ duyệt
              </Text>
            </TouchableOpacity>

            {/* Đang theo dõi */}
            <TouchableOpacity
              style={{
                alignItems: "center",
                width: "35%",
              }}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: 15 }}>
                {followersCount}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  marginTop: 8,
                  fontSize: 12,
                }}
              >
                Đang theo dõi
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={{
            fontFamily: FONTS.semiBold,
            marginTop: 10,
            fontSize: 17,
            marginLeft: 5,
          }}
        >
          {userData.username}
        </Text>

        {/* Danh sách bài viết */}
        <View style={{ marginTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: 5,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                marginVertical: 10,
                fontSize: 17,
              }}
            >
              {showPendingPosts ? "Bài chờ duyệt" : "Bài đăng"}
            </Text>
            <Icon name="options" size={24} color={COLORS.grey} />
          </View>

          {/* Danh sách bài */}
          {loading ? (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              Đang tải...
            </Text>
          ) : showPendingPosts ? (
            pendingPosts.length === 0 ? (
              <Text style={{ textAlign: "center", marginVertical: 20 }}>
                Không có bài viết chờ duyệt
              </Text>
            ) : (
              pendingPosts.map((item, index) => (
                <TouchableOpacity
                  key={`${item.articleId}-${index}`} // Kết hợp articleId và index
                  onPress={() =>
                    navigation.navigate("PostDetailScreen", { post: item })
                  }
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
                  >
                    <View style={{ flexDirection: "row" }}>
                      <Image
                        source={{
                          uri:
                            userData.imageUrl ||
                            "https://via.placeholder.com/45",
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
                          {userData.username || "Người dùng"}
                        </Text>
                        <Text
                          style={{
                            fontFamily: FONTS.medium,
                            fontSize: 12,
                            marginTop: 3,
                            color: COLORS.grey,
                          }}
                        >
                          {item.createdAt || "12:05, 22/10/2024"}
                        </Text>
                      </View>
                      <Icon
                        name="ellipsis-horizontal"
                        size={24}
                        color={COLORS.greySolid}
                      />
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
                      {/* Hiển thị hình ảnh từ API */}
                      <ScrollView
                        horizontal
                        style={{ marginTop: 10 }}
                        showsHorizontalScrollIndicator={false}
                      >
                        {item.images &&
                          item.images.map((image, index) => (
                            <Image
                              key={`${item.articleId}-${index}`} // Kết hợp articleId và index để đảm bảo duy nhất
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
              ))
            )
          ) : userPosts.length === 0 ? (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              Không có bài viết nào
            </Text>
          ) : (
            userPosts.map((item) => (
              <TouchableOpacity
                key={item.articleId}
                onPress={() =>
                  navigation.navigate("PostDetailScreen", { post: item })
                }
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
                >
                  <View style={{ flexDirection: "row" }}>
                    <Image
                      source={{
                        uri:
                          userData.imageUrl || "https://via.placeholder.com/45",
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
                        {userData.username || "Người dùng"}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.medium,
                          fontSize: 12,
                          marginTop: 3,
                          color: COLORS.grey,
                        }}
                      >
                        {item.createdAt || "12:05, 22/10/2024"}
                      </Text>
                    </View>
                    <Icon
                      name="ellipsis-horizontal"
                      size={24}
                      color={COLORS.greySolid}
                    />
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
                    {/* Hiển thị hình ảnh từ API */}
                    <ScrollView
                      horizontal
                      style={{ marginTop: 10 }}
                      showsHorizontalScrollIndicator={false}
                    >
                      {item.images &&
                        item.images.map((image, index) => (
                          <Image
                            key={index}
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
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
