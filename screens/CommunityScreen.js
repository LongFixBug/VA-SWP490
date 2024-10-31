import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";

const CommunityScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Cộng đồng");
  const [communityPosts, setCommunityPosts] = useState([]);
  const [expertPosts, setExpertPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch articles from the API
  const fetchArticles = async () => {
    try {
      // Fetch bài viết của Customer
      const communityResponse = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/GetArticleByRoleId/3"
      );
      const communityData = await communityResponse.json();

      // Fetch bài viết của Nutritionist
      const expertResponse = await fetch(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/GetArticleByRoleId/5"
      );
      const expertData = await expertResponse.json();

      setCommunityPosts(communityData);
      setExpertPosts(expertData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const renderNewPostSection = () => (
    <TouchableOpacity
      style={styles.newPostContainer}
      onPress={() => navigation.navigate("NewPostScreen")}
    >
      <View style={styles.newPostHeader}>
        <Pressable
          onPress={() => {
            navigation.navigate("Profile");
          }}
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
        </Pressable>
        <Text style={styles.username}>Nguyễn Hải Long</Text>
      </View>
      <Text style={styles.newPostText}>Bạn muốn viết gì ...</Text>
      <View style={styles.newPostActions}>
        <Icon name="image-outline" size={24} color={COLORS.grey} />
        <Icon name="camera-outline" size={24} color={COLORS.grey} />
      </View>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => navigation.navigate("PostDetailScreen", { article: item })}
    >
      <View style={styles.postHeader}>
        <Icon name="person-circle-outline" size={32} color={COLORS.black} />
        <Text style={styles.username}>{item.authorName}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content.substring(0, 50)}...</Text>
      <View style={styles.interactionBar}>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="heart-outline" size={20} color={COLORS.grey} />
          <Text style={styles.iconText}>{item.likes}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={COLORS.green}
        style={styles.loading}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Cộng đồng" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Cộng đồng")}
        >
          <Text style={styles.tabText}>Cộng đồng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Chuyên gia" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Chuyên gia")}
        >
          <Text style={styles.tabText}>Chuyên gia</Text>
        </TouchableOpacity>
      </View>

      {/* Only show new post section if in the "Cộng đồng" tab */}
      {activeTab === "Cộng đồng" && renderNewPostSection()}

      {/* List of posts */}
      <FlatList
        data={activeTab === "Cộng đồng" ? communityPosts : expertPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.articleId.toString()}
        contentContainerStyle={styles.postList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.grey,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: COLORS.green,
  },
  tabText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  postList: {
    paddingHorizontal: 20,
  },
  newPostContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  newPostHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  newPostText: {
    marginLeft: 20,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginBottom: 10,
  },
  newPostActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  postContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  username: {
    marginTop: 5,
    marginLeft: 5,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 5,
    marginRight: 5,
    textAlign: "center",
  },
  content: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginLeft: 5,
    marginBottom: 10,
    marginRight: 5,
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconText: {
    marginLeft: 5,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CommunityScreen;
