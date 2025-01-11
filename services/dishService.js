import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Lấy tất cả món ăn (nếu cần hiển thị full list)
export const getAllDishes = async () => {
  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/allDish`;
  return fetchWithAuth(url);
};

// Lấy món ăn theo tên
export const getDishByName = async (name) => {
  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/getDishByName/${name}`;
  return fetchWithAuth(url);
};

// Lấy món ăn gợi ý cho người dùng (truyền loại món vào param)
export const getRecommendedDishes = async (userId, dishType) => {
  if (!userId) throw new Error("Không có userId để gợi ý món.");
  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendDishes/${userId}?dishType=${dishType}`;
  return fetchWithAuth(url);
};

// Lấy danh sách nguyên liệu cho 1 món (theo dishId)
export const getIngredientByDishId = async (dishId) => {
  if (!dishId) throw new Error("Không có dishId để lấy nguyên liệu.");
  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${dishId}`;
  return fetchWithAuth(url);
};

// Lấy chi tiết 1 nguyên liệu (theo ingredientId)
export const getIngredientByIngredientId = async (ingredientId) => {
  if (!ingredientId)
    throw new Error("Không có ingredientId để lấy thông tin nguyên liệu.");
  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${ingredientId}`;
  return fetchWithAuth(url);
};

// Lấy thực đơn bữa sáng cho người dùng
export const getMenuBreakfastForUser = async (userId) => {
  if (!userId) throw new Error("Không có userId để lấy thực đơn bữa sáng.");
  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuBreakfastForUser/${userId}`;
  return fetchWithAuth(url);
};

// Lấy thực đơn bữa trưa cho người dùng
export const getMenuLunchForUser = async (userId) => {
  if (!userId) throw new Error("Không có userId để lấy thực đơn bữa trưa.");
  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuLunchForUser/${userId}`;
  return fetchWithAuth(url);
};

// Lấy thực đơn bữa tối cho người dùng
export const getMenuDinnerForUser = async (userId) => {
  if (!userId) throw new Error("Không có userId để lấy thực đơn bữa tối.");
  const url = `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/recommendMenuDinnerForUser/${userId}`;
  return fetchWithAuth(url);
};
