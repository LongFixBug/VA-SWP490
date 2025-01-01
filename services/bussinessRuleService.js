// services/businessRuleService.js

/**
 * Hàm lấy các quy tắc kinh doanh từ Google Sheets
 * @returns {Promise<Array<{ Question: string, Answer: string }>>}
 */
// services/businessRuleService.js
export const getBusinessRules = async () => {
  const SHEET_ID = "1TIb8iscXE6v0aA5mEpZmntQAk0RcU8vlxG4eSCd3phI"; // Sheet ID
  const GOOGLE_SHEETS_API_KEY = "AIzaSyCps8UvPyxNase3MjaC746hdjKbQxTRhXg."; // API key
  const RANGE = "Sheet1!A:B"; // Chứa 2 cột: Question, Answer

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`
    );
    const data = await response.json();
    // Kiểm tra lỗi
    if (data.error) {
      throw new Error(data.error.message);
    }

    // [header, ...rows]
    const [header, ...rows] = data.values;
    // giả sử header = ["Question", "Answer"]
    const rules = rows.map((row) => {
      const rule = {};
      header.forEach((key, index) => {
        rule[key] = row[index];
      });
      return rule;
    });

    return rules; // [{ Question: "...", Answer: "..." }, ...]
  } catch (error) {
    console.error("Error fetching business rules:", error);
    throw new Error("Không thể truy xuất dữ liệu từ Google Sheets.");
  }
};
