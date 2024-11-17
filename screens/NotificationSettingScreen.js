import { StyleSheet, View, Text, TouchableOpacity, Switch } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";

const NotificationSettingScreen = ({ navigation, route }) => {
  const [isPostNotificationEnabled, setIsPostNotificationEnabled] =
    React.useState(false);
  const [
    isOrderStatusNotificationEnabled,
    setIsOrderStatusNotificationEnabled,
  ] = React.useState(false);
  const [isPromotionNotificationEnabled, setIsPromotionNotificationEnabled] =
    React.useState(false);
  const [isFollowerNotificationEnabled, setIsFollowerNotificationEnabled] =
    React.useState(false);

  return (
    <>
      <Header
        title={"Cài đặt thông báo"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"notifications-outline"}
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
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Icon
                name="file-tray-full-outline"
                size={24}
                color={COLORS.greySolid}
              />
              <Text style={styles.settingText}>Thông báo về bài viết mới</Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.grey, true: COLORS.green }}
              thumbColor={isPostNotificationEnabled ? COLORS.white : "#f4f3f4"}
              onValueChange={() =>
                setIsPostNotificationEnabled((prev) => !prev)
              }
              value={isPostNotificationEnabled}
              style={styles.iconRight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
            onPress={() => navigation.navigate("NotificationSetting")}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Icon name="receipt-outline" size={24} color={COLORS.greySolid} />
              <Text style={styles.settingText}>
                Thông báo về trạng thái đơn hàng
              </Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.grey, true: COLORS.green }}
              thumbColor={
                isOrderStatusNotificationEnabled ? COLORS.white : "#f4f3f4"
              }
              onValueChange={() =>
                setIsOrderStatusNotificationEnabled((prev) => !prev)
              }
              value={isOrderStatusNotificationEnabled}
              style={styles.iconRight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Icon name="gift-outline" size={24} color={COLORS.greySolid} />
              <Text style={styles.settingText}>
                Thông báo về các chương trình khuyến mãi
              </Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.grey, true: COLORS.green }}
              thumbColor={
                isPromotionNotificationEnabled ? COLORS.white : "#f4f3f4"
              }
              onValueChange={() =>
                setIsPromotionNotificationEnabled((prev) => !prev)
              }
              value={isPromotionNotificationEnabled}
              style={styles.iconRight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingAttributeRow}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Icon
                name="person-add-outline"
                size={24}
                color={COLORS.greySolid}
              />
              <Text style={styles.settingText}>
                Thông báo về người theo dõi
              </Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.grey, true: COLORS.green }}
              thumbColor={
                isFollowerNotificationEnabled ? COLORS.white : "#f4f3f4"
              }
              onValueChange={() =>
                setIsFollowerNotificationEnabled((prev) => !prev)
              }
              value={isFollowerNotificationEnabled}
              style={styles.iconRight}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default NotificationSettingScreen;

const styles = StyleSheet.create({
  settingContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingRight: 15,
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
    marginLeft: 15,
    flexShrink: 1,
  },
  iconRight: {
    marginLeft: 20,
  },
});
