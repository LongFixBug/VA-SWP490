// screens/NotificationScreen.js

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
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
import {
  NotificationProvider,
  NotificationContext,
} from "../context/NotificationContext"; // Import NotificationProvider và Context

const NotificationScreen = ({ navigation }) => {
  const { fetchNotifications } = useContext(NotificationContext); // Sử dụng context
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedNotificationDate, setSelectedNotificationDate] =
    useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // New state for refreshing
  const bottomSheetRef = useRef();
  const snapPoints = useMemo(() => ["65%"], []);

  const notificationTypeMapping = {
    new_article: "Bài viết của bạn đã được xử lí",
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

  const fetchNotificationsLocal = async () => {
    setIsRefreshing(true);
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (!storedUserData) {
        console.log("Không tìm thấy userData.");
        setNotifications([]);
        return;
      }
      const parsedData = JSON.parse(storedUserData);
      const userId = parsedData.userId;

      if (!userId) {
        console.log("UserId is null, skip fetching notification");
        setNotifications([]);
        return;
      }

      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/notifications/getNotificationByUserId/${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched notification data:", data);

        if (data.length === 0) {
          // Không có thông báo
          console.log("Không có thông báo nào.");
          setNotifications([]);
          return;
        }

        const sortedNotifications = [...data].sort(
          (a, b) => b.notificationId - a.notificationId
        );
        setNotifications(sortedNotifications);
      } else if (response.status === 404) {
        // Nếu không có thông báo
        console.log("Không có thông báo nào.");
        setNotifications([]); // Đặt danh sách thông báo thành rỗng
      } else {
        console.error(
          "Lỗi khi lấy thông báo:",
          response.status,
          await response.text()
        );
        Alert.alert("Lỗi", "Không thể tải thông báo. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      // Không hiển thị lỗi cho người dùng, chỉ log trong console
      console.log(
        "Không thể tải thông báo. Vui lòng kiểm tra kết nối hoặc thử lại sau."
      );
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
      Alert.alert("Lỗi", "Không thể tải chi tiết thông báo.");
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
        fetchNotifications(); // Sử dụng hàm từ context để cập nhật unreadCount
        fetchNotificationsLocal(); // Cập nhật danh sách thông báo local
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái thông báo:", error);
    }
  };

  const updateAllNotificationsStatus = async () => {
    try {
      if (notifications.length === 0) {
        Alert.alert("Thông báo", "Không có thông báo nào để đánh dấu.");
        return;
      }

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
        fetchNotifications(); // Sử dụng hàm từ context để cập nhật unreadCount
        fetchNotificationsLocal(); // Cập nhật danh sách thông báo local
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
    fetchNotificationsLocal();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotificationsLocal();
    }, [])
  );
  const onRefresh = useCallback(() => {
    fetchNotificationsLocal();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title={"Thông báo"}
        leftIcon={"arrow-back"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      {/* Removed ScrollView to prevent nested scrolling */}
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
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bạn không có thông báo nào</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.markAllReadContainer}>
            <TouchableOpacity
              style={styles.markAllReadButton}
              onPress={updateAllNotificationsStatus}
            >
              <Text style={styles.markAllReadText}>Đánh dấu tất cả đã đọc</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 80, // Thêm padding tránh bị che bởi bottom bar
        }}
      />
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
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 50,
    marginRight: 10,
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
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.grey,
  },
  // Styles cho CustomTabBar
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Shadow cho Android
    elevation: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "transparent", // Để LinearGradient xử lý nền
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  iconContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 50,
    marginRight: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
});
