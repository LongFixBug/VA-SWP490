// import React, { useEffect, useState, useRef } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   Keyboard,
//   FlatList,
//   Dimensions,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   Linking,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Markdown from "react-native-markdown-display";

// import {
//   generateChatResponse,
//   generateNutritionAdvice,
// } from "../utils/geminiService";
// import {
//   getUserDataById,
//   getUserNutritionCriteria,
// } from "../services/userService";
// import {
//   getAllDishes,
//   getDishByName,
//   getRecommendedDishes,
//   getIngredientByDishId,
//   getIngredientByIngredientId,
//   getMenuBreakfastForUser,
//   getMenuLunchForUser,
//   getMenuDinnerForUser,
// } from "../services/dishService";
// import { getBusinessRules } from "../services/bussinessRuleService";

// import COLORS from "../constants/color";
// import FONTS from "../constants/font";

// const ChatBubbleComponent = () => {
//   // ---------- STATE CŨ ----------
//   const [userData, setUserData] = useState(null);
//   const [allDishes, setAllDishes] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [businessRules, setBusinessRules] = useState([]);
//   const [suggestedPrompts, setSuggestedPrompts] = useState([
//     "Phân tích dinh dưỡng của tôi.",
//   ]);
//   const [showSuggestions, setShowSuggestions] = useState(true);
//   const flatListRef = useRef(null);
//   const [cachedData, setCachedData] = useState({});

//   const [chatUser] = useState({
//     name: "Trợ lý ảo VA",
//     profile_image:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnP_P32Hj6tq00bM6yGf5x1-Xb7b7V092G0g&usqp=CAU",
//   });
//   const [currentUser] = useState({
//     name: "Bạn",
//     profile_image:
//       "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg",
//   });

//   // ---------- THÊM MỚI: STATE modal để add cart ----------
//   const [selectedDishId, setSelectedDishId] = useState(null);
//   const [selectedDishName, setSelectedDishName] = useState("");

//   // Từ khóa cấm
//   const forbiddenKeywords = [
//     "thịt",
//     "cá",
//     "gà",
//     "bò",
//     "heo",
//     "hải sản",
//     "đồ mặn",
//   ];
//   // Từ khóa khuyến mãi
//   const discountKeywords = [
//     "discount",
//     "giảm giá",
//     "cộng điểm",
//     "thành viên",
//     "thứ hạng",
//     "đạt hạng",
//     "điểm",
//   ];

//   // ---------- HÀM fetchWithAuth ----------
//   const fetchWithAuth = async (url, options = {}) => {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) {
//       throw new Error("Unauthorized: Missing token");
//     }
//     const headers = {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//       ...options.headers,
//     };
//     const response = await fetch(url, { ...options, headers });
//     return response;
//   };

