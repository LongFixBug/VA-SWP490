import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, Animated } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FONTS from "../constants/font";

const NotificationModal = ({
  isVisible,
  onClose,
  title,
  timeClose,
  icon,
  subTitle,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(onClose);
        }, timeClose || 500);
      });
    }
  }, [isVisible]);

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.notification, { opacity: fadeAnim }]}>
          <Icon name={icon || "checkmark-circle"} size={40} color="#fff" />
          <Text style={styles.text}>{title}</Text>
          {subTitle && <Text style={styles.text}>{subTitle}</Text>}
        </Animated.View>
      </View>
    </Modal>
  );
};
//sdsd
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(0, 0, 0, 0.3)",
    backgroundColor: "transparent",
  },
  notification: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 15,
    borderRadius: 10,
    maxWidth: "90%",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginTop: 5,
    fontFamily: FONTS.medium,
    textAlign: "center",
  },
});

export default NotificationModal;
