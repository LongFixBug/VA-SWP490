import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  ScrollView, // Import ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedNotificationDate, setSelectedNotificationDate] =
    useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // New state for refreshing
  const bottomSheetRef = useRef();
  const snapPoints = useMemo(() => ["65%"], []);

  const notificationTypeMapping = {
    new_article: "Bạn có bài viết mới",
    order_status: "Trạng thái đơn hàng của bạn",
    new_promotion: "Bạn có khuyến mãi mới",
    new_follower: "Bạn có người follow mới",
  };

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

  const fetchNotifications = async () => {
    setIsRefreshing(true);
    try {
      if (!userId) {
        console.log("UserId is null, skip fetching notification");
        return;
      }
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/notifications/getNotificationByUserId/${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched notification data:", data);
        const sortedNotifications = [...data].sort(
          (a, b) => b.notificationId - a.notificationId
        );
        setNotifications(sortedNotifications);
      } else {
        console.error(
          "Lỗi khi lấy thông báo:",
          response.status,
          await response.text()
        );
        Alert.alert("Lỗi", "Không thể tải thông báo. Vui lòng thử lại.");
      }
    } catch (log) {
      console.error("Lỗi khi lấy thông báo:", log);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchNotificationDetails = async (notificationId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/notifications/getNotificationByNotificationId/${notificationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedNotification(data);
        bottomSheetRef.current?.expand();
      } else {
        console.error(
          "Lỗi khi lấy chi tiết thông báo:",
          response.status,
          await response.text()
        );
        Alert.alert("Lỗi", "Không thể tải chi tiết thông báo.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết thông báo:", error);
    }
  };

  const handleOpenPress = async (item) => {
    setSelectedNotificationDate(item.sentDate);
    await fetchNotificationDetails(item.notificationId);
    if (item.status === "Unread") {
      await updateNotificationStatus(item.notificationId);
    }
  };

  const handleClosePress = () => {
    setSelectedNotification(null);
    setSelectedNotificationDate(null);
    bottomSheetRef.current?.close();
  };
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={handleClosePress}
      />
    ),
    []
  );

  const updateNotificationStatus = async (notificationId) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/notifications/updateStatusNotificationByNotificationId/${notificationId}`,
        {
          method: "PUT",
          body: JSON.stringify({ newStatus: "Read" }),
        }
      );
      if (!response.ok) {
        console.error(
          "Lỗi khi thay đổi trạng thái thông báo:",
          response.status,
          await response.text()
        );
      } else {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái thông báo:", error);
    }
  };
  const updateAllNotificationsStatus = async () => {
    try {
      // Map each notification id to a promise which updates the notification status
      const updatePromises = notifications.map((notification) =>
        fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/notifications/updateStatusNotificationByNotificationId/${notification.notificationId}`,
          {
            method: "PUT",
            body: JSON.stringify({ newStatus: "Read" }),
          }
        )
      );

      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter((result) => !result.ok);
      if (failedUpdates.length > 0) {
        console.error(
          "Lỗi khi thay đổi trạng thái tất cả thông báo:",
          failedUpdates.map((result) => `${result.status} ${result.text}`)
        );
        Alert.alert(
          "Lỗi",
          "Không thể đánh dấu tất cả thông báo là đã đọc, vui lòng thử lại"
        );
      } else {
        Alert.alert("Thành công", "Đã đánh dấu tất cả thông báo là đã đọc");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái tất cả thông báo:", error);
      Alert.alert(
        "Lỗi",
        "Có lỗi xảy ra khi đánh dấu tất cả thông báo là đã đọc"
      );
    }
  };
  // Function to format the sent date
  const formatSentDate = (dateString) => {
    try {
      if (!dateString) return "Invalid Date";
      const date = new Date(dateString);
      return format(date, "HH:mm dd/MM/yyyy");
    } catch (e) {
      return "Invalid Date";
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserId(parsedData.userId);
          console.log("user id:", parsedData.userId);
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

    getUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchNotifications();
      }
    }, [userId])
  );
  const onRefresh = useCallback(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      <Header
        title={"Thông báo"}
        leftIcon={"arrow-back"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.markAllReadContainer}>
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={updateAllNotificationsStatus}
          >
            <Text style={styles.markAllReadText}>Đánh dấu tất cả đã đọc</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={notifications}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.listItem,
                item.status === "Unread"
                  ? {
                      ...styles.unreadNotification,
                      backgroundColor: COLORS.lightGreen,
                    }
                  : {},
              ]}
              onPress={() => handleOpenPress(item)}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name="notifications-outline"
                  size={28}
                  color={COLORS.grey}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.titleText,
                    {
                      color:
                        item.status === "Unread"
                          ? COLORS.black
                          : COLORS.greySolid,
                    },
                  ]}
                >
                  {notificationTypeMapping[item.notificationTypeName] ||
                    item.notificationTypeName}
                </Text>
                <View style={styles.contentStatusContainer}>
                  <Text style={styles.contentText}>{item.content}</Text>
                  <Text style={styles.statusText}>
                    {item.status === "Unread" ? "Chưa xem" : "Đã xem"}
                  </Text>
                </View>
                <Text style={styles.sentDateText}>
                  {formatSentDate(item.sentDate)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.notificationId.toString()}
        />
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView style={styles.bottomSheetContainer}>
          {selectedNotification && (
            <View>
              <Text style={styles.bottomSheetTitle}>
                {notificationTypeMapping[
                  selectedNotification.notificationTypeName
                ] || selectedNotification.notificationTypeName}
              </Text>
              <Text style={styles.bottomSheetContent}>
                {selectedNotification.content}
              </Text>
              <Text style={styles.bottomSheetDate}>
                {formatSentDate(selectedNotificationDate)}
              </Text>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },
  markAllReadContainer: {
    paddingHorizontal: 10,
    marginTop: 5,
    alignItems: "flex-end",
  },
  markAllReadButton: {
    backgroundColor: COLORS.lightGreen,
    padding: 10,
    borderRadius: 10,
  },
  markAllReadText: {
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  unreadNotification: {},
  iconContainer: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  contentStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentText: {
    fontFamily: FONTS.medium,
    width: "75%",
    marginTop: 5,
    color: COLORS.grey,
  },
  sentDateText: {
    fontFamily: FONTS.medium,
    marginTop: 5,
    color: COLORS.grey,
    fontSize: 12,
    textAlign: "right",
  },
  statusText: {
    fontFamily: FONTS.medium,
    marginTop: 5,
    color: COLORS.grey,
  },
  bottomSheetContainer: {
    width: "100%",
    height: "auto",
    backgroundColor: COLORS.white,
    padding: 20,
  },
  bottomSheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 10,
  },
  bottomSheetContent: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.greySolid,
    marginBottom: 10,
  },
  bottomSheetDate: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.grey,
  },
});