//   // ---------- HÀM handleAddToCart ----------
//   const handleAddToCart = async (dishId) => {
//     try {
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) {
//         Alert.alert("Chưa có userId, không thể thêm món vào giỏ.");
//         return;
//       }
//       const response = await fetchWithAuth(
//         "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/addToCart",
//         {
//           method: "POST",
//           body: JSON.stringify({
//             userId: userId,
//             dishId: dishId,
//             quantity: 1,
//           }),
//         }
//       );
//       if (response.ok) {
//         Alert.alert("Thêm món thành công!");
//       } else {
//         Alert.alert("Thêm món thất bại!");
//       }
//     } catch (error) {
//       Alert.alert("Lỗi khi thêm món vào giỏ:", error.message);
//     }
//   };

//   // ---------- HÀM khi bấm vào link dishId=xxx ----------
//   const handleDishPress = (dishId) => {
//     const dishName = getDishNameById(dishId);
//     setSelectedDishId(dishId);
//     setSelectedDishName(dishName);
//   };

//   // ---------- LOGIC LẤY DỮ LIỆU ----------
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const userId = await AsyncStorage.getItem("userId");
//         if (!userId) {
//           throw new Error("Không tìm thấy userId trong AsyncStorage.");
//         }

//         // Kiểm tra cache
//         const cachedUserData = cachedData.userData ? cachedData.userData : null;
//         const cachedAllDishes = cachedData.allDishes
//           ? cachedData.allDishes
//           : null;
//         const cachedRules = cachedData.businessRules
//           ? cachedData.businessRules
//           : null;

//         let userInfo = cachedUserData,
//           allDishesData = cachedAllDishes,
//           rulesFromSheet = cachedRules,
//           userNutrition = null;

//         if (!cachedUserData || !cachedAllDishes || !cachedRules) {
//           const [
//             userInfoRes,
//             userNutritionRes,
//             allDishesDataRes,
//             rulesFromSheetRes,
//           ] = await Promise.all([
//             getUserDataById(userId),
//             getUserNutritionCriteria(userId),
//             getAllDishes(),
//             getBusinessRules(),
//           ]);

//           userInfo = userInfoRes;
//           userNutrition = userNutritionRes;
//           allDishesData = allDishesDataRes;
//           rulesFromSheet = rulesFromSheetRes;

//           // Cache data
//           const userDataFull = {
//             ...userInfo,
//             nutrition: userNutrition?.length ? userNutrition[0] : null,
//           };

//           setCachedData({
//             userData: userDataFull,
//             allDishes: allDishesData,
//             businessRules: rulesFromSheet,
//           });
//         }

//         const userDataFull = {
//           ...userInfo,
//           nutrition: userNutrition?.length ? userNutrition[0] : null,
//         };
//         setUserData(userDataFull);
//         setAllDishes(allDishesData);
//         setBusinessRules(rulesFromSheet);
//       } catch (error) {
//         Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // ---------- TẠO PROMPTS GỢI Ý LÚC ĐẦU ----------
//   useEffect(() => {
//     const possiblePrompts = [
//       "Gợi ý món chay giúp tăng sức đề kháng.",
//       "Những món chay phù hợp cho người đang giảm cân.",
//       "Các món ăn chay giàu vitamin từ nhà hàng VA.",
//       "Tôi nên chọn món nào để tăng cơ bắp?",
//       "Món chay nào giúp bổ sung năng lượng nhanh chóng?",
//       "Làm sao để tối ưu hóa dinh dưỡng từ món chay?",
//     ];

//     const randomPrompts = [];
//     while (randomPrompts.length < 2) {
//       const randomIndex = Math.floor(Math.random() * possiblePrompts.length);
//       const selectedPrompt = possiblePrompts[randomIndex];
//       if (!randomPrompts.includes(selectedPrompt)) {
//         randomPrompts.push(selectedPrompt);
//       }
//     }

//     setSuggestedPrompts((prevPrompts) => [
//       ...prevPrompts.slice(0, 1),
//       ...randomPrompts,
//     ]);
//   }, []);

//   // ---------- GỬI TIN NHẮN ----------
//   const sendMessage = async (message = inputMessage) => {
//     if (!message.trim()) return;

//     // Tin nhắn user
//     const userMsg = {
//       sender: currentUser.name,
//       profile_image: currentUser.profile_image,
//       message: message.trim(),
//       time: getTime(new Date()),
//     };
//     setMessages((prev) => [...prev, userMsg]);
//     setInputMessage("");
//     setShowSuggestions(false);
//     setLoading(true);

//     try {
//       let gptResponse = "";
//       const lowerMsg = message.toLowerCase();

//       // (1) Check discount
//       if (discountKeywords.some((k) => lowerMsg.includes(k))) {
//         const foundRule = findBusinessRule(message, businessRules);
//         if (foundRule) {
//           gptResponse = foundRule.Answer;
//         } else {
//           gptResponse = await generateChatResponse(
//             message,
//             userData,
//             allDishes,
//             null,
//             forbiddenKeywords
//           );
//         }
//       }
//       // (2) Dinh dưỡng
//       else if (lowerMsg === "phân tích dinh dưỡng của tôi.") {
//         gptResponse = await handleNutritionAnalysis();
//       }
//       // (3) Gợi ý theo loại
//       else if (
//         lowerMsg.includes("món chính") &&
//         (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
//       ) {
//         gptResponse = await handleRecommendDishes("món chính", message);
//       } else if (
//         lowerMsg.includes("khai vị") &&
//         (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
//       ) {
//         gptResponse = await handleRecommendDishes("khai vị", message);
//       } else if (
//         lowerMsg.includes("đồ uống") &&
//         (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
//       ) {
//         gptResponse = await handleRecommendDishes("đồ uống", message);
//       } else if (
//         lowerMsg.includes("tráng miệng") &&
//         (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
//       ) {
//         gptResponse = await handleRecommendDishes("tráng miệng", message);
//       } else if (
//         lowerMsg.includes("canh") &&
//         (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
//       ) {
//         gptResponse = await handleRecommendDishes("canh", message);
//       }
//       // (4) Thực đơn theo bữa
//       else if (
//         lowerMsg.includes("thực đơn sáng") ||
//         lowerMsg.includes("menu sáng") ||
//         lowerMsg.includes("bữa sáng")
//       ) {
//         gptResponse = await handleMenuByTime("breakfast", message);
//       } else if (
//         lowerMsg.includes("thực đơn trưa") ||
//         lowerMsg.includes("menu trưa") ||
//         lowerMsg.includes("bữa trưa")
//       ) {
//         gptResponse = await handleMenuByTime("lunch", message);
//       } else if (
//         lowerMsg.includes("thực đơn tối") ||
//         lowerMsg.includes("menu tối") ||
//         lowerMsg.includes("bữa tối")
//       ) {
//         gptResponse = await handleMenuByTime("dinner", message);
//       }
//       // // (5) Thực đơn
//       else if (
//         lowerMsg.includes("Món ăn tại cửa hàng VA") ||
//         lowerMsg.includes("Tôi nên ăn gì")
//       ) {
//         gptResponse = await generateChatResponse(
//           message,
//           userData,
//           allDishes,
//           null,
//           forbiddenKeywords
//         );
//       }
//       // (6) Thông tin món
//       else if (lowerMsg.startsWith("thông tin món ")) {
//         const dishName = lowerMsg.replace("thông tin món", "").trim();
//         gptResponse = await handleDishInfo(dishName, message);
//       }
//       // (7) Chat thường
//       else {
//         gptResponse = await generateChatResponse(
//           message,
//           userData,
//           allDishes,
//           null,
//           forbiddenKeywords
//         );
//       }

//       const expertMsg = {
//         sender: chatUser.name,
//         profile_image: chatUser.profile_image,
//         message: gptResponse,
//         time: getTime(new Date()),
//       };
//       setMessages((prev) => [...prev, expertMsg]);
//     } catch (err) {
//       console.error("Lỗi khi gửi tin nhắn:", err);
//       const errorMsg = {
//         sender: chatUser.name,
//         profile_image: chatUser.profile_image,
//         message: "Có lỗi xảy ra, vui lòng thử lại!",
//         time: getTime(new Date()),
//       };
//       setMessages((prev) => [...prev, errorMsg]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Hàm phụ: gợi ý món theo loại ----------
//   const handleRecommendDishes = async (dishType, userMessage) => {
//     try {
//       const userId = userData?.userId;
//       if (!userId) {
//         throw new Error("Không có userId, không thể gợi ý món.");
//       }

//       // Cache key
//       const cacheKey = `recommendedDishes_${userId}_${dishType}`;
//       if (cachedData[cacheKey]) {
//         const cachedResponse = await generateChatResponse(
//           userMessage,
//           userData,
//           cachedData[cacheKey],
//           null,
//           forbiddenKeywords
//         );
//         return cachedResponse;
//       }

//       const recommended = await getRecommendedDishes(userId, dishType);
//       const response = await generateChatResponse(
//         userMessage,
//         userData,
//         recommended,
//         null,
//         forbiddenKeywords
//       );
//       // Cache the recommended dishes
//       setCachedData((prevData) => ({
//         ...prevData,
//         [cacheKey]: recommended,
//       }));

//       return response;
//     } catch (error) {
//       console.log("Lỗi handleRecommendDishes:", error);
//       return "Xin lỗi, tôi chưa thể gợi ý món lúc này.";
//     }
//   };

//   // ---------- Hàm phụ: Xử lý thực đơn theo bữa ----------
//   const handleMenuByTime = async (time, userMessage) => {
//     try {
//       const userId = userData?.userId;
//       if (!userId) {
//         throw new Error("Không có userId, không thể lấy thực đơn.");
//       }
//       // Cache key
//       const cacheKey = `menu_${userId}_${time}`;
//       if (cachedData[cacheKey]) {
//         const cachedResponse = await generateChatResponse(
//           userMessage,
//           userData,
//           cachedData[cacheKey],
//           null,
//           forbiddenKeywords
//         );
//         return cachedResponse;
//       }

//       let menuData = [];
//       switch (time) {
//         case "breakfast":
//           menuData = await getMenuBreakfastForUser(userId);
//           break;
//         case "lunch":
//           menuData = await getMenuLunchForUser(userId);
//           break;
//         case "dinner":
//           menuData = await getMenuDinnerForUser(userId);
//           break;
//         default:
//           return "Không rõ thời gian bạn muốn.";
//       }
//       const response = await generateChatResponse(
//         userMessage,
//         userData,
//         menuData,
//         null,
//         forbiddenKeywords
//       );
//       // Cache the menu data
//       setCachedData((prevData) => ({
//         ...prevData,
//         [cacheKey]: menuData,
//       }));

//       return response;
//     } catch (error) {
//       console.log("Lỗi handleMenuByTime:", error);
//       return "Xin lỗi, tôi chưa thể lấy thực đơn lúc này.";
//     }
//   };

//   // ---------- Lấy thông tin món ----------
//   const handleDishInfo = async (dishName, userMessage) => {
//     try {
//       let foundDish = null;
//       // Cache key
//       const cacheKey = `dishInfo_${dishName}`;
//       if (cachedData[cacheKey]) {
//         const cachedResponse = await generateChatResponse(
//           userMessage,
//           userData,
//           allDishes,
//           cachedData[cacheKey],
//           forbiddenKeywords
//         );
//         return cachedResponse;
//       }

//       const dishData = await getDishByName(dishName);
//       if (dishData && dishData.length > 0) {
//         foundDish = dishData[0];
//       }
//       if (!foundDish) {
//         return "Tôi không tìm thấy món này trong danh sách.";
//       }

//       let fullIngredientsInfo = [];
//       try {
//         const ingredientArray = await getIngredientByDishId(foundDish.dishId);
//         const detailedIngredients = await Promise.all(
//           ingredientArray.map(async (ing) => {
//             try {
//               const detail = await getIngredientByIngredientId(
//                 ing.ingredientId
//               );
//               return {
//                 ...ing,
//                 name: detail.name,
//                 calories: detail.calories,
//                 protein: detail.protein,
//                 carbs: detail.carbs,
//                 fat: detail.fat,
//                 fiber: detail.fiber,
//               };
//             } catch (err) {
//               console.log("Lỗi getIngredientByIngredientId:", err);
//               return ing;
//             }
//           })
//         );
//         fullIngredientsInfo = detailedIngredients;
//       } catch (err) {
//         console.log("Lỗi getIngredientByDishId:", err);
//       }

//       const response = await generateChatResponse(
//         userMessage,
//         userData,
//         allDishes,
//         fullIngredientsInfo,
//         forbiddenKeywords
//       );
//       // Cache the dish info
//       setCachedData((prevData) => ({
//         ...prevData,
//         [cacheKey]: fullIngredientsInfo,
//       }));
//       return response;
//     } catch (error) {
//       console.log("Lỗi handleDishInfo:", error);
//       return "Xin lỗi, tôi chưa thể lấy thông tin món lúc này.";
//     }
//   };

//   // ---------- Phân tích dinh dưỡng ----------
//   const handleNutritionAnalysis = async () => {
//     try {
//       if (!userData || !userData.nutrition) {
//         throw new Error("Dữ liệu user chưa đủ để phân tích.");
//       }
//       // Cache key
//       const cacheKey = `nutritionAnalysis_${userData.userId}`;
//       if (cachedData[cacheKey]) {
//         return cachedData[cacheKey];
//       }

//       const dishTypes = [
//         "món chính",
//         "khai vị",
//         "tráng miệng",
//         "đồ uống",
//         "canh",
//       ];
//       let recommendedDishesData = [];

//       for (const type of dishTypes) {
//         try {
//           const recDish = await getRecommendedDishes(userData.userId, type);
//           recommendedDishesData = [...recommendedDishesData, ...recDish];
//         } catch (err) {
//           console.log("Error fetch recommended dish:", err);
//         }
//       }
//       const advice = await generateNutritionAdvice(
//         userData,
//         recommendedDishesData
//       );
//       // Cache the nutrition advice
//       setCachedData((prevData) => ({
//         ...prevData,
//         [cacheKey]: advice,
//       }));

//       return advice;
//     } catch (error) {
//       console.log("Lỗi handleNutritionAnalysis:", error);
//       return "Không thể phân tích dinh dưỡng lúc này.";
//     }
//   };

//   // ---------- Tìm rule kinh doanh ----------
//   const findBusinessRule = (userMessage, rules) => {
//     const lowerMsg = userMessage.toLowerCase();
//     for (const rule of rules) {
//       if (!rule.Question || !rule.Answer) continue;
//       const q = rule.Question.toLowerCase();

//       if (lowerMsg.includes("discount") && q.includes("discount")) return rule;
//       if (lowerMsg.includes("giảm giá") && q.includes("giảm giá")) return rule;
//       if (lowerMsg.includes("thành viên") && q.includes("thành viên"))
//         return rule;
//       if (lowerMsg.includes("cộng điểm") && q.includes("cộng điểm"))
//         return rule;
//       if (lowerMsg.includes("thứ hạng") && q.includes("thứ hạng")) return rule;
//       if (lowerMsg.includes("điểm") && q.includes("điểm")) return rule;
//       if (lowerMsg.includes("đạt hạng") && q.includes("đạt hạng")) return rule;
//     }
//     return null;
//   };

//   // ---------- Scroll cuối mỗi lần có tin nhắn ----------
//   useEffect(() => {
//     if (flatListRef.current) {
//       flatListRef.current.scrollToEnd({ animated: true });
//     }
//   }, [messages]);

//   // ---------- RENDER tin nhắn ----------
//   const renderMessage = ({ item }) => {
//     const isCurrentUser = item.sender === currentUser.name;
//     let processedMessage = item.message;

//     // Nếu tin nhắn là của "Chuyên gia" => parse & chèn link (dishId=xxx)
//     if (!isCurrentUser) {
//       // Regex bắt đoạn: "Tên Món (dishId=123)"
//       // Chú ý: có thể có dấu tiếng Việt => dùng \p{L} để match unicode letters
//       // \s* cho phép khoảng trắng
//       // (dishId[:=]\s*(\d+)) => bắt dishId
//       const regex = /([\p{L}\d\s]+)\s*\(dishId[:=]\s*(\d+)\)/giu;
//       processedMessage = processedMessage.replace(
//         regex,
//         (match, dishName, dishId) => {
//           return `[${dishName}](dishId=${dishId})`;
//         }
//       );
//     }

//     return (
//       <View style={{ marginTop: 6 }}>
//         <View
//           style={[
//             styles.messageBubble,
//             {
//               backgroundColor: isCurrentUser ? "#93bf85" : "#e0e0e0",
//               alignSelf: isCurrentUser ? "flex-end" : "flex-start",
//             },
//           ]}
//         >
//           <Markdown
//             style={{
//               body: { color: "#000", fontSize: 16 },
//               link: { color: COLORS.blue },
//               list_item: { marginVertical: 2 },
//             }}
//             onLinkPress={(url) => {
//               if (url.startsWith("dishId=")) {
//                 // Bắt ID
//                 const dishId = url.replace("dishId=", "");
//                 handleDishPress(dishId);
//               } else {
//                 // Link thường => mở web
//                 Linking.openURL(url);
//               }
//             }}
//           >
//             {processedMessage}
//           </Markdown>

//           <View
//             style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
//           >
//             <Text style={{ color: "grey", fontSize: 12 }}>{item.time}</Text>
//             <Image
//               style={styles.messageProfileImage}
//               source={{ uri: item.profile_image }}
//             />
//           </View>
//         </View>
//       </View>
//     );
//   };

//   // ---------- GỢI Ý prompt ----------
//   const renderSuggestions = () => {
//     return (
//       <View style={styles.suggestionsContainerWrapper}>
//         <Text style={styles.makeYourChoice}>Bạn có thể hỏi tôi:</Text>
//         <View style={styles.suggestionsContainer}>
//           {suggestedPrompts.map((prompt, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.suggestionButton}
//               onPress={() => sendMessage(prompt)}
//             >
//               <Text style={styles.suggestionText}>{prompt}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>
//     );
//   };

//   // ---------- Format giờ ----------
//   const getTime = (date) => {
//     let hours = date.getHours();
//     let minutes = date.getMinutes();
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12 || 12;
//     minutes = minutes < 10 ? "0" + minutes : minutes;
//     return `${hours}:${minutes} ${ampm}`;
//   };

//   // Lấy tên món từ ID
//   const getDishNameById = (dishId) => {
//     const dish = allDishes.find((d) => d.dishId === parseInt(dishId));
//     return dish ? dish.name : "Món ăn không xác định";
//   };

//   return (
//     <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
//       <View style={styles.container}>
//         <Text style={styles.chatTitle}>Trợ lý ảo Va</Text>

//         <FlatList
//           style={{ backgroundColor: "#f2f2ff", flex: 1 }}
//           data={messages}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={renderMessage}
//           ref={flatListRef}
//           onContentSizeChange={() =>
//             flatListRef.current?.scrollToEnd({ animated: true })
//           }
//           ListEmptyComponent={() =>
//             showSuggestions && !loading && renderSuggestions()
//           }
//           ListFooterComponent={() =>
//             messages.length > 0 && showSuggestions && renderSuggestions()
//           }
//         />

//         {loading && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="small" color={COLORS.grey} />
//             <Text> Đang phản hồi...</Text>
//           </View>
//         )}

//         {/* Footer nhập tin nhắn */}
//         <View style={{ paddingVertical: 10 }}>
//           <View style={styles.messageInputView}>
//             <TextInput
//               value={inputMessage}
//               style={styles.messageInput}
//               placeholder="Nhập tin nhắn..."
//               onChangeText={setInputMessage}
//               onSubmitEditing={() => sendMessage()}
//               multiline={true}
//               textAlignVertical="center"
//             />
//             <TouchableOpacity
//               style={styles.messageSendView}
//               onPress={() => sendMessage()}
//             >
//               <Icon name="send" color={COLORS.green} size={24} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Modal Thêm vào giỏ */}
//         <Modal
//           visible={selectedDishId !== null}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setSelectedDishId(null)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalText}>
//                 Bạn có muốn thêm món{" "}
//                 <Text style={{ fontWeight: "bold" }}>{selectedDishName}</Text>{" "}
//                 vào giỏ không?
//               </Text>
//               <TouchableOpacity
//                 style={{
//                   backgroundColor: COLORS.green,
//                   paddingVertical: 10,
//                   paddingHorizontal: 15,
//                   borderRadius: 8,
//                   marginBottom: 10,
//                 }}
//                 onPress={() => {
//                   handleAddToCart(selectedDishId);
//                   setSelectedDishId(null);
//                 }}
//               >
//                 <Text style={{ color: "#fff" }}>Thêm vào giỏ</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setSelectedDishId(null)}>
//                 <Text style={{ color: "red" }}>Hủy</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// // ---------------- STYLES ----------------
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f2f2ff",
//   },
//   chatTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginLeft: 20,
//     marginVertical: 10,
//   },
//   messageBubble: {
//     maxWidth: Dimensions.get("screen").width * 0.8,
//     marginHorizontal: 10,
//     padding: 10,
//     flexDirection: "column",
//     borderRadius: 20,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   messageProfileImage: {
//     height: 24,
//     width: 24,
//     borderRadius: 12,
//     marginLeft: 5,
//   },
//   suggestionsContainerWrapper: {
//     width: "90%",
//     backgroundColor: "#fff",
//     alignSelf: "center",
//     marginTop: 10,
//     borderRadius: 10,
//     paddingVertical: 10,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   makeYourChoice: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 10,
//   },
//   suggestionsContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//   },
//   suggestionButton: {
//     backgroundColor: COLORS.lightGreen,
//     padding: 10,
//     borderRadius: 20,
//     margin: 5,
//     borderWidth: 1,
//     borderColor: COLORS.green,
//   },
//   suggestionText: {
//     fontFamily: FONTS.medium,
//     color: COLORS.black,
//   },
//   messageInputView: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 14,
//     backgroundColor: "#fff",
//     borderRadius: 25,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   messageInput: {
//     flex: 1,
//     paddingLeft: 10,
//     minHeight: 40,
//     maxHeight: 120,
//     justifyContent: "center",
//   },
//   messageSendView: {
//     paddingHorizontal: 10,
//     justifyContent: "center",
//   },
//   loadingContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 10,
//     flexDirection: "row",
//   },
//   // Modal
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: "80%",
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   modalText: {
//     fontSize: 16,
//     marginBottom: 15,
//   },
// });

// export default ChatBubbleComponent;

import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Markdown from "react-native-markdown-display";

import {
  generateChatResponse,
  generateNutritionAdvice,
} from "../utils/geminiService";
import {
  getUserDataById,
  getUserNutritionCriteria,
} from "../services/userService";
import {
  getAllDishes,
  getDishByName,
  getRecommendedDishes,
  getIngredientByDishId,
  getIngredientByIngredientId,
  getMenuBreakfastForUser,
  getMenuLunchForUser,
  getMenuDinnerForUser,
} from "../services/dishService";
import { getBusinessRules } from "../services/bussinessRuleService";

import COLORS from "../constants/color";
import FONTS from "../constants/font";

const ChatBubbleComponent = () => {
  // ---------- STATE CŨ ----------.......
  const [userData, setUserData] = useState(null);
  const [allDishes, setAllDishes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessRules, setBusinessRules] = useState([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "Phân tích dinh dưỡng của tôi.",
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);

  const [chatUser] = useState({
    name: "Trợ lý ảo VA",
    profile_image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnP_P32Hj6tq00bM6yGf5x1-Xb7b7V092G0g&usqp=CAU",
  });
  const [currentUser] = useState({
    name: "Bạn",
    profile_image:
      "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg",
  });

  // ---------- THÊM MỚI: STATE modal để add cart ----------
  const [selectedDishId, setSelectedDishId] = useState(null);
  const [selectedDishName, setSelectedDishName] = useState("");

  // Từ khóa cấm
  const forbiddenKeywords = [
    "thịt",
    "cá",
    "gà",
    "bò",
    "heo",
    "hải sản",
    "đồ mặn",
  ];
  // Từ khóa khuyến mãi
  const discountKeywords = [
    "discount",
    "giảm giá",
    "cộng điểm",
    "thành viên",
    "thứ hạng",
    "đạt hạng",
    "điểm",
  ];

  // ---------- HÀM fetchWithAuth ----------
  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      throw new Error("Unauthorized: Missing token");
    }
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    return response;
  };

  // ---------- HÀM handleAddToCart ----------
  const handleAddToCart = async (dishId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Chưa có userId, không thể thêm món vào giỏ.");
        return;
      }
      const response = await fetchWithAuth(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/addToCart",
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId,
            dishId: dishId,
            quantity: 1,
          }),
        }
      );
      if (response.ok) {
        Alert.alert("Thêm món thành công!");
      } else {
        Alert.alert("Thêm món thất bại!");
      }
    } catch (error) {
      Alert.alert("Lỗi khi thêm món vào giỏ:", error.message);
    }
  };

  // ---------- HÀM khi bấm vào link dishId=xxx ----------
  const handleDishPress = (dishId) => {
    const dishName = getDishNameById(dishId);
    setSelectedDishId(dishId);
    setSelectedDishName(dishName);
  };

  // ---------- LOGIC LẤY DỮ LIỆU ----------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          throw new Error("Không tìm thấy userId trong AsyncStorage.");
        }
        const userInfo = await getUserDataById(userId);
        const userNutrition = await getUserNutritionCriteria(userId);
        const userDataFull = {
          ...userInfo,
          nutrition: userNutrition?.length ? userNutrition[0] : null,
        };
        setUserData(userDataFull);

        const allDishesData = await getAllDishes();
        setAllDishes(allDishesData);

        const rulesFromSheet = await getBusinessRules();
        setBusinessRules(rulesFromSheet);
      } catch (error) {
        Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ---------- TẠO PROMPTS GỢI Ý LÚC ĐẦU ----------
  useEffect(() => {
    const possiblePrompts = [
      "Gợi ý món chay giúp tăng sức đề kháng.",
      "Những món chay phù hợp cho người đang giảm cân.",
      "Các món ăn chay giàu vitamin từ nhà hàng VA.",
      "Tôi nên chọn món nào để tăng cơ bắp?",
      "Món chay nào giúp bổ sung năng lượng nhanh chóng?",
      "Làm sao để tối ưu hóa dinh dưỡng từ món chay?",
    ];

    const randomPrompts = [];
    while (randomPrompts.length < 2) {
      const randomIndex = Math.floor(Math.random() * possiblePrompts.length);
      const selectedPrompt = possiblePrompts[randomIndex];
      if (!randomPrompts.includes(selectedPrompt)) {
        randomPrompts.push(selectedPrompt);
      }
    }

    setSuggestedPrompts((prevPrompts) => [
      ...prevPrompts.slice(0, 1),
      ...randomPrompts,
    ]);
  }, []);

  // ---------- GỬI TIN NHẮN ----------
  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    // Tin nhắn user
    const userMsg = {
      sender: currentUser.name,
      profile_image: currentUser.profile_image,
      message: message.trim(),
      time: getTime(new Date()),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setShowSuggestions(false);
    setLoading(true);

    try {
      let gptResponse = "";
      const lowerMsg = message.toLowerCase();

      // (1) Check discount
      if (discountKeywords.some((k) => lowerMsg.includes(k))) {
        const foundRule = findBusinessRule(message, businessRules);
        if (foundRule) {
          gptResponse = foundRule.Answer;
        } else {
          gptResponse = await generateChatResponse(
            message,
            userData,
            allDishes,
            null,
            forbiddenKeywords
          );
        }
      }
      // (2) Dinh dưỡng
      else if (lowerMsg === "phân tích dinh dưỡng của tôi.") {
        gptResponse = await handleNutritionAnalysis();
      }
      // (3) Gợi ý theo loại
      else if (
        lowerMsg.includes("món chính") &&
        (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
      ) {
        gptResponse = await handleRecommendDishes("món chính", message);
      } else if (
        lowerMsg.includes("khai vị") &&
        (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
      ) {
        gptResponse = await handleRecommendDishes("khai vị", message);
      } else if (
        lowerMsg.includes("đồ uống") &&
        (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
      ) {
        gptResponse = await handleRecommendDishes("đồ uống", message);
      } else if (
        lowerMsg.includes("tráng miệng") &&
        (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
      ) {
        gptResponse = await handleRecommendDishes("tráng miệng", message);
      } else if (
        lowerMsg.includes("canh") &&
        (lowerMsg.includes("gợi ý") || lowerMsg.includes("cho tôi"))
      ) {
        gptResponse = await handleRecommendDishes("canh", message);
      }
      // (4) Thực đơn theo bữa
      else if (
        lowerMsg.includes("thực đơn sáng") ||
        lowerMsg.includes("menu sáng") ||
        lowerMsg.includes("bữa sáng")
      ) {
        gptResponse = await handleMenuByTime("breakfast", message);
      } else if (
        lowerMsg.includes("thực đơn trưa") ||
        lowerMsg.includes("menu trưa") ||
        lowerMsg.includes("bữa trưa")
      ) {
        gptResponse = await handleMenuByTime("lunch", message);
      } else if (
        lowerMsg.includes("thực đơn tối") ||
        lowerMsg.includes("menu tối") ||
        lowerMsg.includes("bữa tối")
      ) {
        gptResponse = await handleMenuByTime("dinner", message);
      }
      // // (5) Thực đơn
      else if (
        lowerMsg.includes("Món ăn tại cửa hàng VA") ||
        lowerMsg.includes("Tôi nên ăn gì")
      ) {
        gptResponse = await generateChatResponse(
          message,
          userData,
          allDishes,
          null,
          forbiddenKeywords
        );
      }
      // (6) Thông tin món
      else if (lowerMsg.startsWith("thông tin món ")) {
        const dishName = lowerMsg.replace("thông tin món", "").trim();
        gptResponse = await handleDishInfo(dishName, message);
      }
      // (7) Chat thường
      else {
        gptResponse = await generateChatResponse(
          message,
          userData,
          allDishes,
          null,
          forbiddenKeywords
        );
      }

      const expertMsg = {
        sender: chatUser.name,
        profile_image: chatUser.profile_image,
        message: gptResponse,
        time: getTime(new Date()),
      };
      setMessages((prev) => [...prev, expertMsg]);
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
      const errorMsg = {
        sender: chatUser.name,
        profile_image: chatUser.profile_image,
        message: "Có lỗi xảy ra, vui lòng thử lại!",
        time: getTime(new Date()),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Hàm phụ: gợi ý món theo loại ----------
  const handleRecommendDishes = async (dishType, userMessage) => {
    try {
      const userId = userData?.userId;
      if (!userId) {
        throw new Error("Không có userId, không thể gợi ý món.");
      }
      const recommended = await getRecommendedDishes(userId, dishType);
      const response = await generateChatResponse(
        userMessage,
        userData,
        recommended,
        null,
        forbiddenKeywords
      );
      return response;
    } catch (error) {
      console.log("Lỗi handleRecommendDishes:", error);
      return "Xin lỗi, tôi chưa thể gợi ý món lúc này.";
    }
  };

  // ---------- Hàm phụ: Xử lý thực đơn theo bữa ----------
  const handleMenuByTime = async (time, userMessage) => {
    try {
      const userId = userData?.userId;
      if (!userId) {
        throw new Error("Không có userId, không thể lấy thực đơn.");
      }
      let menuData = [];
      switch (time) {
        case "breakfast":
          menuData = await getMenuBreakfastForUser(userId);
          break;
        case "lunch":
          menuData = await getMenuLunchForUser(userId);
          break;
        case "dinner":
          menuData = await getMenuDinnerForUser(userId);
          break;
        default:
          return "Không rõ thời gian bạn muốn.";
      }
      console.log("Menu Data => ", menuData);
      const response = await generateChatResponse(
        userMessage,
        userData,
        menuData,
        null,
        forbiddenKeywords
      );
      return response;
    } catch (error) {
      console.log("Lỗi handleMenuByTime:", error);
      return "Xin lỗi, tôi chưa thể lấy thực đơn lúc này.";
    }
  };

  // ---------- Lấy thông tin món ----------
  const handleDishInfo = async (dishName, userMessage) => {
    try {
      let foundDish = null;
      const dishData = await getDishByName(dishName);
      if (dishData && dishData.length > 0) {
        foundDish = dishData[0];
      }
      if (!foundDish) {
        return "Tôi không tìm thấy món này trong danh sách.";
      }

      let fullIngredientsInfo = [];
      try {
        const ingredientArray = await getIngredientByDishId(foundDish.dishId);
        const detailedIngredients = await Promise.all(
          ingredientArray.map(async (ing) => {
            try {
              const detail = await getIngredientByIngredientId(
                ing.ingredientId
              );
              return {
                ...ing,
                name: detail.name,
                calories: detail.calories,
                protein: detail.protein,
                carbs: detail.carbs,
                fat: detail.fat,
                fiber: detail.fiber,
              };
            } catch (err) {
              console.log("Lỗi getIngredientByIngredientId:", err);
              return ing;
            }
          })
        );
        fullIngredientsInfo = detailedIngredients;
      } catch (err) {
        console.log("Lỗi getIngredientByDishId:", err);
      }

      const response = await generateChatResponse(
        userMessage,
        userData,
        allDishes,
        fullIngredientsInfo,
        forbiddenKeywords
      );
      return response;
    } catch (error) {
      console.log("Lỗi handleDishInfo:", error);
      return "Xin lỗi, tôi chưa thể lấy thông tin món lúc này.";
    }
  };

  // ---------- Phân tích dinh dưỡng ----------
  const handleNutritionAnalysis = async () => {
    try {
      if (!userData || !userData.nutrition) {
        throw new Error("Dữ liệu user chưa đủ để phân tích.");
      }
      const dishTypes = [
        "món chính",
        "khai vị",
        "tráng miệng",
        "đồ uống",
        "canh",
      ];
      let recommendedDishesData = [];

      for (const type of dishTypes) {
        try {
          const recDish = await getRecommendedDishes(userData.userId, type);
          recommendedDishesData = [...recommendedDishesData, ...recDish];
        } catch (err) {
          console.log("Error fetch recommended dish:", err);
        }
      }
      const advice = await generateNutritionAdvice(
        userData,
        recommendedDishesData
      );
      return advice;
    } catch (error) {
      console.log("Lỗi handleNutritionAnalysis:", error);
      return "Không thể phân tích dinh dưỡng lúc này.";
    }
  };

  // ---------- Tìm rule kinh doanh ----------
  const findBusinessRule = (userMessage, rules) => {
    const lowerMsg = userMessage.toLowerCase();
    for (const rule of rules) {
      if (!rule.Question || !rule.Answer) continue;
      const q = rule.Question.toLowerCase();

      if (lowerMsg.includes("discount") && q.includes("discount")) return rule;
      if (lowerMsg.includes("giảm giá") && q.includes("giảm giá")) return rule;
      if (lowerMsg.includes("thành viên") && q.includes("thành viên"))
        return rule;
      if (lowerMsg.includes("cộng điểm") && q.includes("cộng điểm"))
        return rule;
      if (lowerMsg.includes("thứ hạng") && q.includes("thứ hạng")) return rule;
      if (lowerMsg.includes("điểm") && q.includes("điểm")) return rule;
      if (lowerMsg.includes("đạt hạng") && q.includes("đạt hạng")) return rule;
    }
    return null;
  };

  // ---------- Scroll cuối mỗi lần có tin nhắn ----------
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // ---------- RENDER tin nhắn ----------
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender === currentUser.name;
    let processedMessage = item.message;

    // Nếu tin nhắn là của "Chuyên gia" => parse & chèn link (dishId=xxx)
    if (!isCurrentUser) {
      // Regex bắt đoạn: "Tên Món (dishId=123)"
      // Chú ý: có thể có dấu tiếng Việt => dùng \p{L} để match unicode letters
      // \s* cho phép khoảng trắng
      // (dishId[:=]\s*(\d+)) => bắt dishId
      const regex = /([\p{L}\d\s]+)\s*\(dishId[:=]\s*(\d+)\)/giu;
      processedMessage = processedMessage.replace(
        regex,
        (match, dishName, dishId) => {
          return `[${dishName}](dishId=${dishId})`;
        }
      );
    }

    return (
      <View style={{ marginTop: 6 }}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isCurrentUser ? "#93bf85" : "#e0e0e0",
              alignSelf: isCurrentUser ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Markdown
            style={{
              body: { color: "#000", fontSize: 16 },
              link: { color: COLORS.blue },
              list_item: { marginVertical: 2 },
            }}
            onLinkPress={(url) => {
              if (url.startsWith("dishId=")) {
                // Bắt ID
                const dishId = url.replace("dishId=", "");
                handleDishPress(dishId);
              } else {
                // Link thường => mở web
                Linking.openURL(url);
              }
            }}
          >
            {processedMessage}
          </Markdown>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            <Text style={{ color: "grey", fontSize: 12 }}>{item.time}</Text>
            <Image
              style={styles.messageProfileImage}
              source={{ uri: item.profile_image }}
            />
          </View>
        </View>
      </View>
    );
  };

  // ---------- GỢI Ý prompt ----------
  const renderSuggestions = () => {
    return (
      <View style={styles.suggestionsContainerWrapper}>
        <Text style={styles.makeYourChoice}>Bạn có thể hỏi tôi:</Text>
        <View style={styles.suggestionsContainer}>
          {suggestedPrompts.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => sendMessage(prompt)}
            >
              <Text style={styles.suggestionText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // ---------- Format giờ ----------
  const getTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Lấy tên món từ ID
  const getDishNameById = (dishId) => {
    const dish = allDishes.find((d) => d.dishId === parseInt(dishId));
    return dish ? dish.name : "Món ăn không xác định";
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.chatTitle}>Trợ lý ảo Va</Text>

        <FlatList
          style={{ backgroundColor: "#f2f2ff", flex: 1 }}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMessage}
          ref={flatListRef}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={() =>
            showSuggestions && !loading && renderSuggestions()
          }
          ListFooterComponent={() =>
            messages.length > 0 && showSuggestions && renderSuggestions()
          }
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.grey} />
            <Text> Đang phản hồi...</Text>
          </View>
        )}

        {/* Footer nhập tin nhắn */}
        <View style={{ paddingVertical: 10 }}>
          <View style={styles.messageInputView}>
            <TextInput
              value={inputMessage}
              style={styles.messageInput}
              placeholder="Nhập tin nhắn..."
              onChangeText={setInputMessage}
              onSubmitEditing={() => sendMessage()}
              multiline={true}
              textAlignVertical="center"
            />
            <TouchableOpacity
              style={styles.messageSendView}
              onPress={() => sendMessage()}
            >
              <Icon name="send" color={COLORS.green} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal Thêm vào giỏ */}
        <Modal
          visible={selectedDishId !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedDishId(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Bạn có muốn thêm món{" "}
                <Text style={{ fontWeight: "bold" }}>{selectedDishName}</Text>{" "}
                vào giỏ không?
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.green,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
                onPress={() => {
                  handleAddToCart(selectedDishId);
                  setSelectedDishId(null);
                }}
              >
                <Text style={{ color: "#fff" }}>Thêm vào giỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedDishId(null)}>
                <Text style={{ color: "red" }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2ff",
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
    marginVertical: 10,
  },
  messageBubble: {
    maxWidth: Dimensions.get("screen").width * 0.8,
    marginHorizontal: 10,
    padding: 10,
    flexDirection: "column",
    borderRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  messageProfileImage: {
    height: 24,
    width: 24,
    borderRadius: 12,
    marginLeft: 5,
  },
  suggestionsContainerWrapper: {
    width: "90%",
    backgroundColor: "#fff",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  makeYourChoice: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  suggestionButton: {
    backgroundColor: COLORS.lightGreen,
    padding: 10,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  suggestionText: {
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  messageInputView: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  messageInput: {
    flex: 1,
    paddingLeft: 10,
    minHeight: 40,
    maxHeight: 120,
    justifyContent: "center",
  },
  messageSendView: {
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    flexDirection: "row",
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
  },
});

export default ChatBubbleComponent;
