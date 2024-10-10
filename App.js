import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import Icon1 from "react-native-vector-icons/SimpleLineIcons";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
// import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import OrderScreen from "./screens/OrderScreen";
import CommunityScreen from "./screens/CommunityScreen";
import NotificationScreen from "./screens/NotificationScreen";
import ProfileScreen from "./screens/ProfileScreen";

import COLORS from "./constants/color";
import FONTS from "./constants/font";

const TabRoute = ({ userId }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarLabelStyle: {
          display: "none",
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: 60,
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20, 
        },
        
      })}
    >
      <Tab.Screen
        name="Trang chủ"
        component={HomeScreen}
        // initialParams={{ userId }}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return focused ? (
                <Icon name="home" color={color} size={size} />
            ) : (
              <Icon name="home-outline" color={color} size={25} />
            );
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Đơn hàng"
        component={OrderScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return focused ? (
              <View
                style={{
                  backgroundColor: COLORS.green,
                  borderRadius: 50,
                  padding: 20,
                  marginTop: -40,
                  shadowColor: COLORS.green,
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.25,
                  elevation: 4,
                }}
              >
                <Icon name="list" color="#fff" size={size} />
              </View>
            ) : (
              <Icon name="list-outline" color={color} size={28} />
            );
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Cộng đồng"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return focused ? (
              <View
                style={{
                  backgroundColor: COLORS.green,
                  borderRadius: 50,
                  padding: 20,
                  marginTop: -40,
                  shadowColor: COLORS.green,
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.25,
                  elevation: 4,
                }}
              >
                <Icon name="people" color="#fff" size={size} />
              </View>
            ) : (
              <Icon name="people-outline" color={color} size={28} />
            );
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Thông báo"
        component={NotificationScreen}
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return focused ? (
              <View
                style={{
                  position: 'relative', // Đặt vị trí tương đối để có thể dùng "absolute" cho badge
                  backgroundColor: COLORS.green,
                  borderRadius: 50,
                  padding: 20,
                  marginTop: -40,
                  shadowColor: COLORS.green,
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.25,
                  elevation: 4,
                }}
              >
                <Icon name="notifications" color="#fff" size={size} />
                {/* <View
              style={{
                position: 'absolute',
                top: 5, // Điều chỉnh vị trí của badge
                right: 5,
                backgroundColor: 'red', // Màu nền cho badge
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 12,
                  fontFamily: FONTS.semiBold, // Font badge
                }}
              >
                8
              </Text>
            </View>
             */}
              </View>
            ) : (
              <Icon name="notifications-outline" color={color} size={28} />
            );
          },
          tabBarBadge: 8,
          tabBarBadgeStyle: {
            fontFamily: FONTS.semiBold,
          },

          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Tài khoản"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return focused ? (
              <View
                style={{
                  backgroundColor: COLORS.green,
                  borderRadius: 50,
                  padding: 20,
                  marginTop: -40,
                  shadowColor: COLORS.green,
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.25,
                  elevation: 4,
                }}
              >
                <Icon name="person" color="#fff" size={size} />
              </View>
            ) : (
              <Icon name="person-outline" color={color} size={28} />
            );
          },
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "OpenSans-Bold": require("./assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-Medium": require("./assets/fonts/OpenSans-Medium.ttf"),
    "OpenSans-SemiBold": require("./assets/fonts/OpenSans-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }
  return (
  <GestureHandlerRootView style={{ flex: 1 }}>

    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={TabRoute} />

      </Stack.Navigator>

    </NavigationContainer>
  
  </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
