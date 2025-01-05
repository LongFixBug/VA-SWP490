// userService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lấy token để sử dụng cho tất cả request
const fetchWithAuth = async (url, method = "GET", body = null) => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("Không tìm thấy token.");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
};

// Lấy thông tin user (vd: chiều cao, cân nặng, tuổi, giới tính, ...)
export const getUserDataById = async (userId) => {
  if (!userId) throw new Error("Không có userId để fetch data.");

  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${userId}`;
  return fetchWithAuth(url);
};

// Lấy tiêu chí/ tiêu chuẩn dinh dưỡng của người dùng
export const getUserNutritionCriteria = async (userId) => {
  if (!userId) throw new Error("Không có userId để fetch criteria.");

  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionCriterions/getUserNutritionCriteriaDetailByUserId/${userId}`;
  return fetchWithAuth(url);
};
