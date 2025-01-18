// toastStyles.js
import COLORS from "../constants/color";
import FONTS from "../constants/font";

export const toastStyles = {
  success: {
    style: { borderLeftColor: COLORS.green, marginTop: 30, height: 70 },
    contentContainerStyle: { paddingHorizontal: 15 },
    text1Style: {
      fontSize: 15,
      fontFamily: FONTS.semiBold,
      color: COLORS.black,
    },
    text2Style: {
      fontSize: 14,
      fontFamily: FONTS.medium,
      color: COLORS.grey,
    },
  },
  error: {
    text1Style: {
      fontSize: 17,
      fontFamily: FONTS.medium,
      color: COLORS.black,
    },
    text2Style: {
      fontSize: 15,
      fontFamily: FONTS.medium,
      color: COLORS.grey,
    },
  },
  style: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 30,
  },
};
