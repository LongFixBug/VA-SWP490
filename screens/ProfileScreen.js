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
  Modal,
  ActivityIndicator,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import IconAnt from "react-native-vector-icons/AntDesign";

const API_BASE_URL =
  "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [rejectedPosts, setRejectedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("accepted");
  const [isModalVisible, setModalVisible] = useState(false);
  const [rankData, setRankData] = useState({});
  const [nextRank, setNextRank] = useState({});
  const [followersCount, setFollowersCount] = useState(0);

  const toggleModal = () => setModalVisible(!isModalVisible);
  const rankColors = {
    Bronze: "#CD7F32",
    Silver: "#C0C0C0",
    Gold: "#FFD700",
    Platinum: "#1b93e3",
  };

  const memberTier = [
    { id: "Bronze", name: "Bronze", point: 0 },
    { id: "Silver", name: "Silver", point: 500 },
    { id: "Gold", name: "Gold", point: 1000 },
    { id: "Platinum", name: "Platinum", point: 2000 },
  ];

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
      await fetchUserRank();
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

        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/v1/follows/allFollowerByUserId/${parsedUserData.userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch followers data.");
        }
        const followersData = await response.json();
        setFollowersCount(followersData.length || 0);
        return parsedUserData;
      } else {
        throw new Error("Không tìm thấy thông tin người dùng trong lưu trữ.");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      throw error;
    }
  };

  const fetchMembershipTier = async (tierId) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/customers/membershipTier/${tierId}`
      );
      if (!response.ok) {
        console.error(`API membershipTier Error: ${response.status}`);
        throw new Error(`API membershipTier Error: ${response.statusText}`);
      }
      const tierData = await response.json();
      return tierData;
    } catch (error) {
      console.error("Error fetching membershipTier data:", error.message);
      throw error;
    }
  };

  const fetchUserRank = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (!storedUserId) {
        console.warn("Không tìm thấy User ID.");
        return;
      }

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/customers/membership/${storedUserId}`
      );

      if (!response.ok) {
        console.error(`API membership Error: ${response.status}`);
        throw new Error(`API membership Error: ${response.statusText}`);
      }

      const membershipData = await response.json();
      const tierResponse = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/customers/membershipTier/${membershipData.tierId}`
      );

      if (!tierResponse.ok) {
        console.error(`API membershipTier Error: ${tierResponse.status}`);
        throw new Error(`API membershipTier Error: ${tierResponse.statusText}`);
      }
      const tierData = await tierResponse.json();

      setRankData({
        name: tierData.tierName,
        points: membershipData.accumulatedPoints,
        discountRate: tierData.discountRate,
      });

      const nextTier = memberTier.find(
        (tier) => tier.point > membershipData.accumulatedPoints
      );
      if (nextTier) {
        setNextRank({
          name: nextTier.name,
          requiredPoints: nextTier.point - membershipData.accumulatedPoints,
        });
      } else {
        setNextRank(null);
      }
    } catch (error) {
      console.error("Error fetching rank data:", error.message);
      setRankData({
        name: "Bronze",
        points: 0,
        discountRate: 0,
      });
      setNextRank({
        name: "Silver",
        requiredPoints: 500,
      });
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
        `${API_BASE_URL}/api/v1/articles/getArticleByAuthorId/${userData.userId}`
      );
      const articles = await response.json();

      const processPosts = async (posts) => {
        const userId = await AsyncStorage.getItem("userId");
        return await Promise.all(
          posts.map(async (post) => {
            try {
              // Lấy ảnh bài viết
              const imageResponse = await fetchWithAuth(
                `${API_BASE_URL}/api/v1/articleImages/getArticleImageByArticleId/${post.articleId}`
              );
              const images = imageResponse.ok ? await imageResponse.json() : [];

              // Lấy likes
              const likesResponse = await fetchWithAuth(
                `${API_BASE_URL}/api/v1/articles/getArticleLikeByArticleId/${post.articleId}`
              );
              const likesData = likesResponse.ok
                ? await likesResponse.json()
                : [];
              const userLiked = likesData.some(
                (like) => like.userId === parseInt(userId)
              );

              // Lấy comments
              const commentsResponse = await fetchWithAuth(
                `${API_BASE_URL}/api/Article/comment/${post.articleId}`
              );
              const commentsData = commentsResponse.ok
                ? await commentsResponse.json()
                : [];
              const commentCount = commentsData.length;

              // Tác giả chính là user đang xem
              const authorName = userData.username || "Ẩn danh";
              const authorImageUrl =
                userData.imageUrl || "https://via.placeholder.com/45";

              return {
                ...post,
                images: images.filter((img) => img.imageUrl),
                authorName,
                authorImageUrl,
                liked: userLiked,
                likes: likesData.length || 0,
                comments: commentCount,
              };
            } catch (error) {
              console.error("Lỗi khi xử lý bài viết:", error);
              return null;
            }
          })
        );
      };

      const processedPosts = await processPosts(articles);
      const accepted = processedPosts.filter(
        (post) => post && post.status === "accepted"
      );
      const pending = processedPosts.filter(
        (post) => post && post.status === "pending"
      );
      const reject = processedPosts.filter(
        (post) => post && post.status === "rejected"
      );

      setUserPosts(accepted);
      setPendingPosts(pending);
      setRejectedPosts(reject);
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

  // Hàm like/unlike bài viết chỉ dành cho bài accepted
  const handleLike = async (articleId) => {
    if (activeTab !== "accepted") return; // Chỉ xử lý like nếu ở tab accepted

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const posts = userPosts;
      const postIndex = posts.findIndex((p) => p.articleId === articleId);
      if (postIndex === -1) return;

      const post = posts[postIndex];

      if (!post.liked) {
        // Chưa like -> like
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/v1/articles/createArticleLike`,
          {
            method: "POST",
            body: JSON.stringify({
              articleId,
              userId,
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
          setUserPosts(updatedPosts);
        }
      } else {
        // Đã like -> unlike
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/v1/articles/deleteArticleLikeByUserId`,
          {
            method: "DELETE",
            body: JSON.stringify({
              articleId,
              userId,
            }),
          }
        );

        if (response.ok) {
          const updatedPosts = [...posts];
          updatedPosts[postIndex] = {
            ...post,
            liked: false,
            likes: Math.max(post.likes - 1, 0),
          };
          setUserPosts(updatedPosts);
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý nút like/unlike:", error);
    }
  };

  const renderPost = (item, activeTab) => {
    const navigateToDetail = () => {
      // Khi navigate đến PostDetailScreen, đã có status trong item
      // PostDetailScreen sẽ dựa vào status để hiển thị hoặc ẩn nút like/comment
      navigation.navigate("PostDetailScreen", { post: item });
    };

    const imageHeight = 300;

    return (
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
        <TouchableOpacity onPress={navigateToDetail} activeOpacity={0.8}>
          <View style={{ flexDirection: "row" }}>
            <Image
              source={{
                uri:
                  item.authorImageUrl ||
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
                {item.authorName || "Ẩn danh"}
              </Text>

              {item.moderateDate && (
                <Text
                  style={{
                    fontFamily: FONTS.medium,
                    fontSize: 12,
                    color: COLORS.grey,
                    marginTop: 1,
                  }}
                >
                  Ngày đăng: {new Date(item.moderateDate).toLocaleDateString()}
                </Text>
              )}
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

        {/* Hiển thị ảnh giống community */}
        {item.images && item.images.length > 0 && (
          <ScrollView
            horizontal={item.images.length > 1}
            style={{ marginTop: 10, height: imageHeight }}
            showsHorizontalScrollIndicator={false}
          >
            {item.images.map((image, index) => (
              <Image
                key={`${item.articleId}-${index}`}
                source={{ uri: image.imageUrl }}
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

        {/* Chỉ hiển thị nút like/comment cho bài accepted */}
        {activeTab === "accepted" && item.status === "accepted" && (
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
              onPress={navigateToDetail}
            >
              <Icon
                name="chatbubble-outline"
                size={27}
                color={COLORS.greySolid}
              />
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
        )}
      </View>
    );
  };

  return (
    <>
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

        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Image
            source={{
              uri:
                userData?.imageUrl ||
                "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
            }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: 10,
            }}
          />
          <Text
            style={{ fontFamily: FONTS.bold, fontSize: 20, marginBottom: 10 }}
          >
            {userData.username || "Người dùng"}
          </Text>
          <TouchableOpacity
            style={{
              alignItems: "center",
              flexDirection: "row",
              position: "relative",
            }}
            onPress={toggleModal}
          >
            <Icon
              name="trophy"
              size={28}
              color={rankColors[rankData.name] || rankColors.Bronze}
            />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("accepted")}
              style={{
                alignItems: "center",
                borderBottomWidth: activeTab === "accepted" ? 2 : 0,
                borderBottomColor: COLORS.green,
                paddingBottom: 5,
              }}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: 18 }}>
                {userPosts.length}
              </Text>
              <Text style={{ fontFamily: FONTS.medium, fontSize: 12 }}>
                Bài đăng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("pending")}
              style={{
                alignItems: "center",
                borderBottomWidth: activeTab === "pending" ? 2 : 0,
                borderBottomColor: COLORS.green,
                paddingBottom: 5,
              }}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: 18 }}>
                {pendingPosts.length}
              </Text>
              <Text style={{ fontFamily: FONTS.medium, fontSize: 12 }}>
                Bài chờ duyệt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("rejected")}
              style={{
                alignItems: "center",
                borderBottomWidth: activeTab === "rejected" ? 2 : 0,
                borderBottomColor: COLORS.green,
                paddingBottom: 5,
              }}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: 18 }}>
                {rejectedPosts.length || 0}
              </Text>
              <Text style={{ fontFamily: FONTS.medium, fontSize: 12 }}>
                Bài bị từ chối
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => {
                navigation.navigate("Follow");
              }}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: 18 }}>
                {followersCount}
              </Text>
              <Text style={{ fontFamily: FONTS.medium, fontSize: 12 }}>
                Người theo dõi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={toggleModal}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                width: "90%",
                backgroundColor: COLORS.white,
                padding: 20,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: 18,
                  marginBottom: 10,
                }}
              >
                Thông tin xếp hạng
              </Text>
              <Text>Điểm hiện tại: {rankData.points || 0}</Text>
              <Text>
                Xếp hạng hiện tại: {rankData.name || "Không xác định"}
              </Text>
              {rankData.discountRate !== undefined && (
                <Text>
                  Giảm giá: {Math.round(rankData.discountRate * 100)}%
                </Text>
              )}
              {nextRank ? (
                <Text>
                  Cần thêm {nextRank.requiredPoints} điểm để đạt {nextRank.name}
                </Text>
              ) : (
                <Text>Đã đạt cấp cao nhất!</Text>
              )}
              <TouchableOpacity
                onPress={toggleModal}
                style={{
                  backgroundColor: COLORS.green,
                  padding: 10,
                  borderRadius: 5,
                  marginTop: 20,
                }}
              >
                <Text style={{ textAlign: "center", color: COLORS.white }}>
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={{ marginTop: 10, marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              marginVertical: 10,
              fontSize: 17,
            }}
          >
            {activeTab === "accepted"
              ? "Bài đăng"
              : activeTab === "pending"
              ? "Bài chờ duyệt"
              : "Bài bị từ chối"}
          </Text>

          {loading ? (
            <View style={{ marginVertical: 20, alignItems: "center" }}>
              <ActivityIndicator size="large" color={COLORS.green} />
              <Text>Đang tải...</Text>
            </View>
          ) : activeTab === "accepted" ? (
            userPosts.length === 0 ? (
              <Text style={{ textAlign: "center", marginVertical: 20 }}>
                Không có bài viết nào
              </Text>
            ) : (
              userPosts.map((post) => renderPost(post, activeTab))
            )
          ) : activeTab === "pending" ? (
            pendingPosts.length === 0 ? (
              <Text style={{ textAlign: "center", marginVertical: 20 }}>
                Không có bài viết chờ duyệt
              </Text>
            ) : (
              pendingPosts.map((post) => renderPost(post, activeTab))
            )
          ) : rejectedPosts.length === 0 ? (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              Không có bài viết bị từ chối
            </Text>
          ) : (
            rejectedPosts.map((post) => renderPost(post, activeTab))
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
