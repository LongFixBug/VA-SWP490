import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import Toast from "react-native-toast-message";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // 1. Tải danh sách thông báo cũ từ AsyncStorage khi khởi động
  useEffect(() => {
    loadNotifications();
  }, []);

  // 2. Chỉ khởi tạo listener của Firebase Messaging 1 lần
  useEffect(() => {
    const initMessaging = async () => {
      // Yêu cầu quyền thông báo
      await requestPermission();

      // Lắng nghe tin nhắn khi app đang ở foreground
      const unsubscribeForeground = messaging().onMessage(
        async (remoteMessage) => {
          console.log("Tin nhắn foreground:", remoteMessage);
          addNotification(remoteMessage);
        }
      );

      // Xử lý tin nhắn ở background
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log("Tin nhắn background:", remoteMessage);
      });

      return unsubscribeForeground;
    };

    let unsubscribeInit;
    initMessaging().then((unsub) => {
      unsubscribeInit = unsub;
    });

    // Cleanup listener khi unmount
    return () => {
      if (typeof unsubscribeInit === "function") {
        unsubscribeInit();
      }
    };
  }, []);

  // Hàm tải danh sách thông báo từ AsyncStorage
  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem("notifications");
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);

        // Đếm thông báo chưa đọc
        const count = parsedNotifications.filter(
          (noti) => noti.status === "unread"
        ).length;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo từ AsyncStorage:", error);
    }
  };

  // Lưu danh sách thông báo xuống AsyncStorage
  const saveNotifications = async (list) => {
    try {
      await AsyncStorage.setItem("notifications", JSON.stringify(list));
    } catch (error) {
      console.error("Lỗi khi lưu thông báo vào AsyncStorage:", error);
    }
  };

  // Thêm một thông báo mới (không ghi đè thông báo cũ)
  const addNotification = async (remoteMessage) => {
    if (remoteMessage.notification) {
      // Tùy chỉnh title nếu cần
      let title = remoteMessage.notification.title;
      if (title === "new_article") {
        title = "Trạng thái bài viết";
      }
      if (title === "order_status") {
        title = "Trạng thái đơn hàng";
      }

      const newNotification = {
        id: Date.now(),
        title,
        body: remoteMessage.notification.body,
        status: "unread",
        date: new Date().toISOString(),
      };

      // Sử dụng callback để tránh ghi đè
      setNotifications((prevNotifications) => {
        // Thêm thông báo mới vào đầu danh sách cũ
        const updated = [newNotification, ...prevNotifications];
        // Lưu xuống AsyncStorage
        saveNotifications(updated);
        return updated;
      });

      // Tăng unreadCount + hiển thị toast
      setUnreadCount((prev) => prev + 1);
      showToastNotification(newNotification);
    }
  };

  // Hiển thị Toast khi có thông báo
  const showToastNotification = (notification) => {
    Toast.show({
      type: "success",
      text1: notification.title,
      text2: notification.body,
      visibilityTime: 4000,
    });
  };

  // Yêu cầu quyền thông báo
  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Quyền thông báo đã được cấp!");
      getToken();
    } else {
      console.log("Quyền thông báo bị từ chối.");
    }
  };

  // Lấy FCM Token và lưu vào AsyncStorage (và có thể gửi lên server)
  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log("FCM Token:", token);
      await AsyncStorage.setItem("deviceToken", token);
      // Gửi token lên server kèm userId nếu cần
    } catch (error) {
      console.error("Lỗi khi lấy FCM Token:", error);
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = async () => {
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, status: "read" }));
      saveNotifications(updated);
      return updated;
    });
    setUnreadCount(0);
    console.log("Đã đánh dấu tất cả thông báo là đã đọc.");
  };

  // Đánh dấu 1 thông báo cụ thể là đã đọc
  const markAsRead = async (notificationId) => {
    setNotifications((prev) => {
      const updated = prev.map((item) => {
        if (item.id === notificationId && item.status === "unread") {
          return { ...item, status: "read" };
        }
        return item;
      });
      saveNotifications(updated);
      return updated;
    });
    setUnreadCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        markAllAsRead,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
