import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/color';
import FONTS from '../constants/font';
import { useNavigation } from '@react-navigation/native';


const NewPostScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New article</Text>
      </View>

      <ScrollView style={styles.scrollViewContent}>
        {/* User Info and Title */}
        <View style={styles.userInfo}>
          <Icon name="person-circle-outline" size={32} color={COLORS.black} />
          <Text style={styles.username}>lukaku</Text>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Content */}
        <TextInput
          style={styles.contentInput}
          placeholder="Content..."
          value={content}
          onChangeText={setContent}
          multiline={true}
        />

        {/* Icons for Image and Camera */}
        <View style={styles.iconContainer}>
          <Icon name="image-outline" size={40} color={COLORS.black} />
          <Icon name="camera-outline" size={40} color={COLORS.black} />
        </View>
      </ScrollView>

      {/* Post Button */}
      <TouchableOpacity style={styles.postButton}>
        <Text style={styles.postButtonText}>POST</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    marginLeft: 10,
  },
  scrollViewContent: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  titleInput: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 5,
    marginBottom: 20,
  },
  contentInput: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 10,
    height: 150, // Adjust height based on your preference
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 20,
  },
  postButton: {
    backgroundColor: COLORS.green,
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  postButtonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default NewPostScreen;
