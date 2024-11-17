import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createAxios from "../utils/axios";
const API = createAxios();
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loginError, setLoginError] = useState();

  const checkUserSession = async () => {
    setInitializing(true);
    try {
      const savedUserData = await AsyncStorage.getItem("UserLoggedInData");
      if (savedUserData) {
        const parsedData = JSON.parse(savedUserData);
        setUser(parsedData.user);
      }
    } catch (error) {
      console.log("Error loading User data:", error);
    } finally {
      setInitializing(false);
    }
  };

  React.useEffect(() => {
    checkUserSession();
  }, []);

  const loginSystem = async (phoneNumber, password) => {
    setInitializing(true);
    try {
      const response = await API.post("/customers/login", {
        phoneNumber: phoneNumber,
        password: password,
      });
      if (response) {
        console.log("Login state: ", response.user);
        await AsyncStorage.setItem(
          "UserLoggedInData",
          JSON.stringify(response)
        );
        setUser(response.user);
      }
    } catch (error) {
      console.log("Error login: ", error);
      setLoginError("Đăng nhập thất bại.");
    } finally {
      setInitializing(true);
      setTimeout(() => {
        setInitializing(false);
      }, 1000);
    }
  };

  const signOut = async () => {
    setInitializing(true);
    setUser(null);
    setLoginError();
    await AsyncStorage.removeItem("UserLoggedInData");
    console.log("Đã đăng xuất!");
    setInitializing(false);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        loginError,
        loginSystem,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
