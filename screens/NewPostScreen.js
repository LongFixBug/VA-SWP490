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
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
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

  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
      console.error("Không tìm thấy token.");
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
    const fetchUserDetails = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData"); // Lấy thông tin người dùng từ AsyncStorage
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData); // Chuyển chuỗi JSON thành đối tượng
          setUser(parsedData); // Cập nhật trạng thái người dùng
        } else {
          console.error(
            "Không tìm thấy thông tin người dùng trong AsyncStorage."
          );
        }
      } catch (error) {
        console.error(
          "Lỗi khi lấy thông tin người dùng từ AsyncStorage:",
          error
        );
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

  const handlePost = async () => {
    if (!user) {
      Alert.alert(
        "Lỗi",
        "Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }

    if (!title || !content) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      // Nếu có ảnh thì upload, nếu không bỏ qua bước này
      const uploadedImageUrls = [];
      if (images.length > 0) {
        for (const img of images) {
          const imageUrl = await uploadImageToCloudinary(img.uri);
          uploadedImageUrls.push(imageUrl);
        }
      }

      const newArticle = {
        articleId: 0,
        title,
        content,
        status: "pending",
        authorId: user.userId,
        authorName: user.username,
        articleImages: uploadedImageUrls, // Mảng ảnh, có thể rỗng
        likes: 0,
      };

      // Log dữ liệu gửi lên API
      console.log("Dữ liệu gửi lên API:", JSON.stringify(newArticle, null, 2));

      const response = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleByCustomer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newArticle),
        }
      );

      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          "Thành công",
          "Bài viết đã được tạo thành công, vui lòng chờ VA duyệt bài!"
        );
        navigation.goBack();
      } else {
        const responseData = await response.json();
        console.error("Lỗi khi tạo bài viết:", responseData);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <Header
            title={"Bài viết mới"}
            leftIcon={"close"}
            colorBackground={COLORS.white}
            colorText={COLORS.black}
            onPress={() => navigation.goBack()}
          />
          <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.white }}
            contentContainerStyle={{
              paddingHorizontal: 30,
              paddingBottom: 100,
            }}
          >
            {/* Tiêu đề */}
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

            {/* Nội dung */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nội dung</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.textInput,
                    { minHeight: 100, textAlignVertical: "top" },
                  ]}
                  placeholder="Nhập nội dung..."
                  numberOfLines={5}
                  multiline
                  value={content}
                  onChangeText={setContent}
                />
              </View>
            </View>

            {/* Hình ảnh */}
            <Text style={styles.inputLabel}>Hình ảnh ({images.length}/6)</Text>
            <View style={styles.imageContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeIcon}
                    onPress={() => removeImage(index)}
                  >
                    <Icon
                      name="close-circle"
                      size={20}
                      color={COLORS.lightGrey}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 6 && (
                <TouchableOpacity
                  style={styles.addImage}
                  onPress={handleChoosePhoto}
                >
                  <Icon name="image" size={32} color={COLORS.darkGrey} />
                </TouchableOpacity>
              )}
              {images.length < 6 && (
                <TouchableOpacity
                  style={styles.addImage}
                  onPress={handleTakePhoto}
                >
                  <Icon name="camera" size={32} color={COLORS.darkGrey} />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Nút đăng bài */}
          <ButtonFloatBottom
            title={"Đăng bài"}
            buttonColor={COLORS.green}
            onPress={handlePost}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
