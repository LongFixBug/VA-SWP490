import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import { generateChatResponse } from "../utils/geminiService"; // Import hàm generateChatResponse
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Hàm gọi API với token
  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("Không tìm thấy token.");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          throw new Error("Không tìm thấy User ID.");
        }
        // Fetch user data
        const userResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${userId}`
        );
        if (!userResponse.ok) {
          throw new Error(
            `Failed to fetch user data: ${userResponse.status} ${userResponse.statusText}`
          );
        }
        const userData = await userResponse.json();
        setUserData(userData);
      } catch (error) {
        console.error("Error during fetchUserData:", error);
      }
    };

    fetchUserData();

    navigation.setOptions({
      headerTitle: "Chat với chuyên gia",
    });
  }, [navigation]);
  const sendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const userMessage = {
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const combinedMessage = `Thông tin người dùng: ${JSON.stringify(
        userData
      )}. Tin nhắn của người dùng: ${inputMessage}`;

      const geminiResponse = await generateChatResponse(combinedMessage); // Sử dụng generateChatResponse

      const expertMessage = {
        text: geminiResponse,
        sender: "expert",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, expertMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.chatContainer}
        ref={(ref) => (this.scrollView = ref)}
        onContentSizeChange={() =>
          this.scrollView.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.sender === "user" ? styles.userMessage : styles.expertMessage,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
            <Text style={styles.messageTime}>{msg.timestamp}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.grey} />
            <Text> Đang phản hồi...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  chatContainer: {
    padding: 10,
  },
  message: {
    maxWidth: "80%",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.lightGreen,
  },
  expertMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightGrey,
  },
  messageText: {
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    alignSelf: "flex-end",
    marginLeft: 5,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: COLORS.lightGrey,
  },
  input: {
    flex: 1,
    borderColor: COLORS.grey,
    borderWidth: 1,
    marginRight: 10,
    padding: 8,
    borderRadius: 5,
  },
  sendButton: {
    backgroundColor: COLORS.green,
    padding: 10,
    borderRadius: 5,
  },
});

export default ChatScreen;
