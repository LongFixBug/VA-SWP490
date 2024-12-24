import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NotificationSettingScreen = ({ navigation, route }) => {
  const [isPostNotificationEnabled, setIsPostNotificationEnabled] =
    useState(true);
  const [
    isOrderStatusNotificationEnabled,
    setIsOrderStatusNotificationEnabled,
  ] = useState(true);
  const [isPromotionNotificationEnabled, setIsPromotionNotificationEnabled] =
    useState(true);
  const [isFollowerNotificationEnabled, setIsFollowerNotificationEnabled] =
    useState(true);
  const [userId, setUserId] = useState(null);
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
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setUserId(parsedUserData.userId); // Store the user ID
        } else {
          console.error(
            "Không tìm thấy dữ liệu người dùng trong AsyncStorage."
          );
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };
    fetchUserId();
  }, []);

  const updateNotificationSetting = async (settingName, isEnabled) => {
    if (!userId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
      return;
    }
    try {
      const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/notifications/updateNotificationSettings?userId=${userId}&settingName=${settingName}&isEnabled=${isEnabled}`;

      const response = await fetchWithAuth(url, {
        method: "PUT",
      });

      if (response.ok) {
        console.log(
          `Notification setting ${settingName} updated successfully to ${isEnabled}`
        );
        // Optionally show a success message, if needed
      } else {
        const errorData = await response.json();
        console.error(`Failed to update setting ${settingName}`, errorData);
        Alert.alert(
          "Lỗi",
          `Không thể cập nhật cài đặt thông báo ${settingName}, vui lòng thử lại`
        );
        // Optionally show an error message, if needed
      }
    } catch (error) {
      console.error(`Failed to update setting ${settingName}:`, error);
      Alert.alert(
        "Lỗi",
        `Có lỗi xảy ra khi cập nhật cài đặt thông báo ${settingName}, vui lòng thử lại`
      );
      // Optionally show a generic error message, if needed
    }
  };

  const handlePostNotificationToggle = async () => {
    const newStatus = !isPostNotificationEnabled;
    setIsPostNotificationEnabled(newStatus);
    await updateNotificationSetting("new_article", newStatus);
  };

  const handleOrderStatusNotificationToggle = async () => {
    const newStatus = !isOrderStatusNotificationEnabled;
    setIsOrderStatusNotificationEnabled(newStatus);
    await updateNotificationSetting("order_status", newStatus);
  };

  const handlePromotionNotificationToggle = async () => {
    const newStatus = !isPromotionNotificationEnabled;
    setIsPromotionNotificationEnabled(newStatus);
    await updateNotificationSetting("new_promotion", newStatus);
  };

  const handleFollowerNotificationToggle = async () => {
    const newStatus = !isFollowerNotificationEnabled;
    setIsFollowerNotificationEnabled(newStatus);
    await updateNotificationSetting("new_follower", newStatus);
  };

  return (
    <>
      <Header
        title={"Cài đặt thông báo"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"notifications-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.settingContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Icon
                name="file-tray-full-outline"
                size={24}
                color={COLORS.greySolid}
              />
              <Text style={styles.settingText}>Thông báo về bài viết mới</Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.grey, true: COLORS.green }}
              thumbColor={isPostNotificationEnabled ? COLORS.white : "#f4f3f4"}
              onValueChange={handlePostNotificationToggle}
              value={isPostNotificationEnabled}
              style={styles.iconRight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
            onPress={() => navigation.navigate("NotificationSetting")}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Icon name="receipt-outline" size={24} color={COLORS.greySolid} />
              <Text style={styles.settingText}>
                Thông báo về trạng thái đơn hàng
              </Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.grey, true: COLORS.green }}
              thumbColor={
                isOrderStatusNotificationEnabled ? COLORS.white : "#f4f3f4"
              }
              onValueChange={handleOrderStatusNotificationToggle}
              value={isOrderStatusNotificationEnabled}
              style={styles.iconRight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Icon name="gift-outline" size={24} color={COLORS.greySolid} />
              <Text style={styles.settingText}>
                Thông báo về các chương trình khuyến mãi
              </Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.grey, true: COLORS.green }}
              thumbColor={
                isPromotionNotificationEnabled ? COLORS.white : "#f4f3f4"
              }
              onValueChange={handlePromotionNotificationToggle}
              value={isPromotionNotificationEnabled}
              style={styles.iconRight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Icon
                name="person-add-outline"
                size={24}
                color={COLORS.greySolid}
              />
              <Text style={styles.settingText}>
                Thông báo về người theo dõi
              </Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.grey, true: COLORS.green }}
              thumbColor={
                isFollowerNotificationEnabled ? COLORS.white : "#f4f3f4"
              }
              onValueChange={handleFollowerNotificationToggle}
              value={isFollowerNotificationEnabled}
              style={styles.iconRight}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default NotificationSettingScreen;

const styles = StyleSheet.create({
  settingContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingRight: 15,
  },
  settingAttributeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  settingText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    marginLeft: 15,
    flexShrink: 1,
  },
  iconRight: {
    marginLeft: 20,
  },
});
