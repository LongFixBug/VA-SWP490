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
  const [images, setImages] = useState([]); // Store selected images
  const [user, setUser] = useState(null); // Store user data

  const CLOUD_NAME = "dpzzzifpa";
  const UPLOAD_PRESET = "vegetarian assistant";

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          const response = await axios.get(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${storedUserId}`
          );

          if (response.status === 200) {
            setUser(response.data);
          } else {
            console.log("Lỗi khi lấy thông tin người dùng:", response.data);
          }
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy thông tin người dùng:", error);
      }
    };

    fetchUserDetails();
  }, []);

  // Upload từng ảnh lên Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg", // Hoặc image/png
        name: "image_upload.jpg",
      });
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Upload thành công. URL ảnh:", result.secure_url);
        return result.secure_url;
      } else {
        console.error("Lỗi khi upload ảnh lên Cloudinary:", result);
        throw new Error("Upload không thành công.");
      }
    } catch (error) {
      console.error("Lỗi trong quá trình upload ảnh:", error);
      throw error;
    }
  };

  // Xử lý đăng bài
  const handlePost = async () => {
    if (!user) {
      Alert.alert("Lỗi", "Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    if (!title || !content || images.length === 0) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tiêu đề, nội dung và chọn ảnh.");
      return;
    }

    try {
      // Upload từng ảnh và lấy URL từ Cloudinary
      const uploadedImageUrls = [];
      for (const img of images) {
        const imageUrl = await uploadImageToCloudinary(img.uri);
        uploadedImageUrls.push(imageUrl);
      }

      console.log("Ảnh đã upload:", uploadedImageUrls);

      // Chuẩn bị payload gửi tới API
      const newArticle = {
        articleId: 0,
        title,
        content,
        status: "pending",
        authorId: user.userId,
        authorName: user.username,
        articleImages: uploadedImageUrls, // URL ảnh từ Cloudinary
        likes: 0,
      };

      console.log("Dữ liệu bài viết gửi tới API:", JSON.stringify(newArticle, null, 2));

      // Gửi request tới API backend
      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleByCustomer",
        newArticle
      );

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Thành công", "Bài viết đã được tạo thành công!");
        navigation.goBack();
      } else {
        console.error("Lỗi khi tạo bài viết:", response.data);
        Alert.alert("Lỗi", "Không thể tạo bài viết. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi trong quá trình đăng bài:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại.");
    }
  };

  const handleChoosePhoto = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel) {
          console.log("Người dùng đã huỷ chọn ảnh.");
        } else if (response.errorMessage) {
          console.error("Lỗi khi chọn ảnh:", response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          console.log("Ảnh đã chọn:", selectedImage);
          setImages([...images, selectedImage]); // Thêm ảnh vào danh sách
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
          console.log("Người dùng đã huỷ chụp ảnh.");
        } else if (response.errorMessage) {
          console.error("Lỗi khi chụp ảnh:", response.errorMessage);
        } else if (response.assets) {
          const takenPhoto = response.assets[0];
          setImages([...images, takenPhoto]);
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
    marginTop: 10,
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
    borderRadius: 10,
  },
  removeIcon: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.white,
    borderRadius: 50,
  },
});
