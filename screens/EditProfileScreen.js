import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StatusBar,
  ImageBackground,
} from "react-native";
import { Menu, Provider } from "react-native-paper";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import RadioGroup from "react-native-radio-buttons-group";
import { ButtonFlex } from "../components/Button";
import Header from "../components/Header";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ButtonFloatBottom } from "../components/Button";
import { Dropdown } from "react-native-element-dropdown";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { useUser } from "../context/UserContext";

const EditProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [profession, setProfession] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedPreferencesId, setSelectedPreferencesId] = useState("1");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState(""); // Thêm trạng thái cho mật khẩu
  const [editableField, setEditableField] = useState(null);
  const [visibleProfessionMenu, setVisibleProfessionMenu] = useState(false);
  const [visibleActivityMenu, setVisibleActivityMenu] = useState(false);
  const [visibleGoalMenu, setVisibleGoalMenu] = useState(false);
  const [visibleDietaryMenu, setVisibleDietaryMenu] = useState(false);
  const { setUser } = useUser();
  const [avatar, setAvatar] = useState(null); // State for avatar
  const CLOUD_NAME = "dpzzzifpa"; // Tên Cloudinary
  const UPLOAD_PRESET = "vegetarian assistant"; // Upload preset
  const [showFullImage, setShowFullImage] = useState(false); // Hiển thị ảnh lớn

  const dataActivityLevel = [
    { id: 1, name: "Cao" },
    { id: 2, name: "Trung bình" },
    { id: 3, name: "Ít" },
  ];

  const dataGoal = [
    { id: 1, name: "Tăng cân" },
    { id: 2, name: "Giảm cân" },
    { id: 3, name: "Giữ nguyên" },
  ];

  const dataPreferences = [
    { id: 1, name: "Thuần chay" },
    { id: 2, name: "Chay không trứng, có thể có sữa, phô mai" },
    { id: 3, name: "Chay không sữa, có thể có trứng" },
    { id: 4, name: "Hỗn hợp, có thể sử dụng cả trứng, sữa" },
    { id: 5, name: "Chay bán phần (không thịt, có thể ăn cá)" },
  ];

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

  const filterDropdownData = (data, selectedValue) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return data.filter((item) => item.id !== selectedValue);
  };

  const uploadImageToCloudinary = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg", // Hoặc image/png
        name: "avatar_upload.jpg",
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

  const handleChooseAvatar = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 1,
      },
      async (response) => {
        if (response.didCancel) {
          console.log("Người dùng đã huỷ chọn ảnh.");
        } else if (response.errorMessage) {
          console.error("Lỗi khi chọn ảnh:", response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0].uri;

          // Hỏi xác nhận trước khi upload
          Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn thay đổi ảnh đại diện?",
            [
              {
                text: "Hủy",
                style: "cancel",
              },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    const uploadedUrl = await uploadImageToCloudinary(
                      selectedImage
                    );
                    setAvatar(uploadedUrl); // Cập nhật URL ảnh
                  } catch (error) {
                    Alert.alert(
                      "Lỗi",
                      "Không thể upload ảnh. Vui lòng thử lại."
                    );
                  }
                },
              },
            ]
          );
        }
      }
    );
  };

  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: "photo",
      },
      async (response) => {
        if (response.didCancel) {
          console.log("Người dùng đã huỷ chụp ảnh.");
        } else if (response.errorMessage) {
          console.error("Lỗi khi chụp ảnh:", response.errorMessage);
        } else if (response.assets) {
          const takenPhoto = response.assets[0].uri;

          // Hỏi xác nhận trước khi upload
          Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn thay đổi ảnh đại diện?",
            [
              {
                text: "Hủy",
                style: "cancel",
              },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    const uploadedUrl = await uploadImageToCloudinary(
                      takenPhoto
                    );
                    setAvatar(uploadedUrl); // Cập nhật URL ảnh
                  } catch (error) {
                    Alert.alert(
                      "Lỗi",
                      "Không thể upload ảnh. Vui lòng thử lại."
                    );
                  }
                },
              },
            ]
          );
        }
      }
    );
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        console.log("Stored userId:", storedUserId);

        if (storedUserId) {
          const response = await fetchWithAuth(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${storedUserId}`
          );

          if (!response.ok) {
            console.error("Failed to fetch user data:", response.status);
            Alert.alert("Lỗi", "Không thể lấy dữ liệu người dùng.");
            return;
          }

          const userData = await response.json();
          console.log("User data fetched from API:", userData);

          // Set state với dữ liệu người dùng
          setUsername(userData.username);
          setEmail(userData.email);
          setPhoneNumber(userData.phoneNumber);
          setAddress(userData.address);
          setHeight(userData.height?.toString());
          setWeight(userData.weight?.toString());
          setProfession(userData.profession);
          setActivityLevel(userData.activityLevel);
          setGoal(userData.goal);
          setSelectedPreferencesId(
            userData.dietaryPreferenceId?.toString() || "1"
          );
          setGender(userData.gender); // Set gender
          setAge(userData.age); // Set age
          setPassword(userData.password); // Set password
          setAvatar(userData.imageUrl || null); // Set avatar from API
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        Alert.alert("Lỗi", "Không thể lấy dữ liệu người dùng.");
      }
    };

    fetchUserData();
  }, []);

  const handleFieldEdit = (field) => {
    setEditableField(field);
  };

  // const handleChooseAvatar = () => {
  //   const options = {
  //     mediaType: "photo",
  //     quality: 1,
  //     maxWidth: 300,
  //     maxHeight: 300,
  //   };

  //   launchImageLibrary(options, (response) => {
  //     if (response.didCancel) {
  //       console.log("User cancelled image picker");
  //     } else if (response.errorMessage) {
  //       console.error("Image Picker Error: ", response.errorMessage);
  //     } else {
  //       const uri = response.assets[0].uri;
  //       setAvatar(uri);
  //     }
  //   });
  // };

  const handleSaveChanges = async () => {
    if (!username || !email || !phoneNumber || !address) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const updatedData = {
      userId: await AsyncStorage.getItem("userId"),
      username,
      email,
      phoneNumber,
      address,
      age, // Send age instead of dob
      imageUrl: avatar, // Include avatar in updated data
      height: parseFloat(height),
      weight: parseFloat(weight),
      profession,
      activityLevel,
      password, // Gửi password từ API
      goal,
      dietaryPreferenceId: parseInt(selectedPreferencesId),
      gender, // Use the direct gender value
      isPhoneVerified: true,
      status: "active", // Thêm status mặc định là active
      roleId: 3, // Thêm role mặc định là 3
    };

    // Log dữ liệu trước khi gửi tới API
    console.log("Updated data to be sent:", updatedData);

    try {
      const response = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/EditCustomer",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // Đảm bảo định dạng JSON
          },
          body: JSON.stringify(updatedData), // Chuyển đổi dữ liệu thành chuỗi JSON
        }
      );

      if (response.ok) {
        Alert.alert("Thành công", "Thông tin đã được cập nhật!");

        // Cập nhật thông tin mới vào AsyncStorage
        await AsyncStorage.setItem("userData", JSON.stringify(updatedData));
        console.log("Thông tin mới đã được lưu vào AsyncStorage");
        // Cập nhật Context
        setUser(updatedData);

        // Quay về trang trước đó
        navigation.goBack();
      } else {
        console.log("API response status:", response.status);
        const errorData = await response.json();
        Alert.alert(
          "Lỗi",
          errorData.message || "Không thể cập nhật thông tin. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật thông tin.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Xóa toàn bộ dữ liệu lưu trữ
      Alert.alert("Đăng xuất thành công", "Bạn đã được đăng xuất.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }], // Điều hướng đến màn hình Login
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ImageBackground
        source={{
          uri: "https://img.freepik.com/premium-photo/glowing-green-gradient-background-smooth-gradient-flat-design-high-resolution-high-quality-high_1110519-4518.jpg",
        }}
        style={{
          width: "100%",
          height: 200,
        }}
      >
        <View
          style={{ padding: 20, flexDirection: "row", alignItems: "center" }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-outline" size={25} color={COLORS.white} />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: FONTS.bold,
              fontSize: 20,
              color: COLORS.white,
              marginLeft: 10,
            }}
          >
            Chỉnh sửa trang cá nhân
          </Text>
        </View>
      </ImageBackground>
      {/* Phần hiển thị ảnh đại diện */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => setShowFullImage(true)}>
          <Image
            source={{ uri: avatar || "https://via.placeholder.com/100" }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          {/* Nút chọn ảnh từ thư viện */}
          <TouchableOpacity style={styles.button} onPress={handleChooseAvatar}>
            <Text style={styles.buttonText}>Chọn ảnh</Text>
          </TouchableOpacity>

          {/* Nút chụp ảnh */}
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>Chụp ảnh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hiển thị ảnh lớn khi bấm vào ảnh đại diện */}
      {showFullImage && (
        <View style={styles.fullImageOverlay}>
          <Image source={{ uri: avatar }} style={styles.fullImage} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFullImage(false)}
          >
            <Icon name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formContainer}>
        {/* Họ tên */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Họ tên</Text>
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={setUsername}
          />
        </View>
        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Địa chỉ */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Địa chỉ</Text>
          <TextInput
            style={styles.textInput}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Tuổi */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Tuổi</Text>
          <TextInput
            style={styles.textInput}
            value={age?.toString()}
            onChangeText={(value) => setAge(parseInt(value) || "")}
            keyboardType="numeric"
          />
        </View>

        {/* Chiều cao và Cân nặng */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {/* Chiều cao */}
          <View style={[styles.attributeRow, { width: "45%" }]}>
            <View>
              <Text style={styles.textTitle}>Chiều cao (cm): </Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={height}
                onChangeText={(value) => setHeight(value)}
                placeholder="Nhập chiều cao"
                placeholderTextColor={COLORS.lightGrey}
                inputMode="numeric"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Cân nặng */}
          <View style={[styles.attributeRow, { width: "50%" }]}>
            <View>
              <Text style={styles.textTitle}>Cân nặng (kg): </Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={weight}
                onChangeText={(value) => setWeight(value)}
                placeholder="Nhập cân nặng"
                placeholderTextColor={COLORS.lightGrey}
                inputMode="numeric"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Nghề nghiệp */}
        <View style={styles.attributeRow}>
          <View>
            <Text style={styles.textTitle}>Nghề nghiệp: </Text>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={profession}
              onChangeText={(value) => setProfession(value)}
              placeholder="Nhập nghề nghiệp"
              placeholderTextColor={COLORS.lightGrey}
            />
          </View>
        </View>

        {/* Mức độ hoạt động */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mức độ hoạt động</Text>
          <Dropdown
            data={filterDropdownData(
              dataActivityLevel,
              dataActivityLevel.find((item) => item.name === activityLevel)?.id
            )}
            labelField="name"
            valueField="name" // Sử dụng name làm giá trị
            value={activityLevel} // Giá trị hiện tại (chuỗi)
            onChange={(item) => setActivityLevel(item.name)} // Lưu tên vào state
            placeholder={
              dataActivityLevel.find((item) => item.name === activityLevel)
                ?.name || "Chọn mức độ"
            }
            style={styles.dropdown}
          />
        </View>

        {/* Mục tiêu */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mục tiêu</Text>
          <Dropdown
            data={filterDropdownData(
              dataGoal,
              dataGoal.find((item) => item.name === goal)?.id
            )}
            labelField="name"
            valueField="name" // Sử dụng name làm giá trị
            value={goal} // Giá trị hiện tại (chuỗi)
            onChange={(item) => setGoal(item.name)} // Lưu tên vào state
            placeholder={
              dataGoal.find((item) => item.name === goal)?.name ||
              "Chọn mục tiêu"
            }
            style={styles.dropdown}
          />
        </View>

        {/* Sở thích ăn uống */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Sở thích ăn uống</Text>
          <Dropdown
            data={filterDropdownData(
              dataPreferences,
              parseInt(selectedPreferencesId)
            )}
            labelField="name"
            valueField="id"
            value={parseInt(selectedPreferencesId)}
            onChange={(item) => setSelectedPreferencesId(item.id.toString())}
            placeholder={
              dataPreferences.find(
                (item) => item.id === parseInt(selectedPreferencesId)
              )?.name || "Chọn sở thích"
            }
            style={styles.dropdown}
          />
        </View>
        <ButtonFlex
          title="Lưu thay đổi"
          stylesButton={{
            marginTop: 10,
            backgroundColor: COLORS.green,
            height: 40,
          }}
          onPress={handleSaveChanges}
        />
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
    marginTop: -30,
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  changeAvatarText: {
    marginTop: 10,
    fontFamily: FONTS.medium,
    color: COLORS.green,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 20,
  },
  button: {
    backgroundColor: COLORS.green,
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  fullImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 10,
  },

  formContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    padding: 10,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
  },
});
