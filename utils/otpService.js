import axios from "axios";

const INFOPBIP_BASE_URL = "https://8kxwk3.api.infobip.com";
const API_KEY =
  "ee236ebadeb4b05bef5173c3b4862c0d-06cc4a4c-3f3b-4c1f-8cbf-f42f13b33879";
//tri: 17a3ba35aea8822433dda1d06e6ea773-8b9cdcc8-f7fd-460e-83df-02b3a42c00ec          2mr2mz.api.infobip.com
//thien: fc2a2bb86a54cdeea1741abb971a8171-410a8e2a-601f-4e28-bf01-e08ce49b736e         m3wj36.api.infobip.com
//Minh:  ee236ebadeb4b05bef5173c3b4862c0d-06cc4a4c-3f3b-4c1f-8cbf-f42f13b33879        8kxwk3.api.infobip.com
//long: 3ad782a4ff29b042ef5a8426fa1d5b16-b3fd27de-4454-496d-b3bc-1b2221ab8f8a         https://8kxy61.api.infobip.com

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
