import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import AuthContext from "../context/AuthContext";

import { ButtonFlex } from "../components/Button";

const SettingScreen = ({ navigation }) => {
  // const { signOut } = React.useContext(AuthContext);
  const [modalConfirmSignOut, setModalConfirmSignOut] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState(false);

  //Effect
  React.useEffect(() => {
    if (!modalConfirmSignOut && pendingNavigation) {
      if (pendingNavigation === "SignOut") signOut();
      setPendingNavigation(false);
    }
  }, [modalConfirmSignOut, pendingNavigation, navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Xóa toàn bộ dữ liệu lưu trữ
      Alert.alert("Đăng xuất thành công", "Bạn đã được đăng xuất.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }], // Điều hướng đến màn hình Login
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <Header
        title={"Cài đặt"}
        leftIcon={"arrow-back-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.settingContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name="person-circle-outline"
                size={24}
                color={COLORS.green}
              />
              <Text style={styles.settingText}>Cập nhật thông tin</Text>
            </View>
            <Icon
              name="chevron-forward-outline"
              size={24}
              color={COLORS.grey}
            />
          </TouchableOpacity>

          {/* Thêm tùy chọn Ví */}
          {/* <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
            onPress={() => navigation.navigate("WalletScreen")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="wallet-outline" size={24} color={COLORS.green} />
              <Text style={styles.settingText}>Ví của bạn</Text>
            </View>
            <Icon
              name="chevron-forward-outline"
              size={24}
              color={COLORS.grey}
            />
          </TouchableOpacity> */}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
            onPress={() => navigation.navigate("NotificationSetting")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name="notifications-off-outline"
                size={24}
                color={COLORS.green}
              />
              <Text style={styles.settingText}>Cài đặt thông báo</Text>
            </View>
            <Icon
              name="chevron-forward-outline"
              size={24}
              color={COLORS.grey}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
            onPress={() => navigation.navigate("Nutrition")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="file-tray-outline" size={24} color={COLORS.green} />
              <Text style={styles.settingText}>Dinh dưỡng đề xuất</Text>
            </View>
            <Icon
              name="chevron-forward-outline"
              size={24}
              color={COLORS.grey}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
            onPress={() => navigation.navigate("ContactUs")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="headset" size={24} color={COLORS.green} />
              <Text style={styles.settingText}>Liên hệ với chúng tôi</Text>
            </View>
            <Icon
              name="chevron-forward-outline"
              size={24}
              color={COLORS.grey}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center" }}>
          <ButtonFlex
            title={"Đăng xuất"}
            stylesButton={{
              paddingVertical: 15,
              paddingHorizontal: 25,
              elevation: 3,
              backgroundColor: COLORS.red,
              borderRadius: 8,
            }}
            stylesText={{ fontSize: 15 }}
            onPress={() => setModalConfirmSignOut(true)}
          />
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalConfirmSignOut}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.centeredView}
          activeOpacity={1}
          onPress={() => setModalConfirmSignOut(false)}
        >
          <View style={styles.modalView}>
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: 16,
                color: COLORS.black,
                marginBottom: 20,
              }}
            >
              Bạn có chắc đăng xuất?
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <ButtonFlex
                title={"Hủy"}
                stylesButton={{
                  paddingVertical: 10,
                  elevation: 3,
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.green,
                  borderRadius: 8,
                  marginRight: 15,
                  flex: 1,
                }}
                stylesText={{ fontSize: 16, color: COLORS.green }}
                onPress={() => {
                  setModalConfirmSignOut(false);
                }}
              />
              <ButtonFlex
                title={"Đăng xuất"}
                stylesButton={{
                  paddingVertical: 10,
                  elevation: 3,
                  backgroundColor: COLORS.red,
                  borderRadius: 8,
                  flex: 1,
                }}
                stylesText={{ fontSize: 16, color: COLORS.white }}
                onPress={() => {
                  setModalConfirmSignOut(false);
                  handleLogout(); // Gọi hàm đăng xuất từ logic code 2
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  settingContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  settingAttributeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  settingText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    marginLeft: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalView: {
    maxWidth: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 21,
  },
});
