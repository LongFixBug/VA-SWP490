import axios from "axios";

const INFOPBIP_BASE_URL = "https://z34zmw.api.infobip.com";
const API_KEY =
  "7dee3cc6b8b83cfc8aae47ba87f4a399-7186db86-e9c0-4e65-840c-cfed9cf0e60c";

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
