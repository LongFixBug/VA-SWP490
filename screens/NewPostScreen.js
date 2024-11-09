import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import { ButtonFloatBottom } from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";

const NewPostScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // To store selected images
  const [user, setUser] = useState(null); // Store user data

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          const response = await axios.get(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${storedUserId}`
          );

          if (response.status === 200) {
            console.log("Thông tin người dùng:", response.data);
            setUser(response.data);
          } else {
            console.log("Lỗi khi lấy thông tin người dùng:", response.data);
          }
        } else {
          console.log("Không tìm thấy userId trong AsyncStorage.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy thông tin người dùng:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handlePost = async () => {
    if (!user) {
      Alert.alert("Lỗi", "Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const newArticle = {
        articleId: 0,
        title: title,
        content: content,
        status: "pending",
        authorId: user.userId,
        authorName: user.username,
        articleImages: images.map((img) => img.uri), // Send image URIs
        likes: 0,
      };

      console.log("Dữ liệu được gửi đến API:", newArticle);

      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleByCustomer",
        newArticle
      );

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Thành công", "Bài viết đã được tạo thành công!");
        navigation.goBack();
      } else {
        console.log("Response data:", response.data);
        Alert.alert("Lỗi", "Không thể tạo bài viết. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại.");
    }
  };

  const handleChoosePhoto = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 1, // Allow single selection for now
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorMessage) {
          console.error("Image picker error:", response.errorMessage);
        } else if (response.assets) {
          const selectedImage = response.assets[0];
          console.log("Image selected:", selectedImage);
          setImages([...images, selectedImage]); // Add the selected image to the list
        }
      }
    );
  };

  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: "photo",
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled camera");
        } else if (response.errorMessage) {
          console.error("Camera error:", response.errorMessage);
        } else if (response.assets) {
          const takenPhoto = response.assets[0];
          console.log("Photo taken:", takenPhoto);
          setImages([...images, takenPhoto]); // Add the captured photo to the list
        }
      }
    );
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };
  
  return (
    <>
      <Header
        title={"Bài viết mới"}
        leftIcon={"close"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.white }}
        contentContainerStyle={{ paddingHorizontal: 30 }}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Tiêu đề</Text>
          <View style={styles.inputRow}>
            <Icon name="receipt-outline" size={18} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              placeholder="Aa..."
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nội dung</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, { minHeight: 100, textAlignVertical: "top" }]}
              placeholder="Nhập nội dung..."
              numberOfLines={5}
              multiline
              value={content}
              onChangeText={setContent}
            />
          </View>
        </View>
        <Text style={styles.inputLabel}>Hình ảnh ({images.length}/6)</Text>
        <View style={styles.imageContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeIcon}
                onPress={() => removeImage(index)}
              >
                <Icon name="close-circle" size={20} color={COLORS.lightGrey} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 6 && (
            <TouchableOpacity style={styles.addImage} onPress={handleChoosePhoto}>
              <Icon name="image" size={32} color={COLORS.darkGrey} />
            </TouchableOpacity>
          )}
          {images.length < 6 && (
            <TouchableOpacity style={styles.addImage} onPress={handleTakePhoto}>
              <Icon name="camera" size={32} color={COLORS.darkGrey} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <ButtonFloatBottom
        title={"Đăng bài"}
        buttonColor={COLORS.green}
        onPress={handlePost}
      />
    </>
  );
};

export default NewPostScreen;

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: COLORS.greyPastel,
    marginTop: 5,
  },
  textInput: {
    fontFamily: FONTS.medium,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flex: 1,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    marginRight: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
  removeIcon: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.white,
    borderRadius: 50,
  },
  addImage: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.darkGrey,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginRight: 10,
  },
});
