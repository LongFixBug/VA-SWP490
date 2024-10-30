import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Modal,
} from "react-native";
import React from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import RadioGroup from "react-native-radio-buttons-group";
import { moment } from "../utils";

import { ButtonFlex } from "../components/Button";
const InputProfileScreen = ({ navigation }) => {
  const [errorDoB, setErrorDoB] = React.useState('');
  const [error, setError] = React.useState('');

  const [selectedPreferencesId, setSelectedPreferencesId] = React.useState("1");
  const [selectedSexId, setSelectedSexId] = React.useState("1");
  const [address, setAddress] = React.useState("");
  const [dob, setDob] = React.useState('');

  const checkValidDob = () => {
    const dobPattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!dobPattern.test(dob)) {
      setErrorDoB('Ngày sinh không đúng định dạng!');
    } else {
      setErrorDoB('');
    }
  };
  const radioButtonsPreferences = React.useMemo(
    () => [
      {
        id: "1",
        label: "Thuần chay",
        value: "option1",
        color: COLORS.green, // Màu sắc của button
        size: 20, // Kích thước của button
        containerStyle: {
          minWidth: '42%',
        },
      },
      {
        id: "2",
        label: "Linh hoạt",
        value: "option2",
        color: COLORS.green, // Màu sắc của button
        size: 20, // Kích thước của button
        containerStyle: {
          minWidth: '42%',
        },
      },
      {
        id: "3",
        label: "Pescetarian",
        value: "option2",
        color: COLORS.green, // Màu sắc của button
        size: 20, // Kích thước của button
        containerStyle: {
          minWidth: '42%',
        },
      },
      {
        id: "4",
        label: "Lacto-ovo",
        value: "option2",
        color: COLORS.green, // Màu sắc của button
        size: 20, // Kích thước của button
        containerStyle: {
          minWidth: '42%',
        },
      },
      {
        id: "5",
        label: "Chay thô",
        value: "option2",
        color: COLORS.green, // Màu sắc của button
        size: 20, // Kích thước của button,
        containerStyle: {
          minWidth: '42%',
        },
      },
    ],
    []
  );
  const radioButtonsSex = React.useMemo(
    () => [
      {
        id: "1",
        label: "Nam",
        value: "option1",
        color: COLORS.green, // Màu sắc của button
        size: 20, // Kích thước của button
        containerStyle: {
          minWidth: '42%',
        },
      },
      {
        id: "2",
        label: "Nữ",
        value: "option2",
        color: COLORS.green, // Màu sắc của button
        size: 20, // Kích thước của button
        containerStyle: {
          minWidth: '42%',
        },
      },
      {
        id: "3",
        label: "Khác",
        value: "option2",
        color: COLORS.green, // Màu sắc của button
        size: 20, // Kích thước của button
        containerStyle: {
          minWidth: '42%',
        },
      }
    ],
    []
  );

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 30,
        }}
      >
        {/* <Image
        source={require("../assets/VEGETARIANSLOGO1.png")}
        resizeMode="contain"
        style={{ width: 120, height: 120, backgroundColor: COLORS.white }}
      /> */}
        <Text
          style={{
            fontSize: 25,
            color: COLORS.green,
            fontFamily: FONTS.bold,
            marginTop: 15,
          }}
        >
          NHẬP THÔNG TIN
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Sở thích ăn uống <Text style={{ color: COLORS.red }}>*</Text>
        </Text>
        <View
          style={[
            styles.inputRow,
            { marginTop: 15, borderBottomWidth: 0},
          ]}
        >
          <RadioGroup
            radioButtons={radioButtonsPreferences}
            onPress={setSelectedPreferencesId}
            selectedId={selectedPreferencesId}
            layout="column"
            labelStyle={{ fontFamily: FONTS.medium }}
            containerStyle={{
              flexDirection: "row", 
              flexWrap: "wrap", 
            }}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Địa chỉ <Text style={{ color: COLORS.red }}>*</Text>
        </Text>
        <View style={styles.inputRow}>
          <Icon name="location-sharp" size={20} color={COLORS.green} />
          <TextInput
            style={styles.textInput}
            placeholder="VD: 50 Lê Văn Việt, Hiệp Phú, Quận 9,..."
            placeholderTextColor={COLORS.lightGrey}
            onChangeText={setAddress}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ngày sinh <Text style={{ color: COLORS.red }}>*</Text></Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="dd/mm/yyyy"
            placeholderTextColor={COLORS.lightGrey}
            value={dob}
            onChangeText={setDob} 
            onEndEditing={checkValidDob} 
          />
        </View>
        {errorDoB ? <Text style={styles.errorDoBText}>{errorDoB}</Text> : null}

      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Giới tính <Text style={{ color: COLORS.red }}>*</Text>
        </Text>
        <View
          style={[
            styles.inputRow,
            { marginTop: 15, borderBottomWidth: 0},
          ]}
        >
          <RadioGroup
            radioButtons={radioButtonsSex}
            onPress={setSelectedSexId}
            selectedId={selectedSexId}
            layout="column" 
            labelStyle={{ fontFamily: FONTS.medium }}
            containerStyle={{
              flexDirection: "row",
              flexWrap: "wrap", 
            }}
          />
        </View>
        {error ? <Text style={styles.errorDoBText}>{error}</Text> : null}

      </View>
      <ButtonFlex
        title={"Bắt đầu!"}
        stylesButton={{
          paddingVertical: 15,
          elevation: 3,
          backgroundColor: COLORS.green,
          borderRadius: 10,
        }}
        stylesText={{ fontSize: 14 }}
        onPress={() => address && dob ? navigation.navigate("Home") : setError("Vui lòng nhập đầy đủ!")}
      />

    </ScrollView>
  );
};

export default InputProfileScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 30,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
  },
  textInput: {
    fontFamily: FONTS.medium,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flex: 1,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  orText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.grey,
    alignSelf: "center",
    marginVertical: 25,
  },
  errorDoBText: {
    color: COLORS.red,
    marginTop: 10,
    fontFamily: FONTS.semiBold
  },
});
