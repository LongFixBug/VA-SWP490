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
import { NotificationContext } from "../context/NotificationContext"; // Import NotificationContext
import Header from "../components/Header";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";

const NotificationScreen = ({ navigation }) => {
  const { notifications, markAllAsRead, markAsRead } =
    useContext(NotificationContext); // Sử dụng context
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

  // Hàm mở thông báo
  const handleOpenPress = (item) => {
    setSelectedNotification(item);
    setSelectedNotificationDate(item.date);
    bottomSheetRef.current?.expand();
    if (item.status === "unread") {
      markAsRead(item.id);
    }
  };

  // Hàm đóng modal
  const handleClosePress = () => {
    setSelectedNotification(null);
    setSelectedNotificationDate(null);
    bottomSheetRef.current?.close();
  };

  // Hàm render backdrop cho BottomSheet
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

  // Hàm refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Trong context, notifications đã được tự động cập nhật khi có thông báo mới
    // Nếu bạn cần refresh từ AsyncStorage, hãy gọi loadNotifications từ context
    // Tuy nhiên, vì chúng ta đã tải notifications khi component mount và khi có thông báo mới,
    // nên không cần thực hiện thêm hành động nào ở đây trừ khi bạn muốn thực hiện logic bổ sung
    setIsRefreshing(false);
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
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.listItem,
              item.status === "unread" ? styles.unreadNotification : {},
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
                      item.status === "unread"
                        ? COLORS.black
                        : COLORS.greySolid,
                  },
                ]}
              >
                {notificationTypeMapping[item.notificationTypeName] ||
                  item.notificationTypeName}
              </Text>
              <View style={styles.contentStatusContainer}>
                <Text style={styles.contentText}>{item.body}</Text>
                <Text style={styles.statusText}>
                  {item.status === "unread" ? "Chưa xem" : "Đã xem"}
                </Text>
              </View>
              <Text style={styles.sentDateText}>
                {formatSentDate(item.date)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
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
              onPress={markAllAsRead}
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
                {selectedNotification.body}
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
  unreadNotification: {
    backgroundColor: COLORS.lightGreenBackground, // Bạn có thể định nghĩa màu nền cho thông báo chưa đọc
  },
  iconContainer: {
    flexDirection: "column",
    alignItems: "center",
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
    backgroundColor: "transparent", // Để BottomTabBar xử lý nền
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
    marginBottom: 5,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
});
