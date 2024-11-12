import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
export default Authentication;
