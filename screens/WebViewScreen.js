import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import { Alert, View, Text, StyleSheet } from "react-native";

const WebViewScreen = ({ navigation, route }) => {
  const { url } = route.params;

  const handleNavigationChange = (navState) => {
    const currentUrl = navState.url;

    // Phát hiện hành động "Hủy"
    if (currentUrl.includes("cancel")) {
      Alert.alert("Thông báo", "Cám ơn bạn đã sử dụng dịch vụ");
      navigation.goBack(); // Quay lại trang trước
    }
  };

  return (
    <WebView
      source={{ uri: url }}
      onNavigationStateChange={handleNavigationChange} // Lắng nghe thay đổi URL
    />
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
