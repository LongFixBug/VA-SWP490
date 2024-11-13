import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const WebViewScreen = ({ route }) => {
  const { url } = route.params; // Nhận URL từ navigation params

  return (
    <View style={styles.container}>
      <WebView source={{ uri: url }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebViewScreen;
