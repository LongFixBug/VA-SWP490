// geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { API_KEY } from "@env";

const API_KEY = "AIzaSyBuFfk8AUs2StFOD5ZqLZsgSWifjirmnP0"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(API_KEY);
console.log("genAI:", genAI);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }); // Using gemini-2.0-flash-exp

const generateNutritionAdvice = async (userData) => {
  try {
    const { nutrition, ...userInformation } = userData;
    const prompt = `
        Tôi là một chuyên gia dinh dưỡng với nhiều năm kinh nghiệm, chuyên sâu về dinh dưỡng cá nhân hóa và tối ưu hóa sức khỏe.
        Tôi sẽ phân tích một cách toàn diện về thể trạng của bạn, dựa trên thông tin bạn cung cấp.

      **Hướng dẫn:** Hãy cung cấp một phân tích chi tiết theo các bước sau:
      
      1.  **Đánh giá BMI:**
        *   Tính toán chỉ số BMI của người dùng.
        *   Phân loại mức độ cân nặng dựa trên BMI (ví dụ: gầy, bình thường, thừa cân, béo phì).
        *   Giải thích ý nghĩa của chỉ số BMI đối với sức khỏe tổng thể của người dùng.

      2.  **Phân tích Dữ Liệu Cá Nhân:**
        *   Phân tích tuổi, giới tính, mức độ hoạt động và mục tiêu sức khỏe của người dùng (ví dụ: tăng cân, giảm cân, duy trì cân nặng).
        *   Đánh giá nhu cầu dinh dưỡng cụ thể của người dùng dựa trên những yếu tố này.

      3.  **Phân tích Dữ Liệu Dinh Dưỡng:**
        *   Xem xét kỹ lưỡng các chỉ số dinh dưỡng hiện tại, bao gồm calo, chất béo, carbohydrate, protein và đường.
        *   Xác định sự phù hợp của chế độ ăn hiện tại so với mục tiêu và nhu cầu của người dùng.

      4.  **Đưa ra Lời Khuyên Dinh Dưỡng Chi Tiết:**
          *   Đề xuất lượng calo cần thiết hàng ngày để đạt mục tiêu sức khỏe (tăng, giảm hoặc duy trì cân nặng).
           *   Đề xuất tỉ lệ các chất dinh dưỡng (protein, carbohydrate và chất béo) tối ưu cho người dùng.
        *   Gợi ý các loại thực phẩm nên ăn để cung cấp đủ dinh dưỡng và hỗ trợ mục tiêu.
        *   Gợi ý các loại thực phẩm nên hạn chế để tránh các vấn đề sức khoẻ.
          *   Đưa ra các điều chỉnh cụ thể trong chế độ ăn uống để phù hợp với nhu cầu và mục tiêu của người dùng.

      5.  **Nhấn Mạnh Rủi Ro và Lợi Ích:**
        *   Nêu rõ những vấn đề sức khỏe tiềm ẩn có thể xảy ra nếu chế độ ăn uống hiện tại không được điều chỉnh.
          *   Nêu những lợi ích về sức khỏe và thể trạng khi áp dụng theo lời khuyên.
          *   Nhấn mạnh tầm quan trọng của việc duy trì một chế độ ăn uống lành mạnh và cân đối.

       **Thông tin người dùng:** ${JSON.stringify(userInformation)}
        **Dữ liệu dinh dưỡng:** ${JSON.stringify(nutrition)}
      
        Hãy trình bày kết quả phân tích một cách rõ ràng, mạch lạc, và đầy đủ.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate nutrition advice.");
  }
};

const generateChatResponse = async (userMessage) => {
  try {
    const result = await model.generateContent(userMessage);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Tôi gặp lỗi khi trả lời, bạn thử lại nhé.";
  }
};

export { generateNutritionAdvice, generateChatResponse };
