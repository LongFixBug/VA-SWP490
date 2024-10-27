import {
  StyleSheet,
  View,
  Image,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
  TextInput,
  Button,
  ScrollView,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";

const DetailMenuScreen = ({ navigation }) => {
  return (
    <>
      <Header
        title={"Menu 1"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"heart-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <Text>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book.aaaaa
        </Text>
      </ScrollView>
    </>
  );
};

export default DetailMenuScreen;

const styles = StyleSheet.create({});
