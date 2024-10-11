import {
    StyleSheet,
    Text,
    View,
    Button,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
  } from "react-native";import React from 'react'
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import { ButtonFlex } from "../components/Button";

const RegisterScreen = ({navigation}) => {
  return (
    <View style={styles.formContainer}>
        <View style={{alignItems: 'center', justifyContent: 'center', marginBottom: 30}}>
          <Image
            source={require("../assets/VEGETARIANSLOGO1.png")}
            resizeMode="contain"
            style={{ width: 100, height: 100, backgroundColor: COLORS.white }}
          />
          <Text style={{  fontSize: 25,  color: COLORS.green, fontFamily: FONTS.bold, marginTop: 15,}}>
            ĐĂNG KÝ
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Email hoặc số điện thoại <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <Icon name="person" size={18} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập email hoặc số điện thoại"
            />
          </View>
        </View>
        <ButtonFlex
          title={"Xác minh số điện thoại"}
          stylesButton={{
            paddingVertical: 15,
            elevation: 3,
            backgroundColor: COLORS.green,
          }}
          stylesText={{ fontSize: 14 }}
          onPress={() => navigation.navigate("Splash")}
        />
        <View style={styles.registerContainer}>
          <Text style={{ fontFamily: FONTS.medium }}>Quay lại đăng nhập? </Text>
          <TouchableOpacity activeOpacity={0.5} onPress={()=>navigation.navigate("Login")}>
            <Text style={{ color: COLORS.green, fontFamily: FONTS.bold }}>
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </View>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        flex: 1,
      }, 
      formContainer: {
        backgroundColor: COLORS.white,
        padding: 30,
        flex: 1,
        justifyContent: 'center'
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
      googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        padding: 10,
        width: "100%",
        backgroundColor: COLORS.greyPastel,
        elevation: 3,
        borderRadius: 10,
      },
      googleLogo: {
        height: 30,
        width: 30,
        borderRadius: 50,
        marginRight: 10,
      },
})