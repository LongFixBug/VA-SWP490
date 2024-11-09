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

  // Fetch articles from the API
  
  const fetchUserDetails = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const response = await fetch(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${userId}`
        );
        const data = await response.json();
        setUsername(data.username || "Người dùng");
      } else {
        console.error("User ID not found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const communityResponse = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/3"
      );
      const communityData = await communityResponse.json();

      const expertResponse = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/5"
      );
      const expertData = await expertResponse.json();

      const filteredCommunityPosts = communityData.filter(
        (post) => post.status === "accepted"
      );
      const filteredExpertPosts = expertData.filter(
        (post) => post.status === "accepted"
      );

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
    <TouchableOpacity onPress={() => navigation.navigate('PostDetailScreen', { post: item })}>
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
            uri: "https://mighty.tools/mockmind-api/content/human/44.jpg",
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
            {item.authorName}
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
          numberOfLines={!expandedDecription[item.articleId] ? 2 : undefined}
        >
          {item.content}
        </Text>
        <TouchableOpacity onPress={() => toggleShowMore(item.articleId)}>
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
        <ScrollView
          horizontal
          contentContainerStyle={{
            marginTop: 10,
          }}
        >
          {item.images &&
            item.images.map((imageUrl, index) => (
              <Image
                key={index}
                source={{
                  uri: imageUrl,
                }}
                style={{
                  width: 200,
                  height: 150,
                  resizeMode: "cover",
                  borderRadius: 8,
                  marginLeft: index === 0 ? 0 : 10,
                }}
              />
            ))}
        </ScrollView>
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
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {refreshing && (
        <Text style={{ textAlign: "center", marginVertical: 10, color: COLORS.green }}>
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
                  uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
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
          {dataTabView.map((tabView, index) => (
            <TouchableOpacity
              key={index}
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
          <Text style={{ textAlign: "center", marginVertical: 20 }}>Loading...</Text>
        ) : (
          <View>
            {currentTabView === 1
              ? communityPosts.map((post) => renderPost(post))
              : expertPosts.map((post) => renderPost(post))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({});
