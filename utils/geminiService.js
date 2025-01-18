// geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAgus8QE7iz4VQrA1ds-gUjQdty3016BEQ"; // API Key thật
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Hàm generateNutritionAdvice – phân tích dinh dưỡng cho người dùng
export const generateNutritionAdvice = async (userData, dishes) => {
  try {
    const { nutrition, ...userInformation } = userData;
    const prompt = `
      Bạn là một chuyên gia dinh dưỡng của hệ thống VA, có nhiều năm kinh nghiệm, chuyên sâu về dinh dưỡng cá nhân hóa và tối ưu hóa sức khỏe cho người ăn chay.
      Hãy phân tích dữ liệu người dùng và món ăn sau, rồi đưa ra lời khuyên chi tiết.
      Trả lời dưới dạng text, rõ ràng và có giải thích.

      **Hướng dẫn**:
      1. Tính và giải thích BMI của người dùng (nếu có dữ liệu chiều cao, cân nặng).
      2. Phân tích dữ liệu cá nhân (tuổi, giới tính, mục tiêu...).
      3. Phân tích dữ liệu dinh dưỡng (calories, fat, carbs, protein...).
      4. Đưa ra lời khuyên dinh dưỡng chi tiết, gợi ý món ăn chay phù hợp.
      5. Lập lịch tập luyện (theo ngày, theo tuần).
      6. Nêu rõ rủi ro nếu không điều chỉnh & lợi ích nếu tuân thủ.

      _Dữ liệu dinh dưỡng người dùng: ${JSON.stringify(nutrition)}
      _Thông tin người dùng: ${JSON.stringify(userInformation)}
      _Thông tin món ăn: ${JSON.stringify(dishes)}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate nutrition advice.");
  }
};

// Hàm generateChatResponse – xử lý chat chung (hỏi về món ăn, nguyên liệu, menu...)
export const generateChatResponse = async (
  userMessage,
  userData,
  dishes,
  foodData,
  forbiddenKeywords = []
) => {
  try {
    // Viết một prompt *rõ ràng* cho trường hợp có nhiều món (dishes)
    // => Bot phải liệt kê toàn bộ, kèm dinh dưỡng, ID, v.v.
    let context = `
      Bạn là một chuyên gia dinh dưỡng của hệ thống VA, chuyên sâu về dinh dưỡng ăn chay và cá nhân hóa sức khỏe.
      Hãy trả lời dưới dạng text, ngôn ngữ tự nhiên và dễ hiểu.

      **Yêu cầu chung**:
      1. Ưu tiên món ăn chay, không nhắc đến thịt/cá/...; 
         Nếu gặp từ khóa cấm: "${forbiddenKeywords.join(", ")}",
         hãy từ chối hoặc đề xuất thay thế thuần chay.
      2. Khi nhắc đến một **món ăn** nằm trong danh sách "dishes",
         bạn **phải** viết đúng cú pháp: "Tên Món (dishId=xxx)".
         Nếu nhắc đến món **không** có trong danh sách, hãy nói rõ "không tìm thấy".
      3. Không bịa đặt ID món (dishId). Chỉ dùng dishId có sẵn trong dữ liệu.

      **Khi dữ liệu "dishes" có nhiều món**:
      - Hãy liệt kê **đầy đủ tất cả** các món, không được tự ý ẩn bớt.
      - Với mỗi món, ghi Tên Món (dishId=xxx), calories, carbs, fat, protein, fiber,
        và các thông tin dinh dưỡng khác nếu có. 
      - Nếu có "recipe" hoặc "description", tóm tắt ngắn gọn (1-2 câu).
        Nếu user muốn xem chi tiết, sẽ hiển thị đầy đủ sau.

      **Dữ liệu hiện có**:
      - Thông tin người dùng: ${JSON.stringify(userData)}
      - Thông tin món ăn (dishes): ${JSON.stringify(dishes)}
      ${
        foodData
          ? `- Thông tin nguyên liệu chi tiết (foodData): ${JSON.stringify(
              foodData
            )}`
          : ""
      }

      **Tin nhắn của người dùng**: "${userMessage}"

      # Nhiệm vụ của bạn:
      1) Đọc kỹ tin nhắn người dùng, xác định yêu cầu (ví dụ: hỏi món gì, muốn menu bữa sáng, v.v.).
      2) Dựa vào mảng "dishes" ở trên để trả lời. 
         - Nếu user hỏi "menu sáng" (hay "menu trưa", "menu tối"), hãy liệt kê đầy đủ các món có trong dishes.
         - Trình bày mỗi món theo cấu trúc:
             Tên Món (dishId=xxx)
             calories: ...
             carbs: ...
             fat: ...
             protein: ...
             fiber: ...
             ... (các chất dinh dưỡng quan trọng khác)
         - Nêu tóm tắt mô tả / recipe (nếu có) dưới 1-2 câu. 
      3) Nếu user hỏi về nguyên liệu (foodData), bạn có thể thêm chi tiết khi cần.
      4) Tuyệt đối tuân theo cú pháp "Tên Món (dishId=xxx)" khi đề cập món.

      **Lưu ý**: Không rút gọn hoặc bỏ bớt bất kỳ món nào khỏi danh sách "dishes". Cần hiển thị đầy đủ.

      Hãy bắt đầu.
    `;

    // Gọi model với prompt context
    const result = await model.generateContent(context);
    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Tôi gặp lỗi khi trả lời, bạn thử lại nhé.";
  }
};
