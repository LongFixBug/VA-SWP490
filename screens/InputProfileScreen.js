import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { Menu, Provider } from "react-native-paper";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import RadioGroup from "react-native-radio-buttons-group";
import { ButtonFlex } from "../components/Button";
import moment from "moment";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlatList } from "react-native";

const InputProfileScreen = ({ navigation, route }) => {
  // Nhận phoneNumber và password từ route params
  const { phone: initialPhoneNumber } = route.params || {};

  const [errorDoB, setErrorDoB] = useState("");
  const [error, setError] = useState("");
  const [selectedPreferencesId, setSelectedPreferencesId] = useState("1");
  const [selectedSexId, setSelectedSexId] = useState("1");

  const [dob, setDob] = useState(new Date());
  const age = moment().diff(dob, "years");
  const [dobInput, setDobInput] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [height, setHeight] = useState(""); // New state for height
  const [weight, setWeight] = useState(""); // New state for weight
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [profession, setProfession] = useState("Đang đi học");
  const [activityLevel, setActivityLevel] = useState("Cao");
  const [goal, setGoal] = useState("Tăng cân");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visibleActivityMenu, setVisibleActivityMenu] = useState(false);
  const [visibleGoalMenu, setVisibleGoalMenu] = useState(false);
  const [province, setProvince] = useState("Hồ Chí Minh");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");

  const openActivityMenu = () => setVisibleActivityMenu(true);
  const closeActivityMenu = () => setVisibleActivityMenu(false);
  const openGoalMenu = () => setVisibleGoalMenu(true);
  const closeGoalMenu = () => setVisibleGoalMenu(false);

  const [visibleDistrictModal, setVisibleDistrictModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("Quận 1");
  const [visibleProvinceMenu, setVisibleProvinceMenu] = useState(false);

  const openDistrictModal = () => setVisibleDistrictModal(true);
  const closeDistrictModal = () => setVisibleDistrictModal(false);
  const openProvinceMenu = () => setVisibleProvinceMenu(true);
  const closeProvinceMenu = () => setVisibleProvinceMenu(false);

  const districts = [
    "Quận 1",
    "Quận 3",
    "Quận 4",
    "Quận 5",
    "Quận 6",
    "Quận 7",
    "Quận 8",
    "Quận 10",
    "Quận 11",
    "Quận 12",
    "Quận Bình Tân",
    "Quận Bình Thạnh",
    "Quận Gò Vấp",
    "Quận Phú Nhuận",
    "Quận Tân Bình",
    "Quận Tân Phú",
    "Huyện Bình Chánh",
    "Huyện Cần Giờ",
    "Huyện Củ Chi",
    "Huyện Hóc Môn",
    "Huyện Nhà Bè",
    "Thành phố Thủ Đức",
  ];

  const handleRegister = async () => {
    // Kiểm tra chiều cao và cân nặng
    if (!validateHeightAndWeight()) {
      return; // Dừng nếu kiểm tra không hợp lệ
    }
    // Kiểm tra địa chỉ
    if (!province || !selectedDistrict || !address.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ địa chỉ!");
      return;
    }

    // Sắp xếp địa chỉ theo thứ tự Địa chỉ, Quận/Huyện, Tỉnh/Thành phố
    const fullAddress = `${address}, ${selectedDistrict}, ${province}`;

    // Kiểm tra các trường bắt buộc
    if (
      !username ||
      !email ||
      !phoneNumber ||
      !dobInput ||
      !password ||
      !confirmPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Kiểm tra định dạng ngày sinh
    if (!validateDOB(dobInput)) {
      Alert.alert("Lỗi", "Ngày sinh không hợp lệ (định dạng: dd/mm/yyyy).");
      return;
    }

    // Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    // Định dạng lại số điện thoại
    const formattedPhoneNumber = phoneNumber.startsWith("0")
      ? phoneNumber
      : "0" + phoneNumber;

    // Chuyển đổi ngày sinh sang dạng Date
    const formattedDob = moment(dobInput, "DD/MM/YYYY").toDate();
    const age = moment().diff(moment(dobInput, "DD/MM/YYYY"), "years");

    const gender =
      selectedSexId === "1" ? "Man" : selectedSexId === "2" ? "Woman" : "Other";

    const defaultImageUrl =
      "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

    // Dữ liệu gửi lên API
    const requestData = {
      username,
      password,
      email,
      phoneNumber: formattedPhoneNumber,
      dob: formattedDob,
      address: fullAddress, // Địa chỉ đã được sắp xếp lại
      height: parseFloat(height),
      weight: parseFloat(weight),
      age,
      gender,
      profession, // Dùng ID để gửi lên API
      dietaryPreferenceId: parseInt(selectedPreferencesId),
      activityLevel,
      goal,
      isPhoneVerified: true,
      imageUrl: defaultImageUrl,
    };

    console.log("Dữ liệu gửi lên API đăng ký:", requestData);

    try {
      // Gọi API đăng ký
      const registerResponse = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/RegisterCustomer",
        requestData
      );

      console.log("Phản hồi API đăng ký:", registerResponse.data);

      if (registerResponse.status === 200) {
        console.log("Đăng ký thành công. Bắt đầu tự động đăng nhập...");

        // Tự động đăng nhập sau khi đăng ký thành công
        try {
          console.log("Dữ liệu gửi lên API login:", {
            phoneNumber: formattedPhoneNumber,
            password,
          });

          const loginResponse = await axios.post(
            "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/login",
            {
              phoneNumber: formattedPhoneNumber,
              password,
            }
          );

          console.log("Phản hồi API login:", loginResponse.data);

          if (loginResponse.status === 200) {
            const { token, user } = loginResponse.data;

            console.log("Đăng nhập thành công. Thông tin user:", user);

            // Lưu JWT và thông tin user vào AsyncStorage
            await AsyncStorage.multiSet([
              ["authToken", token],
              ["userId", String(user.userId)],
              ["username", user.username],
              ["imageUrl", user.imageUrl],
              ["dietaryPreferenceId", String(user.dietaryPreferenceId)],
              ["userData", JSON.stringify(user)], // Save user data
            ]);

            // Create notification settings after successful registration and login
            try {
              const notificationSettingsData = {
                userId: user.userId,
                newArticleNotification: true,
                orderStatusNotification: true,
                promotionNotification: true,
                followNotification: true,
              };

              console.log(
                "Dữ liệu gửi lên API tạo notification settings:",
                notificationSettingsData
              );

              const notificationSettingResponse = await axios.post(
                "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/notifications/createNotificationSetting",
                notificationSettingsData,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              console.log(
                "Phản hồi API tạo notification settings:",
                notificationSettingResponse.data
              );
              if (notificationSettingResponse.status === 200) {
                console.log("Tạo notification setting thành công");
              } else {
                console.error(
                  "Không thể tạo notification settings:",
                  notificationSettingResponse.data
                );
              }
            } catch (notificationSettingError) {
              console.error(
                "Lỗi khi gọi API tạo notification settings:",
                notificationSettingError.response?.data ||
                  notificationSettingError.message
              );
            }
            // Tự động tạo membership sau khi đăng nhập thành công
            try {
              const membershipData = {
                userId: user.userId,
                tierId: 1, // Bronze level
                accumulatedPoints: 0,
                discountGrantedDate: new Date().toISOString(),
                lastDiscountUsed: new Date().toISOString(),
              };

              console.log(
                "Dữ liệu gửi lên API tạo membership:",
                membershipData
              );

              const membershipResponse = await axios.post(
                "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membership",
                membershipData,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              console.log(
                "Phản hồi API tạo membership:",
                membershipResponse.data
              );

              if (membershipResponse.status === 200) {
                console.log("Tạo membership thành công.");
              } else {
                console.error(
                  "Không thể tạo membership:",
                  membershipResponse.data
                );
              }
            } catch (membershipError) {
              console.error(
                "Lỗi khi gọi API tạo membership:",
                membershipError.response?.data || membershipError.message
              );
            }
            // Điều hướng tới trang Home
            Alert.alert("Thành công", "Đăng ký và đăng nhập thành công!", [
              { text: "OK", onPress: () => navigation.navigate("Home") },
            ]);
          } else {
            console.error("Đăng nhập thất bại sau khi đăng ký.");
            Alert.alert(
              "Lỗi",
              "Đăng nhập tự động thất bại. Vui lòng thử đăng nhập lại."
            );
          }
        } catch (loginError) {
          console.error(
            "Lỗi khi gọi API login:",
            loginError.response?.data || loginError.message
          );
          Alert.alert(
            "Lỗi",
            "Đăng nhập tự động thất bại. Vui lòng thử đăng nhập lại."
          );
        }
      } else {
        console.error(
          "Phản hồi không thành công từ API đăng ký:",
          registerResponse.data
        );
        Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (registerError) {
      console.error(
        "Lỗi khi gọi API đăng ký:",
        registerError.response?.data || registerError.message
      );
      Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  const validateDOB = (input) => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(input);
  };

  const handleDobChange = (input) => {
    setDobInput(input);

    // Kiểm tra nếu trường nhập rỗng
    if (!input.trim()) {
      setErrorDoB(""); // Không hiển thị lỗi nếu trường rỗng
      return;
    }

    // Validate format
    if (!validateDOB(input)) {
      setErrorDoB("Ngày hoặc tháng không tồn tại (định dạng: dd/mm/yyyy).");
      return;
    }

    const [day, month, year] = input
      .split("/")
      .map((part) => parseInt(part, 10));

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // `getMonth` is 0-based
    const currentDay = today.getDate();
    const minYear = currentYear - 100; // Minimum year (100 years ago)
    const maxAllowedYear = currentYear - 10; // Maximum year (at least 10 years old)

    // Validate year range (too far in the past)
    if (year < minYear) {
      setErrorDoB(`Năm sinh không được cách năm hiện tại quá 100 năm.`);
      return;
    }

    // Validate year is not in the future
    if (year > currentYear) {
      setErrorDoB("Ngày sinh không thể ở tương lai.");
      return;
    }

    // Validate month is not in the future (if the year is the current year)
    if (year === currentYear && month > currentMonth) {
      setErrorDoB("Ngày sinh không thể ở tương lai.");
      return;
    }

    // Validate day is not in the future (if the year and month are current)
    if (year === currentYear && month === currentMonth && day > currentDay) {
      setErrorDoB("Ngày sinh không thể ở tương lai.");
      return;
    }

    // Validate age restriction (must be at least 10 years old)
    if (year > maxAllowedYear) {
      setErrorDoB("Bạn phải từ 10 tuổi trở lên để sử dụng ứng dụng này.");
      return;
    }

    // Validate if the day/month/year combination is valid
    const dob = new Date(year, month - 1, day);
    if (
      dob.getFullYear() !== year ||
      dob.getMonth() + 1 !== month ||
      dob.getDate() !== day
    ) {
      setErrorDoB("Ngày sinh không hợp lệ.");
      return;
    }

    // Clear errors if valid
    setErrorDoB("");
  };

  const handleHeightChange = (input) => {
    setHeight(input);

    if (!input.trim()) {
      setHeightError(""); // Không hiển thị lỗi nếu trường rỗng
      return;
    }
    const value = parseFloat(input);
    if (isNaN(value) || value < 50 || value > 250) {
      setHeightError("Chiều cao phải từ 50-250 cm.");
    } else {
      setHeightError("");
    }
  };

  const handleWeightChange = (input) => {
    setWeight(input);

    if (!input.trim()) {
      setWeightError(""); // Không hiển thị lỗi nếu trường rỗng
      return;
    }
    const value = parseFloat(input);
    if (isNaN(value) || value < 10 || value > 200) {
      setWeightError("Cân nặng phải từ 10-200 kg.");
    } else {
      setWeightError("");
    }
  };

  const validateHeightAndWeight = () => {
    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);

    if (isNaN(heightValue) || heightValue < 50 || heightValue > 250) {
      Alert.alert("Lỗi", "Chiều cao phải nằm trong khoảng từ 50-250 cm.");
      return false;
    }

    if (isNaN(weightValue) || weightValue < 10 || weightValue > 200) {
      Alert.alert("Lỗi", "Cân nặng phải nằm trong khoảng từ 10-200 kg.");
      return false;
    }

    return true;
  };

  const radioButtonsPreferences = [
    {
      id: "1",
      label: "Thuần chay",
      value: "option1",
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: "42%" },
    },
    {
      id: "2",
      label: "Chay không trứng, có thể có sữa, phô mai",
      value: "option2",
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: "42%" },
    },
    {
      id: "3",
      label: "Chay không sữa, có thể có trứng",
      value: "option3",
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: "42%" },
    },
    {
      id: "4",
      label: "Hỗn hợp, có thể sử dụng cả trứng, sữa",
      value: "option4",
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: "42%" },
    },
    {
      id: "5",
      label: "Chay bán phần (không thịt, có thể ăn cá)",
      value: "option5",
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: "42%" },
    },
  ];

  const radioButtonsSex = [
    {
      id: "1",
      label: "Nam",
      value: "Man",
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: "42%" },
    },
    {
      id: "2",
      label: "Nữ",
      value: "Woman",
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: "42%" },
    },
    {
      id: "3",
      label: "Khác",
      value: "other",
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: "42%" },
    },
  ];

  const renderDistrictItem = ({ item }) => (
    <TouchableOpacity
      style={styles.districtItem}
      onPress={() => {
        setSelectedDistrict(item);
        closeDistrictModal();
      }}
    >
      <Text style={styles.districtText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <Text
            style={{
              fontSize: 25,
              color: COLORS.green,
              fontFamily: FONTS.bold,
              marginTop: 15,
            }}
          >
            NHẬP THÔNG TIN
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Họ tên <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập họ tên"
              placeholderTextColor={COLORS.lightGrey}
              onChangeText={setUsername}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Số điện thoại <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <Icon name="call" size={20} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              editable={false}
            />
          </View>
        </View>
        <View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Mật khẩu <Text style={{ color: COLORS.red }}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={COLORS.lightGrey}
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.green}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Xác nhận mật khẩu <Text style={{ color: COLORS.red }}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={COLORS.lightGrey}
                secureTextEntry={!showConfirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.green}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Email <Text style={{ color: COLORS.red }}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <Icon name="mail" size={20} color={COLORS.green} />
              <TextInput
                style={styles.textInput}
                placeholder="Nhập email"
                placeholderTextColor={COLORS.lightGrey}
                onChangeText={setEmail}
              />
            </View>
          </View>
          <View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {/* Input chiều cao */}
              <View style={[styles.attributeRow, { width: "45%" }]}>
                <Text style={styles.textTitle}>Chiều cao (cm):</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập chiều cao"
                    value={height}
                    placeholderTextColor={COLORS.lightGrey}
                    onChangeText={handleHeightChange}
                    keyboardType="numeric"
                  />
                </View>
                {heightError ? (
                  <Text style={styles.errorText}>{heightError}</Text>
                ) : null}
              </View>

              {/* Input cân nặng */}
              <View style={[styles.attributeRow, { width: "50%" }]}>
                <Text style={styles.textTitle}>Cân nặng (kg):</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập cân nặng"
                    value={weight}
                    placeholderTextColor={COLORS.lightGrey}
                    onChangeText={handleWeightChange}
                    keyboardType="numeric"
                  />
                </View>
                {weightError ? (
                  <Text style={styles.errorText}>{weightError}</Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Mức độ hoạt động <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <Menu
            visible={visibleActivityMenu}
            onDismiss={closeActivityMenu}
            anchor={
              <TouchableOpacity
                style={styles.menuAnchor}
                onPress={openActivityMenu}
              >
                <Text style={styles.textInput}>{activityLevel}</Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setActivityLevel("Cao");
                closeActivityMenu();
              }}
              title="Cao"
            />
            <Menu.Item
              onPress={() => {
                setActivityLevel("Trung bình");
                closeActivityMenu();
              }}
              title="Trung bình"
            />
            <Menu.Item
              onPress={() => {
                setActivityLevel("Ít");
                closeActivityMenu();
              }}
              title="Ít"
            />
          </Menu>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Mục tiêu <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <Menu
            visible={visibleGoalMenu}
            onDismiss={closeGoalMenu}
            anchor={
              <TouchableOpacity
                style={styles.menuAnchor}
                onPress={openGoalMenu}
              >
                <Text style={styles.textInput}>{goal}</Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setGoal("Tăng cân");
                closeGoalMenu();
              }}
              title="Tăng cân"
            />
            <Menu.Item
              onPress={() => {
                setGoal("Giảm cân");
                closeGoalMenu();
              }}
              title="Giảm cân"
            />
            <Menu.Item
              onPress={() => {
                setGoal("Giữ nguyên");
                closeGoalMenu();
              }}
              title="Giữ nguyên"
            />
          </Menu>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Ngày sinh (dd/mm/yyyy) <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập ngày sinh (dd/mm/yyyy)"
              placeholderTextColor={COLORS.lightGrey}
              value={dobInput}
              onChangeText={handleDobChange}
            />
          </View>
          {errorDoB ? (
            <Text style={styles.errorDoBText}>{errorDoB}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Giới tính <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View
            style={[styles.inputRow, { marginTop: 15, borderBottomWidth: 0 }]}
          >
            <RadioGroup
              radioButtons={radioButtonsSex}
              onPress={setSelectedSexId}
              selectedId={selectedSexId}
              layout="column"
              labelStyle={{ fontFamily: FONTS.medium }}
              containerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Sở thích ăn uống <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View
            style={[styles.inputRow, { marginTop: 15, borderBottomWidth: 0 }]}
          >
            <RadioGroup
              radioButtons={radioButtonsPreferences}
              onPress={(selectedValue) => {
                setSelectedPreferencesId(selectedValue);
              }}
              selectedId={selectedPreferencesId}
              layout="column"
              labelStyle={{ fontFamily: FONTS.medium }}
              containerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Tỉnh/Thành phố <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <Text style={styles.textInput}>Hồ Chí Minh</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Quận/Huyện <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={openDistrictModal}
          >
            <Text>{selectedDistrict}</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={visibleDistrictModal}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDistrictModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn Quận/Huyện</Text>
              <FlatList
                data={districts}
                renderItem={renderDistrictItem}
                keyExtractor={(item) => item}
              />
              <TouchableOpacity
                onPress={closeDistrictModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Địa chỉ cụ thể */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Địa chỉ cụ thể <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <Icon name="location-sharp" size={20} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              placeholder="VD: 50 Lê Văn Việt, Hiệp Phú"
              placeholderTextColor={COLORS.lightGrey}
              onChangeText={setAddress}
            />
          </View>
        </View>

        <ButtonFlex
          title={"Bắt đầu!"}
          stylesButton={{
            paddingVertical: 15,
            elevation: 3,
            backgroundColor: COLORS.green,
            borderRadius: 10,
          }}
          stylesText={{ fontSize: 14 }}
          onPress={handleRegister} // Call the handleRegister function when pressed
        />

        {error ? <Text style={styles.errorDoBText}>{error}</Text> : null}
      </ScrollView>
    </Provider>
  );
};

export default InputProfileScreen;

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 30,
    flexGrow: 1,
  },
  inputContainer: {
    marginBottom: 25,
    width: "100%",
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
  },
  menuAnchor: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  textInput: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    width: "100%",
  },
  errorDoBText: {
    color: COLORS.red,
    marginTop: 10,
    fontFamily: FONTS.semiBold,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "50%",
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    height: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  districtItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  districtText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  attributeRow: {
    marginBottom: 15,
  },
  textTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    marginBottom: 5,
    color: COLORS.black,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  textInput: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    width: "100%",
    paddingVertical: 5,
  },
  errorText: {
    color: COLORS.red,
    fontFamily: FONTS.medium,
    marginTop: 5,
  },
});
