import React, { useRef } from "react";
import { WebView } from "react-native-webview";
import { StyleSheet } from "react-native";

const WebViewsScreen = ({ navigation, route }) => {
  const { url } = route.params;
  const webViewRef = useRef(null);

  const handleNavigationChange = (navState) => {
    const currentUrl = navState.url;

    // Phát hiện URL chứa từ khóa "cancel"
    if (
      currentUrl.includes("api/v1/wallet/transaction/result") ||
      currentUrl.includes("api/v1/wallet/transaction/result")
    ) {
      // Ngăn không cho WebView điều hướng
      if (webViewRef.current) {
        webViewRef.current.stopLoading();
      }

      // Điều hướng trực tiếp về Checkout
      navigation.navigate("WalletScreen");
    }
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: url }}
      onNavigationStateChange={handleNavigationChange} // Lắng nghe sự thay đổi của URL
      startInLoadingState={true} // Hiển thị trạng thái tải ban đầu
    />
  );
};

export default WebViewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
