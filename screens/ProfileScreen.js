import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPendingPosts, setShowPendingPosts] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
      console.error("Token không tồn tại.");
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

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserDetails();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userData.userId) {
      fetchUserPosts();
    }
  }, [userData]);

  const fetchUserDetails = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);

        // Lấy thông tin followers
        const response = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/follows/allFollowerByUserId/${parsedUserData.userId}`
        );

        if (!response.ok) {
          throw new Error("Không thể tải thông tin followers.");
        }

        const followersData = await response.json();
        setFollowersCount(followersData.length || 0); // Cập nhật số lượng followers
        return parsedUserData; // Trả về dữ liệu để sử dụng tiếp
      } else {
        throw new Error("Không tìm thấy thông tin người dùng trong lưu trữ.");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      throw error;
    }
  };

  const fetchUserPosts = async () => {
    try {
      if (!userData || !userData.userId) {
        console.warn("userId chưa được khởi tạo.");
        return;
      }

      setLoading(true);

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleByAuthorId/${userData.userId}`
      );
      const articles = await response.json();

      const processPosts = async (posts) => {
        return await Promise.all(
          posts.map(async (post) => {
            const imageResponse = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${post.articleId}`
            );
            const images = await imageResponse.json();

            return {
              ...post,
              images: images.filter((img) => img.imageUrl),
            };
          })
        );
      };

      const processedPosts = await processPosts(articles);
      const accepted = processedPosts.filter(
        (post) => post.status === "accepted"
      );
      const pending = processedPosts.filter(
        (post) => post.status === "pending"
      );

      setUserPosts(accepted);
      setPendingPosts(pending);
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserPosts();
    setRefreshing(false);
  };

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
            navigation.navigate("Setting");
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
              uri:
                userData?.imageUrl ||
                "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?t=st=1731033718~exp=1731037318~hmac=2705f80ce81289818508e796cf321f2dbc40c8b93ee5cbe6aaf29a1728c38682&w=740",
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

          {/* Hiển thị danh sách bài */}
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
                  key={`${item.articleId}-${index}`}
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
                      <ScrollView
                        horizontal
                        style={{ marginTop: 10 }}
                        showsHorizontalScrollIndicator={false}
                      >
                        {Array.isArray(item.articleImages) &&
                        item.articleImages.length > 0 ? (
                          item.articleImages.map((image, idx) => (
                            <Image
                              key={idx}
                              source={{
                                uri: image || "https://via.placeholder.com/100",
                              }} // Fallback nếu `image` null
                              style={{
                                width: 100,
                                height: 100,
                                borderRadius: 8,
                                marginRight: 10,
                              }}
                            />
                          ))
                        ) : (
                          <Text
                            style={{
                              fontFamily: FONTS.medium,
                              fontSize: 12,
                              color: COLORS.grey,
                            }}
                          >
                            Không có ảnh
                          </Text>
                        )}
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
            userPosts.map((item, index) => (
              <TouchableOpacity
                key={`${item.articleId}-${index}`}
                onPress={() =>
                  navigation.navigate("PostDetailScreen", {
                    post: {
                      ...item,
                      articleImages: item.articleImages || [], // Nếu null, dùng mảng rỗng làm fallback
                    },
                  })
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
                    <ScrollView
                      horizontal
                      style={{ marginTop: 10 }}
                      showsHorizontalScrollIndicator={false}
                    >
                      {Array.isArray(item.articleImages) &&
                      item.articleImages.length > 0 ? (
                        item.articleImages.map((image, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: image }}
                            style={{
                              width: 100,
                              height: 100,
                              borderRadius: 8,
                              marginRight: 10,
                            }}
                          />
                        ))
                      ) : (
                        <Text
                          style={{
                            fontFamily: FONTS.medium,
                            fontSize: 12,
                            color: COLORS.grey,
                          }}
                        >
                          Không có ảnh
                        </Text>
                      )}
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
