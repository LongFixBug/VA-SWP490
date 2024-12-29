import AsyncStorage from "@react-native-async-storage/async-storage";

const getDataProfile = async () => {
  try {
    const UserLoggedInData = await AsyncStorage.getItem("UserLoggedInData");

    if (UserLoggedInData) {
      let udata = JSON.parse(UserLoggedInData);
      return udata;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
  return null;
};

export { getDataProfile };
