// contexts/NotificationContext.js

import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import Toast from "react-native-toast-message";

// Tạo Context
export const NotificationContext = createContext();

// Provider Component
export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);

  // Hàm fetch với xác thực
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
        // Bạn có thể thêm logic để xử lý token hết hạn tại đây
      }
      return response;
    } catch (error) {
      console.error("Error fetching with auth:", error);
      throw error;
    }
  };

  // Hàm lấy danh sách thông báo và đếm số Unread
  const fetchNotifications = async () => {
    try {
      if (!userId) {
        console.log("UserId is null, skip fetching notification");
        setUnreadCount(0); // Đặt lại số lượng nếu không có userId
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

        // Kiểm tra trường status và đảm bảo so sánh chính xác
        const count = sortedNotifications.filter(
          (notification) => notification.status.toLowerCase() === "unread"
        ).length;
        setUnreadCount(count);
      } else if (response.status === 404) {
        console.log("User không có thông báo nào.");
        setUnreadCount(0);
      } else {
        console.error(
          "Lỗi khi lấy thông báo:",
          response.status,
          await response.text()
        );
        setUnreadCount(0); // Đặt lại số lượng trong trường hợp lỗi
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      setUnreadCount(0); // Đặt lại số lượng trong trường hợp lỗi
    }
  };

  // Hàm yêu cầu quyền thông báo
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

  // Hàm lấy FCM Token
  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log("FCM Token:", token);
      await AsyncStorage.setItem("deviceToken", token);
    } catch (error) {
      console.error("Lỗi khi lấy FCM Token:", error);
    }
  };

  // Hàm hiển thị Toast khi nhận thông báo
  const showToastNotification = (remoteMessage) => {
    if (remoteMessage.notification) {
      Toast.show({
        type: "success",
        text1: remoteMessage.notification.title,
        text2: remoteMessage.notification.body,
      });
    }
  };

  // useEffect để lấy userId từ AsyncStorage
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

  // useEffect để fetch notifications khi userId thay đổi
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // useEffect để khởi tạo Firebase Messaging
  useEffect(() => {
    const initMessaging = async () => {
      await requestPermission();

      const unsubscribeForeground = messaging().onMessage(
        async (remoteMessage) => {
          console.log("Tin nhắn foreground:", remoteMessage);
          showToastNotification(remoteMessage);
          fetchNotifications(); // Cập nhật số lượng khi nhận thông báo mới
        }
      );

      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log("Tin nhắn background:", remoteMessage);
        // Không thể gọi fetchNotifications trực tiếp ở background
      });

      return unsubscribeForeground;
    };

    initMessaging();

    return () => {
      // Hủy bỏ listener khi component unmount
      messaging().onMessage(() => {});
    };
  }, [userId]);

  // Thêm useEffect để lắng nghe khi người dùng mở ứng dụng từ thông báo
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
      fetchNotifications(); // Cập nhật số lượng khi người dùng mở thông báo
    });

    // Kiểm tra xem ứng dụng có được mở từ thông báo khi chưa mở trước đó không
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
          fetchNotifications();
        }
      });

    return unsubscribe;
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
