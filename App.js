import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import Icon1 from "react-native-vector-icons/SimpleLineIcons";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import InputOTPScreen from "./screens/InputOTPScreen";
import InputProfileScreen from "./screens/InputProfileScreen";

import HomeScreen from "./screens/HomeScreen";
import OrderScreen from "./screens/OrderScreen";
import CommunityScreen from "./screens/CommunityScreen";
import NotificationScreen from "./screens/NotificationScreen";
import ProfileScreen from "./screens/ProfileScreen";
import OrderDetailScreen from "./screens/OrderDetailScreen";
import AllDishScreen from "./screens/AllDishScreen";
import SuggestedDishesScreen from "./screens/SuggestedDishesScreen";
import DishDetailScreen from "./screens/DishDetailScreen";
import NewPostScreen from "./screens/NewPostScreen";
import PostDetailScreen from "./screens/PostDetailScreen";
import SearchDishesScreen from "./screens/SearchDishes";
import CartScreen from "./screens/CartScreen";
import FavouriteScreen from "./screens/FavouriteScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import PaymentScreen from "./screens/PaymentScreen";
import MenuScreen from "./screens/MenuScreen";
import MembershipScreen from "./screens/MembershipScreen";
import DetailMenuScreen from "./screens/DetailMenuScreen";
import EditProfileScreen from "./screens/EditProfileScreen";

import COLORS from "./constants/color";
import FONTS from "./constants/font";


const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: COLORS.green, marginTop: 30, height: 70 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontFamily: FONTS.semiBold,
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: FONTS.medium,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17,
        fontFamily: FONTS.medium,
      }}
      text2Style={{
        fontSize: 15,
        fontFamily: FONTS.medium,
      }}
    />
  ),
  tomatoToast: ({ text1, props }) => (
    <View style={{ height: 60, width: "100%", backgroundColor: "tomato" }}>
      <Text>{text1}</Text>
      <Text>{props.uuid}</Text>
    </View>
  ),
};

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
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return focused ? (
              <View
                style={{
                  backgroundColor: COLORS.white,
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
                <Icon name="home" color={COLORS.green} size={size} />
              </View>
            ) : (
              <Icon name="home-outline" color={color} size={28} />
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
                  backgroundColor: COLORS.white,
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
                <Icon name="list" color={COLORS.green} size={size} />
              </View>
            ) : (
              <Icon name="list-outline" color={color} size={28} />
            );
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Đăng tin"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return focused ? (
              <View
                style={{
                  backgroundColor: COLORS.white,
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
                <Icon name="people" color={color} size={size} />
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
                  backgroundColor: COLORS.white,
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
                <Icon name="notifications" color={COLORS.green} size={size} />
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
                  backgroundColor: COLORS.white,
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
                <Icon name="person" color={COLORS.green} size={size} />
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
  const [fontsLoaded] = useFonts({
    "OpenSans-Bold": require("./assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-SemiBold": require("./assets/fonts/OpenSans-SemiBold.ttf"),
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),

    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
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
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="InputOTP" component={InputOTPScreen} />

          <Stack.Screen name="Home" component={TabRoute} />
          <Stack.Screen name="Order" component={OrderScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
          <Stack.Screen
            name="SuggestedDishes"
            component={SuggestedDishesScreen}
          />
          <Stack.Screen name="InputProfile" component={InputProfileScreen} />
          <Stack.Screen name="DishDetail" component={DishDetailScreen} />
          <Stack.Screen name="NewPostScreen" component={NewPostScreen} />
          <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
          <Stack.Screen name="SearchDishes" component={SearchDishesScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Favourite" component={FavouriteScreen} />
          <Stack.Screen name="AllDishes" component={AllDishScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="DetailMenu" component={DetailMenuScreen} />
          <Stack.Screen name="Membership" component={MembershipScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
