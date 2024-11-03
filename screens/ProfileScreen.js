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
  const [expandedDecription, setExpandedDecription] = useState({});
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("Người dùng");
  const [userPosts, setUserPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [showPendingPosts, setShowPendingPosts] = useState(false);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch user posts
  const fetchUserPosts = async () => {
    if (userId) {
      try {
        console.log("Fetching posts for userId:", userId);
        const response = await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleByAuthorId/${userId}`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          // Filter posts by status
          const acceptedPosts = data.filter((post) => post.status === "accepted");
          const pendingPosts = data.filter((post) => post.status === "pending");

          setUserPosts(acceptedPosts);
          setPendingPosts(pendingPosts);
          setPendingPostsCount(pendingPosts.length);
        } else {
          console.log("Invalid data format:", data);
          setUserPosts([]);
          setPendingPosts([]);
          setPendingPostsCount(0);
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Fetch username from AsyncStorage
  useEffect(() => {
    const getUsernameFromStorage = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          console.log("Không tìm thấy username trong AsyncStorage");
        }
      } catch (error) {
        console.error("Lỗi khi lấy username từ AsyncStorage:", error);
      }
    };

    getUsernameFromStorage();
  }, []);

  // Fetch userId from AsyncStorage
  useEffect(() => {
    const getUserIdFromStorage = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.log("Không tìm thấy User ID trong AsyncStorage.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
      }
    };

    getUserIdFromStorage();
  }, []);

  // Fetch user posts when userId is set
  useEffect(() => {
    if (userId !== null) {
      fetchUserPosts();
    }
  }, [userId]);

  const toggleShowMore = (id) => {
    setExpandedDecription((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserPosts(); // Call fetchUserPosts directly here
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
        <Icon name="settings-outline" size={28} color={COLORS.green} />
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white, padding: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {refreshing && (
          <Text style={{ textAlign: "center", marginVertical: 10, color: COLORS.green }}>
            Đang làm mới trang...
          </Text>
        )}
        <View style={{ flexDirection: "row" }}>
          <Image
            source={{
              uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
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
  {/* Bài đăng Section */}
  <TouchableOpacity
    style={{
      alignItems: "center",
      width: "30%",
    }}
    onPress={() => setShowPendingPosts(false)} // Ensure this shows accepted posts
  >
    <Text
      style={{
        fontFamily: FONTS.bold,
        fontSize: 15,
      }}
    >
      {userPosts.length}
    </Text>
    <Text
      style={{
        fontFamily: FONTS.medium,
        marginTop: 8,
        fontSize: 12,
      }}
      numberOfLines={1}
    >
      Bài đăng
    </Text>
  </TouchableOpacity>

  {/* Bài chờ duyệt Section */}
  <TouchableOpacity
    style={{
      alignItems: "center",
      width: "35%",
    }}
    onPress={() => setShowPendingPosts(true)} // Ensure this shows pending posts
  >
    <Text
      style={{
        fontFamily: FONTS.bold,
        fontSize: 15,
      }}
    >
      {pendingPostsCount}
    </Text>
    <Text
      style={{
        fontFamily: FONTS.medium,
        marginTop: 8,
        fontSize: 12,
      }}
      numberOfLines={1}
    >
      Bài chờ duyệt
    </Text>
  </TouchableOpacity>


            <TouchableOpacity style={{ alignItems: "center", width: "35%" }}>
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: 15,
                }}
              >
                123
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  marginTop: 8,
                  fontSize: 12,
                }}
                numberOfLines={1}
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
          {username}
        </Text>
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
          {loading ? (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              Loading...
            </Text>
          ) : showPendingPosts ? (
            pendingPosts.length === 0 ? (
              <Text style={{ textAlign: "center", marginVertical: 20 }}>
                Không có bài viết chờ duyệt
              </Text>
            ) : (
              pendingPosts.map((item) => (
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
                          uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
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
                          {username}
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
                        color={COLORS.greySolid}
                        size={24}
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
                        numberOfLines={
                          !expandedDecription[item.articleId] ? 2 : undefined
                        }
                      >
                        {item.content}
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleShowMore(item.articleId)}
                      >
                        <Text
                          style={{
                            fontFamily: FONTS.medium,
                            color: COLORS.grey,
                            marginTop: 5,
                            fontSize: 13,
                          }}
                        >
                          {expandedDecription[item.articleId] ? "Ẩn bớt" : "Xem thêm"}
                        </Text>
                      </TouchableOpacity>
                      <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginRight: 20,
                          }}
                        >
                          <IconAnt name="like2" size={28} color={COLORS.greySolid} />
                          <Text
                            style={{
                              fontFamily: FONTS.semiBold,
                              fontSize: 16,
                              color: COLORS.greySolid,
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
                        uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
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
                        {username}
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
                      color={COLORS.greySolid}
                      size={24}
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
                      numberOfLines={
                        !expandedDecription[item.articleId] ? 2 : undefined
                      }
                    >
                      {item.content}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleShowMore(item.articleId)}
                    >
                      <Text
                        style={{
                          fontFamily: FONTS.medium,
                          color: COLORS.grey,
                          marginTop: 5,
                          fontSize: 13,
                        }}
                      >
                        {expandedDecription[item.articleId] ? "Ẩn bớt" : "Xem thêm"}
                      </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 20,
                        }}
                      >
                        <IconAnt name="like2" size={28} color={COLORS.greySolid} />
                        <Text
                          style={{
                            fontFamily: FONTS.semiBold,
                            fontSize: 16,
                            color: COLORS.greySolid,
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
