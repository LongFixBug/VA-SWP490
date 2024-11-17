import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import { Alert, View, Text, StyleSheet } from "react-native";

const WebViewScreen = ({ navigation, route }) => {
  const { url } = route.params;
  const [countdown, setCountdown] = useState(5); // Đếm ngược 5s

  const handleNavigationChange = (navState) => {
    const currentUrl = navState.url;

    // Phát hiện hành động "Hủy"
    if (currentUrl.includes("cancel")) {
      Alert.alert("Thông báo", "Cám ơn bạn đã sử dụng dịch vụ");
      navigation.goBack(); // Quay lại trang trước
    }

    // Phát hiện thanh toán thành công
    if (currentUrl.includes("completed")) {
      // Hiển thị trang đếm ngược
      navigation.navigate("SuccessScreen"); // Điều hướng đến trang Success
    }
  };

  return (
    <WebView
      source={{ uri: url }}
      onNavigationStateChange={handleNavigationChange} // Lắng nghe thay đổi URL
    />
  );
};

// Trang Success Screen
const SuccessScreen = ({ navigation }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          Alert.alert("Thông báo", "Đã thanh toán thành công.");
          navigation.navigate("Home"); // Tự động quay về trang Home
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>Đã thanh toán thành công!</Text>
      <Text style={styles.countdownText}>
        Quay về cửa hàng sau {countdown} giây...
      </Text>
    </View>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  successText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 18,
    color: "#555",
  },
});
