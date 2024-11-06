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

const images = [
  "https://foodphoto.vn/wp-content/uploads/2023/10/com-nieu-11.jpg",
  "https://png.pngtree.com/thumb_back/fh260/background/20230724/pngtree-korean-cooking-is-one-of-the-best-of-all-the-foods-image_10193156.jpg",
  "https://hitasanti.com/wp-content/uploads/2020/05/hita-vegan-200-mon-an-chay-4.jpg",
  "https://foodphoto.vn/wp-content/uploads/2023/10/com-nieu-11.jpg",
];

const NewPostScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("Người dùng");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          console.log("Username từ AsyncStorage:", storedUsername);
          setUsername(storedUsername);
        } else {
          console.log("Không tìm thấy username trong AsyncStorage.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy username từ AsyncStorage:", error);
      }
    };

    fetchUsername();
  }, []);

  const handlePost = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }

      const newArticle = {
        articleId: 0,
        title: title,
        content: content,
        status: "pending",
        authorId: parseInt(userId),
        authorName: username,
        articleImages: ["https://picsum.photos/200"], // Giá trị placeholder cho thử nghiệm
        likes: 0,
      };

      console.log("Dữ liệu được gửi đến API:", newArticle);

      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleByCustomer",
        newArticle
      );

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Thành công", "Bài viết đã được tạo thành công!");
        navigation.goBack(); // Quay lại trang trước đó
      } else {
        console.log("Response data:", response.data);
        Alert.alert("Lỗi", "Không thể tạo bài viết. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
      console.log("Chi tiết lỗi:", error.response ? error.response.data : error.message);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại.");
    }
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
              style={[
                styles.textInput,
                {
                  minHeight: 100,
                  textAlignVertical: "top",
                  paddingLeft: 0,
                },
              ]}
              placeholder="Nhập nội dung..."
              numberOfLines={5}
              multiline
              value={content}
              onChangeText={setContent}
            />
          </View>
        </View>
        <Text
          style={{ fontFamily: FONTS.semiBold, fontSize: 15, marginBottom: 15 }}
        >
          Hình ảnh ({images.length}/6)
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {images.map((image, index) => (
            <View
              key={index}
              style={{
                marginBottom: 15,
                width: "30%",
                height: 90,
                backgroundColor: COLORS.white,
                borderRadius: 10,
                marginRight:
                  (index + 1) % 3 === 0
                    ? 0
                    : "4.3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333%",
              }}
            >
              <View style={{ width: "100%", height: "100%" }}>
                <Image
                  source={{ uri: image }}
                  width={"100%"}
                  height={"100%"}
                  style={{ borderRadius: 5 }}
                />
                <Icon
                  name="close-circle"
                  size={20}
                  color={COLORS.lightGrey}
                  style={{
                    position: "absolute",
                    right: -10,
                    top: -10,
                    backgroundColor: COLORS.white,
                    borderRadius: 50,
                  }}
                />
              </View>
            </View>
          ))}
          {images.length < 6 && (
            <TouchableOpacity
              style={{
                width: "30%",
                height: 90,
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.darkGrey,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
              }}
            >
              <Icon name="image" size={32} color={COLORS.darkGrey} />
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
});
