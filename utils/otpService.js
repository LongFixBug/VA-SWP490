import axios from "axios";

const INFOPBIP_BASE_URL = "https://8kxy61.api.infobip.com";
const API_KEY =
  "3ad782a4ff29b042ef5a8426fa1d5b16-b3fd27de-4454-496d-b3bc-1b2221ab8f8a";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const sendOTP = async (phoneNumber) => {
  const otp = generateOTP();
  try {
    const response = await axios.post(
      `${INFOPBIP_BASE_URL}/sms/2/text/advanced`,
      {
        messages: [
          {
            destinations: [
              {
                to: "84" + phoneNumber,
              },
            ],
            text: `Vegetarian Asistant! Ma xac minh so dien thoai cua ban la ${otp}`,
            from: "447491163443",
          },
        ],
      },
      {
        headers: {
          Authorization: `App ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      console.log("OTP sent successfully!");
      return otp;
    } else {
      console.error("Failed to send OTP:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return null;
  }
};
