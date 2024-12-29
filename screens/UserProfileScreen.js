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
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import IconAnt from "react-native-vector-icons/AntDesign";
import Toast from "react-native-toast-message";

const API_BASE_URL =
  "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net";

const UserProfileScreen = ({ navigation, route }) => {
  const { userId } = route.params;
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [unfollowModalVisible, setUnfollowModalVisible] = useState(false);

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

  const toggleModal = () => setModalVisible(!isModalVisible);
  const toggleUnfollowModal = () =>
    setUnfollowModalVisible(!unfollowModalVisible);

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
      await checkFollowStatus();
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (userData.userId) {
      fetchUserPosts();
    }
  }, [userData]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/users/getUserByID/${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user data.");
      }
      const userDetail = await response.json();
      setUserData(userDetail);

      const responseFollower = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/follows/allFollowerByUserId/${userId}`
      );

      if (!responseFollower.ok) {
        throw new Error("Failed to fetch followers data.");
      }
      const followersData = await responseFollower.json();
      setFollowersCount(followersData.length || 0);
      return userDetail;
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
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/customers/membership/${userId}`
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
      console.log("Error fetching rank data:", error.message);
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
        return await Promise.all(
          posts.map(async (post) => {
            const imageResponse = await fetchWithAuth(
              `${API_BASE_URL}/api/v1/articleImages/getArticleImageByArticleId/${post.articleId}`
            );
            const images = await imageResponse.json();

            return {
              ...post,
              images: images.filter((img) => img.imageUrl),
              authorImageUrl:
                userData.imageUrl || "https://via.placeholder.com/45",
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
      const reject = processedPosts.filter(
        (post) => post.status === "rejected"
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
    await checkFollowStatus();
    setRefreshing(false);
  };

  const checkFollowStatus = async () => {
    try {
      const currentUserId = await AsyncStorage.getItem("userId");
      if (!currentUserId) {
        console.warn("không tìm thấy userId");
        return;
      }

      // Gọi API allFollowingByUserId để kiểm tra xem currentUserId có follow userId này không
      const responseFollowing = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/follows/allFollowingByUserId/${currentUserId}`
      );
      const followingData = await responseFollowing.json();

      // Kiểm tra xem userId có trong danh sách following của currentUserId không
      const isFollowingNow = followingData.some(
        (item) => item.followingUserId == userId
      );
      setIsFollowing(isFollowingNow);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };
  const handleFollowUnfollowAPI = async (targetUserId) => {
    try {
      const currentUserId = await AsyncStorage.getItem("userId");
      if (!currentUserId) {
        console.warn("Không tìm thấy userId");
        return;
      }

      const followDate = new Date().toISOString();

      // followingUserByCustomer
      const responseFollowing = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/follows/followingUserByCustomer`,
        {
          method: "POST",
          body: JSON.stringify({
            followingId: 0,
            userId: currentUserId,
            followingUserId: targetUserId,
            followDate: followDate,
          }),
        }
      );
      if (!responseFollowing.ok) {
        console.error(
          "Error khi gọi API followingUserByCustomer:",
          responseFollowing.status
        );
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể thực hiện hành động. Vui lòng thử lại.",
        });
        return null;
      }

      const dataFollowing = await responseFollowing.text();

      let isNowFollowing = false;
      if (dataFollowing.includes("follow success")) {
        isNowFollowing = true;
      } else if (dataFollowing.includes("unfollow success")) {
        isNowFollowing = false;
      }

      // followerUserByCustomer
      const responseFollower = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/follows/followerUserByCustomer`,
        {
          method: "POST",
          body: JSON.stringify({
            followerId: 0,
            userId: targetUserId,
            followerUserId: currentUserId,
            followDate: followDate,
          }),
        }
      );
      if (!responseFollower.ok) {
        console.error(
          "Error khi gọi API followerUserByCustomer:",
          responseFollower.status
        );
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể thực hiện hành động. Vui lòng thử lại.",
        });
        return null;
      }

      const dataFollower = await responseFollower.text();
      if (dataFollower.includes("follow success")) {
        isNowFollowing = true;
      } else if (dataFollower.includes("unfollow success")) {
        isNowFollowing = false;
      }
      return isNowFollowing;
    } catch (error) {
      console.error("Lỗi khi follow/unfollow:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Có lỗi xảy ra, vui lòng thử lại.",
      });
      return null;
    }
  };

  const handleFollowUnfollow = async () => {
    if (isFollowing) {
      toggleUnfollowModal();
      return;
    }
    const isNowFollowing = await handleFollowUnfollowAPI(userId);
    if (isNowFollowing === null) return; // Lỗi hoặc không xác định, không thay đổi state
    if (isNowFollowing) {
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Bạn đã theo dõi người dùng này!",
      });
      setIsFollowing(true);
    } else {
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Bạn đã theo dõi người dùng này!",
      });
      setIsFollowing(false);
    }
    checkFollowStatus();
  };

  const confirmUnfollow = async () => {
    const isNowFollowing = await handleFollowUnfollowAPI(userId);

    if (isNowFollowing === null) return; // Lỗi hoặc không xác định, không thay đổi state

    if (!isNowFollowing) {
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Bạn đã hủy theo dõi người dùng này!",
      });
      setIsFollowing(false);
    } else {
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Bạn đã hủy theo dõi người dùng này!",
      });
      setIsFollowing(true);
    }
    toggleUnfollowModal();
    checkFollowStatus();
  };
  const cancelUnfollow = () => {
    toggleUnfollowModal();
  };

  const renderPost = (item, activeTab) => (
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
      <TouchableOpacity
        onPress={() => navigation.navigate("PostDetailScreen", { post: item })}
        activeOpacity={0.8}
      >
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
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 12,
                marginTop: 3,
                color: COLORS.grey,
              }}
            >
              {item.createdAt || "Ngày không xác định"}
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
                uri: image.imageUrl,
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

      {activeTab === "accepted" && (
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 20,
            }}
            onPress={() => console.log("Like button pressed")}
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
            onPress={() =>
              navigation.navigate("PostDetailScreen", { post: item })
            }
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={28} color={COLORS.green} />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: FONTS.bold, fontSize: 25, color: COLORS.green }}
        >
          Trang cá nhân
        </Text>
        <View></View>
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
          <TouchableOpacity
            style={{
              backgroundColor: isFollowing ? COLORS.grey : COLORS.green,
              padding: 10,
              borderRadius: 5,
              marginTop: 10,
            }}
            onPress={handleFollowUnfollow}
          >
            <Text style={{ color: COLORS.white }}>
              {isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </Text>
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
              {activeTab === "accepted"
                ? "Bài đăng"
                : activeTab === "pending"
                ? "Bài chờ duyệt"
                : "Bài bị từ chối"}
            </Text>
          </View>

          {loading ? (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              Đang tải...
            </Text>
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
            rejectedPosts.map((post) => renderPost(post))
          )}
        </View>
      </ScrollView>
      <Modal
        visible={unfollowModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {isFollowing
                ? "Bạn có chắc chắn muốn hủy theo dõi?"
                : "Bạn có chắc chắn muốn theo dõi?"}
            </Text>
            <TouchableOpacity
              onPress={confirmUnfollow}
              style={styles.modalUnfollowButton}
            >
              <Text style={styles.modalUnfollowText}>
                {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={cancelUnfollow}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Toast />
    </>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    padding: 20,
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 15,
  },
  modalText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalUnfollowButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    alignItems: "center",
  },
  modalUnfollowText: {
    fontSize: 16,
    color: "red",
    fontFamily: FONTS.semiBold,
  },
  modalCancelButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    alignItems: "center",
    marginTop: 5,
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: FONTS.medium,
  },
});
