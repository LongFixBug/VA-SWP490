// geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAgus8QE7iz4VQrA1ds-gUjQdty3016BEQ"; // Thay bằng API Key thật
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Hàm generateNutritionAdvice – phân tích dinh dưỡng cho người dùng
export const generateNutritionAdvice = async (userData, dishes) => {
  try {
    const { nutrition, ...userInformation } = userData;
    const prompt = `
      Bạn là một chuyên gia dinh dưỡng của hệ thống VA, có nhiều năm kinh nghiệm, chuyên sâu về dinh dưỡng cá nhân hóa và tối ưu hóa sức khỏe cho người ăn chay. 
      Hãy phân tích dữ liệu người dùng và món ăn sau, rồi đưa ra lời khuyên chi tiết. 
      Trả lời dưới dạng text.

      **Hướng dẫn**:
      1. Tính BMI, giải thích ý nghĩa.
      2. Phân tích dữ liệu cá nhân (tuổi, giới tính, mục tiêu...).
      3. Phân tích dữ liệu dinh dưỡng (calo, chất béo, carbs, protein...).
      4. Đưa ra lời khuyên dinh dưỡng chi tiết, gợi ý món ăn chay phù hợp.
      5. đưa ra lịch tập luyện theo ngày , theo tuần 
      6. Nêu rõ rủi ro nếu không điều chỉnh, lợi ích khi làm đúng.

      _Thông tin người dùng: ${JSON.stringify(userInformation)}
      _Dữ liệu dinh dưỡng: ${JSON.stringify(nutrition)}
      _Thông tin món ăn: ${JSON.stringify(dishes)}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate nutrition advice.");
  }
};

// Hàm generateChatResponse – xử lý chat chung (hỏi về món ăn, nguyên liệu...)
export const generateChatResponse = async (
  userMessage,
  userData,
  dishes,
  foodData,
  forbiddenKeywords = []
) => {
  try {
    let context = `
      Bạn là một chuyên gia dinh dưỡng của hệ thống VA, chuyên sâu về dinh dưỡng ăn chay và cá nhân hóa sức khỏe. 
      Hãy trả lời dưới dạng text, dùng ngôn ngữ tự nhiên và dễ hiểu.

      **Yêu cầu chung**:
      1. Ưu tiên các lựa chọn ăn chay, không nhắc đến các loại thịt nếu người dùng yêu cầu. 
         Nếu gặp từ khóa cấm: ${forbiddenKeywords.join(
           ", "
         )}, hãy từ chối hoặc đề xuất giải pháp thay thế (chay).
      2. Khi nhắc đến một **món ăn** nằm trong danh sách "Thông tin món ăn" (dishes), 
         bạn **phải** viết đúng cú pháp: Tên Món (dishId=xxx). 
         Ví dụ: "Bún Riêu Chay (dishId=3)". 
         Nếu nhắc đến món không có trong danh sách, hãy nói rõ là không tìm thấy.
      3. Không cung cấp ID sai hoặc bịa đặt; chỉ dùng dishId có trong dữ liệu.

      **Dữ liệu cung cấp**:
      - Thông tin người dùng: ${JSON.stringify(userData)}
      - Thông tin món ăn: ${JSON.stringify(dishes)}
      ${
        foodData
          ? `- Thông tin món ăn chi tiết: ${JSON.stringify(foodData)}`
          : ""
      }

      **Tin nhắn của người dùng**: ${userMessage}
    `;

    // Gọi model
    const result = await model.generateContent(context);
    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Tôi gặp lỗi khi trả lời, bạn thử lại nhé.";
  }
};
