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

// Import hàm GPT
import {
  generateChatResponse,
  generateNutritionAdvice,
} from "../utils/geminiService";

// Import services (logic gọi API người dùng, món ăn, nguyên liệu)
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
} from "../services/dishService";

// Import business rule service
import { getBusinessRules } from "../services/bussinessRuleService";

// Constants (màu sắc, font, ...)
// Giả sử bạn có COLORS, FONTS, Header...
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";

export default function CombineScreen({ navigation }) {
  // ---------- STATE CŨ ----------
  // Thông tin user
  const [userData, setUserData] = useState(null);
  // Danh sách món
  const [allDishes, setAllDishes] = useState([]);
  // State chat
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Danh sách business rules (discount, giảm giá, thành viên...)
  const [businessRules, setBusinessRules] = useState([]);

  // Prompt gợi ý
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "Phân tích dinh dưỡng của tôi.",
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const flatListRef = useRef(null);

  // Thông tin chat user
  const [chatUser] = useState({
    name: "Chuyên gia",
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
  // Từ khóa cấm (các món mặn)
  const forbiddenKeywords = [
    "thịt",
    "cá",
    "gà",
    "bò",
    "heo",
    "hải sản",
    "đồ mặn",
  ];

  // Từ khóa để bắt các câu hỏi discount/giảm giá/thành viên...
  const discountKeywords = [
    "discount",
    "giảm giá",
    "cộng điểm",
    "thành viên",
    "thứ hạng",
    "đạt hạng",
    "thứ hạng",
    "điểm",
  ];

  // ---------- HÀM fetchWithAuth (copy logic cũ dishDetailScreen) ----------
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
      // Gọi API thêm món
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

  // ---------- LOGIC CŨ LẤY DỮ LIỆU ----------
  useEffect(() => {
    navigation.setOptions({ title: "", headerShown: false });

    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          throw new Error("Không tìm thấy userId trong AsyncStorage.");
        }

        // Lấy thông tin user
        const userInfo = await getUserDataById(userId);
        const userNutrition = await getUserNutritionCriteria(userId);
        const userDataFull = {
          ...userInfo,
          nutrition: userNutrition?.length ? userNutrition[0] : null,
        };
        setUserData(userDataFull);

        // Lấy danh sách tất cả món
        const allDishesData = await getAllDishes();
        setAllDishes(allDishesData);

        // Lấy business rules (discount, giảm giá, ...)
        const rulesFromSheet = await getBusinessRules();
        setBusinessRules(rulesFromSheet);
      } catch (error) {
        Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigation]);

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

      // (1) Check discount / membership keywords
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
      // (2) Các case logic GPT
      else if (lowerMsg === "phân tích dinh dưỡng của tôi.") {
        gptResponse = await handleNutritionAnalysis();
      } else if (
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
      } else if (
        lowerMsg.includes("thực đơn") ||
        lowerMsg.includes("menu") ||
        lowerMsg.includes("món ăn")
      ) {
        gptResponse = await generateChatResponse(
          message,
          userData,
          allDishes,
          null,
          forbiddenKeywords
        );
      } else if (lowerMsg.startsWith("thông tin món ")) {
        const dishName = lowerMsg.replace("thông tin món", "").trim();
        gptResponse = await handleDishInfo(dishName, message);
      } else {
        // Chat thường
        gptResponse = await generateChatResponse(
          message,
          userData,
          allDishes,
          null,
          forbiddenKeywords
        );
      }

      // Tạo tin nhắn GPT
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

  // ---------- Hàm phụ handleRecommendDishes ----------
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
        recommended, // Mảng dish gợi ý
        null,
        forbiddenKeywords
      );
      return response;
    } catch (error) {
      console.log("Lỗi handleRecommendDishes:", error);
      return "Xin lỗi, tôi chưa thể gợi ý món lúc này.";
    }
  };

  // ---------- Hàm lấy thông tin món ----------
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

      // Lấy ingredients chi tiết
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

      // Gọi GPT
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

  // ---------- Hàm phân tích dinh dưỡng ----------
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

  // ---------- Hàm tìm rule trong businessRules ----------
  const findBusinessRule = (userMessage, rules) => {
    const lowerMsg = userMessage.toLowerCase();
    for (const rule of rules) {
      if (!rule.Question || !rule.Answer) continue;
      const q = rule.Question.toLowerCase();

      if (lowerMsg.includes("discount") && q.includes("discount")) {
        return rule;
      }
      if (lowerMsg.includes("giảm giá") && q.includes("giảm giá")) {
        return rule;
      }
      if (lowerMsg.includes("thành viên") && q.includes("thành viên")) {
        return rule;
      }
      if (lowerMsg.includes("cộng điểm") && q.includes("cộng điểm")) {
        return rule;
      }
      if (lowerMsg.includes("thứ hạng") && q.includes("thứ hạng")) {
        return rule;
      }
      if (lowerMsg.includes("điểm") && q.includes("điểm")) {
        return rule;
      }
      if (lowerMsg.includes("đạt hạng") && q.includes("đạt hạng")) {
        return rule;
      }
    }
    return null;
  };

  // ---------- Scroll cuối khi messages thay đổi ----------
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // ---------- RENDER tin nhắn ----------
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender === currentUser.name;

    // (1) Nếu tin nhắn là của "Chuyên gia" => ta parse & chèn link cho (dishId=xxx)
    let processedMessage = item.message;
    if (!isCurrentUser) {
      // Bắt " (dishId=4)" hay " (dishId: 4)" đều được:
      const regex = /([\p{L}\d\s]+)\s*\(dishId[:=]\s*(\d+)\)/giu;

      // Tìm mọi đoạn "Tên Món (dishId=123)"
      // => chuyển thành link markdown: [Tên Món](dishId=123)
      processedMessage = processedMessage.replace(
        regex,
        (match, dishName, dishId) => {
          // dishName = "Gỏi cuốn chay"
          // dishId = 123
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
              // Kiểm tra link: nếu bắt đầu = dishId= => handleDishPress
              if (url.startsWith("dishId=")) {
                const dishId = url.replace("dishId=", "");
                handleDishPress(dishId);
              } else {
                // link thường => mở web
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
  const getDishNameById = (dishId) => {
    const dish = allDishes.find((d) => d.dishId === parseInt(dishId));
    return dish ? dish.name : "Món ăn không xác định";
  };

  // ---------- UI ----------
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Header
          title={"Trợ lí VA"}
          leftIcon={"arrow-back-outline"}
          colorBackground={"#f2f2ff"}
          colorText={COLORS.black}
          onPress={() => navigation.goBack()}
          rightIcon={"chatbubble-outline"}
        />

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

        {/* ------------ Modal AddToCart ------------ */}
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
        {/* ------------ End Modal ------------ */}
      </View>
    </TouchableWithoutFeedback>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2ff",
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
  // Modal styles
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
});
