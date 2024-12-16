import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Modal,
} from "react-native";
import Header from "../components/Header";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const API_BASE_URL =
  "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net";

const FollowerScreen = ({ navigation }) => {
  const [currentTabView, setCurrentTabView] = useState(1);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [myFollowingUsers, setMyFollowingUsers] = useState([]);

  // State cho modal confirm unfollow
  const [unfollowUser, setUnfollowUser] = useState(null); // Lưu user muốn unfollow, null nếu không

  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  const parseJSON = async (response) => {
    if (response.ok) {
      return response.json();
    } else {
      console.error("Error fetching:", response.statusText);
      return [];
    }
  };

  const fetchLoggedInUserId = async () => {
    const userId = await AsyncStorage.getItem("userId");
    setLoggedInUserId(userId);
    return userId;
  };

  const fetchMyFollowingUsers = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/follows/allFollowingByUserId/${userId}`
      );
      const followingData = await parseJSON(response);
      const myFollowing = followingData.map((f) => f.followingUserId);
      setMyFollowingUsers(myFollowing);
    } catch (error) {
      console.error("Error fetching my following users:", error);
    }
  };

  const fetchFollowers = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/follows/allFollowerByUserId/${userId}`
      );
      const followerData = await parseJSON(response);

      const followersDetails = await Promise.all(
        followerData.map(async (follower) => {
          const resUser = await fetchWithAuth(
            `${API_BASE_URL}/api/v1/users/getUserByID/${follower.followerUserId}`
          );
          return parseJSON(resUser);
        })
      );
      setFollowers(followersDetails);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchFollowings = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/follows/allFollowingByUserId/${userId}`
      );
      const followingData = await parseJSON(response);

      const followingsDetails = await Promise.all(
        followingData.map(async (following) => {
          const resUser = await fetchWithAuth(
            `${API_BASE_URL}/api/v1/users/getUserByID/${following.followingUserId}`
          );
          return parseJSON(resUser);
        })
      );
      setFollowings(followingsDetails);
    } catch (error) {
      console.error("Error fetching followings:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const userId = await fetchLoggedInUserId();
    if (currentTabView === 1) {
      await fetchFollowers(userId);
    } else {
      await fetchFollowings(userId);
    }
    await fetchMyFollowingUsers(userId);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      const userId = await fetchLoggedInUserId();
      if (currentTabView === 1) {
        await fetchFollowers(userId);
      } else {
        await fetchFollowings(userId);
      }
      await fetchMyFollowingUsers(userId);
    };
    loadData();
  }, [currentTabView]);

  const handleFollowUnfollowAPI = async (targetUserId) => {
    // Logic y như userprofile
    try {
      const currentUserId = loggedInUserId;
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

  const handleFollowButtonPress = (user) => {
    const targetUserId = user.userId;
    const isFollowing = myFollowingUsers.includes(targetUserId);

    if (isFollowing) {
      // Đang theo dõi -> người dùng muốn unfollow => hiển thị modal xác nhận
      setUnfollowUser(user);
    } else {
      // Chưa theo dõi -> follow ngay
      handleFollowUnfollow(targetUserId, false);
    }
  };

  const handleFollowUnfollow = async (targetUserId, isUnfollow = false) => {
    const isNowFollowing = await handleFollowUnfollowAPI(targetUserId);
    if (isNowFollowing === null) return; // Lỗi hoặc không xác định, không thay đổi state

    if (isNowFollowing) {
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Bạn đã hủy theo dõi người dùng này!",
      });
      if (!myFollowingUsers.includes(targetUserId)) {
        setMyFollowingUsers((prev) => [...prev, targetUserId]);
      }
    } else {
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Bạn đã theo dõi người dùng này!",
      });
      setMyFollowingUsers((prev) => prev.filter((id) => id !== targetUserId));
    }

    // Load lại trang ngay lập tức
    onRefresh();
  };

  const confirmUnfollow = () => {
    if (!unfollowUser) return;
    const targetUserId = unfollowUser.userId;

    // Người dùng xác nhận bỏ theo dõi
    handleFollowUnfollow(targetUserId, true);
    setUnfollowUser(null); // Đóng modal

    // Load lại trang ngay lập tức
    onRefresh();
  };

  const cancelUnfollow = () => {
    // Người dùng hủy bỏ việc unfollow
    setUnfollowUser(null);
  };

  const renderUser = (user) => {
    const avatarUrl =
      user.imageUrl && user.imageUrl !== "null"
        ? user.imageUrl
        : "https://via.placeholder.com/45";

    const isFollowing = myFollowingUsers.includes(user.userId);

    return (
      <View
        key={user.userId}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("UserProfileScreen", { userId: user.userId })
          }
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: 45,
              height: 45,
              borderRadius: 100,
              resizeMode: "cover",
            }}
          />
          <Text
            style={{
              fontFamily: FONTS.medium,
              fontSize: 15,
              color: COLORS.black,
              marginLeft: 10,
            }}
          >
            {user.username}
          </Text>
        </TouchableOpacity>
        {loggedInUserId && loggedInUserId != user.userId && (
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: isFollowing ? COLORS.grey : COLORS.green,
              borderRadius: 5,
            }}
            onPress={() => handleFollowButtonPress(user)}
          >
            <Text style={{ color: COLORS.white }}>
              {isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <Header
        title={"Theo dõi"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"people-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: COLORS.white,
          elevation: 2,
          padding: 10,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "center",
            borderBottomWidth: 2,
            borderBottomColor:
              currentTabView === 1 ? COLORS.green : COLORS.grey,
          }}
          onPress={() => setCurrentTabView(1)}
        >
          <Text style={{ color: COLORS.black }}>Người theo dõi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "center",
            borderBottomWidth: 2,
            borderBottomColor:
              currentTabView === 2 ? COLORS.green : COLORS.grey,
          }}
          onPress={() => setCurrentTabView(2)}
        >
          <Text style={{ color: COLORS.black }}>Đang theo dõi</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ padding: 20, backgroundColor: COLORS.white }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentTabView === 1
          ? followers.map(renderUser)
          : followings.map(renderUser)}
      </ScrollView>

      <Toast />

      {/* Modal xác nhận bỏ theo dõi */}
      <Modal visible={!!unfollowUser} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {unfollowUser && (
              <>
                <Image
                  source={{
                    uri:
                      unfollowUser.imageUrl && unfollowUser.imageUrl !== "null"
                        ? unfollowUser.imageUrl
                        : "https://via.placeholder.com/45",
                  }}
                  style={styles.modalAvatar}
                />
                <Text style={styles.modalText}>
                  Bỏ theo dõi {unfollowUser.username}?
                </Text>
                <TouchableOpacity
                  onPress={confirmUnfollow}
                  style={styles.modalUnfollowButton}
                >
                  <Text style={styles.modalUnfollowText}>Bỏ theo dõi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={cancelUnfollow}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default FollowerScreen;

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
