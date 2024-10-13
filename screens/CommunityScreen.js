import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/color';
import FONTS from '../constants/font';

const CommunityScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Cộng đồng');
  const [communityPosts, setCommunityPosts] = useState([]);
  const [expertPosts, setExpertPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch articles from the API
  const fetchArticles = async () => {
    try {
      const response = await fetch('https://va-api-2efefb5aee82.herokuapp.com/articles');
      const data = await response.json();

      // Separate posts based on role
      const communityData = data.data.filter(post => post.author_role === 'Customer');
      const expertData = data.data.filter(post => post.author_role === 'Nutritionist');

      setCommunityPosts(communityData);
      setExpertPosts(expertData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const renderNewPostSection = () => (
    <TouchableOpacity style={styles.newPostContainer} onPress={() => navigation.navigate('NewPostScreen')}>
      <View style={styles.newPostHeader}>
        <Icon name="person-circle-outline" size={32} color={COLORS.black} />
        <Text style={styles.username}>lukaku</Text>
      </View>
      <Text style={styles.newPostText}>What your content?</Text>
      <View style={styles.newPostActions}>
        <Icon name="image-outline" size={24} color={COLORS.grey} />
        <Icon name="camera-outline" size={24} color={COLORS.grey} />
      </View>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => navigation.navigate('PostDetailScreen', { article: item })}
    >
      <View style={styles.postHeader}>
        <Icon name="person-circle-outline" size={32} color={COLORS.black} />
      
          <Text style={styles.username}>{item.author_id}</Text>
      </View> 
      {/* <Text style={styles.roleText}>{item.author_role === 'Customer' ? 'Customer' : 'Nutritionist'}</Text> */}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content.substring(0, 50)}...</Text>
      <View style={styles.interactionBar}>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="heart-outline" size={20} color={COLORS.grey} />
          <Text style={styles.iconText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="chatbubble-outline" size={20} color={COLORS.grey} />
          <Text style={styles.iconText}>{item.comments}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.green} style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Cộng đồng' && styles.activeTab]}
          onPress={() => setActiveTab('Cộng đồng')}
        >
          <Text style={styles.tabText}>Cộng đồng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Chuyên gia' && styles.activeTab]}
          onPress={() => setActiveTab('Chuyên gia')}
        >
          <Text style={styles.tabText}>Chuyên gia</Text>
        </TouchableOpacity>
      </View>

      {/* Only show new post section if in the "Cộng đồng" tab */}
      {activeTab === 'Cộng đồng' && renderNewPostSection()}

      {/* List of posts */}
      <FlatList
        data={activeTab === 'Cộng đồng' ? communityPosts : expertPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.article_id.toString()}
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
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.grey,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  newPostText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginBottom: 10,
  },
  newPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  postContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
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
    marginLeft: 5,  // Adjust margin to align with the avatar
    marginBottom: 5, // Add spacing between the title and content
    marginRight:5,
  },
  content: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginLeft: 5, // Keep the same margin as the title for alignment
    marginBottom: 10,
    marginRight:5,
  },

  // roleText: {
  //   fontSize: 12,
  //   color: COLORS.grey,
  //   alignSelf: 'flex-end',
  //   marginTop: -10,
  //   marginRight: 10,
  // },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    marginLeft: 5,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommunityScreen;
