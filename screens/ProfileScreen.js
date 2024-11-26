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
import IconAnt from "react-native-vector-icons/AntDesign";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPendingPosts, setShowPendingPosts] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [rejectedPosts, setRejectedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("accepted"); // Thêm state activeTab

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
    setRefreshing(false);
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
      {/* Thông tin bài viết */}
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

      {/* Tương tác thích và bình luận - chỉ hiển thị nếu là bài "đã chấp nhận" */}
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
        {/* Thông tin người dùng */}
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

          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
              marginTop: 10,
            }}
          >
            {/* Bài đăng */}
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

            {/* Bài chờ duyệt */}
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

            {/* Bài bị từ chối */}
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

            {/* Người theo dõi */}
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

        {/* Danh sách bài viết */}
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
            {/* <Icon name="options" size={24} color={COLORS.grey} /> */}
          </View>

          {/* Hiển thị danh sách bài viết */}
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
              userPosts.map((post) => renderPost(post, activeTab)) // Sử dụng hàm renderPost
            )
          ) : activeTab === "pending" ? (
            pendingPosts.length === 0 ? (
              <Text style={{ textAlign: "center", marginVertical: 20 }}>
                Không có bài viết chờ duyệt
              </Text>
            ) : (
              pendingPosts.map((post) => renderPost(post, activeTab)) // Sử dụng hàm renderPost
            )
          ) : rejectedPosts.length === 0 ? (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              Không có bài viết bị từ chối
            </Text>
          ) : (
            rejectedPosts.map((post) => renderPost(post)) // Sử dụng hàm renderPost
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
