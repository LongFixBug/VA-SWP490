import { StatusBar } from "react-native";
import { StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import InputOTPScreen from "./screens/InputOTPScreen";
import InputProfileScreen from "./screens/InputProfileScreen";
import HomeScreen from "./screens/HomeScreen";
import OrderScreen from "./screens/OrderScreen";
import CommunityScreen from "./screens/CommunityScreen";
import NotificationSettingScreen from "./screens/NotificationSettingScreen";
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
import WebViewScreen from "./screens/WebViewScreen";
import SettingScreen from "./screens/SettingScreen";
import NotificationScreen from "./screens/NotificationScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import COLORS from "./constants/color";
import FONTS from "./constants/font";
import ContactUsScreen from "./screens/ContactUsScreen";
import FollowerScreen from "./screens/FollowerScreen";
import messaging from "@react-native-firebase/messaging";
import RecommedDishScreen from "./screens/RecommendDishScreen";
import NutritionMatchingScreen from "./screens/NutritionMatchingScreen";
import NutritionArticleDetailScreen from "./screens/NutritionArticleDetailScreen";
import LoginWithPhone from "./screens/LoginWithPhone";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = createStackNavigator();
const OrderStack = createStackNavigator();
const CommunityStack = createStackNavigator();
const NotificationStack = createStackNavigator();
const ProfileStack = createStackNavigator();

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

LogBox.ignoreLogs([
  "Warning: TNodeChildrenRenderer: Support for defaultProps will be removed",
]);
LogBox.ignoreLogs([
  "Warning: bound renderChildren: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
]);

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen
      name="DishDetail"
      component={DishDetailScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="AllDishes"
      component={AllDishScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="Recommend"
      component={RecommedDishScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="RecommendDish"
      component={RecommedDishScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="NutritionMatching"
      component={NutritionMatchingScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="Menu"
      component={MenuScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="DetailMenu"
      component={DetailMenuScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="Cart"
      component={CartScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="Checkout"
      component={CheckoutScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="Favourite"
      component={FavouriteScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="Payment"
      component={PaymentScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="WebViewScreen"
      component={WebViewScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="Order"
      component={OrderScreen}
      options={{ unmountOnBlur: true }}
    />
  </HomeStack.Navigator>
);

const OrderStackScreen = () => (
  <OrderStack.Navigator screenOptions={{ headerShown: false }}>
    <OrderStack.Screen name="Order" component={OrderScreen} />
    <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <OrderStack.Screen name="WebViewScreen" component={WebViewScreen} />
  </OrderStack.Navigator>
);

const CommunityStackScreen = () => (
  <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
    <CommunityStack.Screen name="Community" component={CommunityScreen} />
    <CommunityStack.Screen name="NewPost" component={NewPostScreen} />
    <CommunityStack.Screen name="PostDetail" component={PostDetailScreen} />
  </CommunityStack.Navigator>
);

const NotificationStackScreen = () => (
  <NotificationStack.Navigator screenOptions={{ headerShown: false }}>
    <NotificationStack.Screen
      name="Notification"
      component={NotificationScreen}
    />
    <NotificationStack.Screen
      name="NotificationSetting"
      component={NotificationSettingScreen}
    />
  </NotificationStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Setting" component={SettingScreen} />
    <ProfileStack.Screen name="ContactUs" component={ContactUsScreen} />
    <ProfileStack.Screen name="Membership" component={MembershipScreen} />
  </ProfileStack.Navigator>
);

const TabRoute = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: COLORS.white,
      tabBarInactiveTintColor: COLORS.greySolid,
      tabBarLabelStyle: { display: "none" },
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
      component={HomeStackScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <View
            style={{
              backgroundColor: focused ? COLORS.green : COLORS.transparent,
              borderRadius: 50,
              padding: 15,
              marginTop: -10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={focused ? "home" : "home-outline"}
              color={focused ? COLORS.white : COLORS.greySolid}
              size={size}
            />
          </View>
        ),
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Đơn hàng"
      component={OrderStackScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <View
            style={{
              backgroundColor: focused ? COLORS.green : COLORS.transparent,
              borderRadius: 50,
              padding: 15,
              marginTop: -10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={focused ? "albums" : "albums-outline"}
              color={focused ? COLORS.white : COLORS.greySolid}
              size={size}
            />
          </View>
        ),
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Cộng đồng"
      component={CommunityStackScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <View
            style={{
              backgroundColor: focused ? COLORS.green : COLORS.transparent,
              borderRadius: 50,
              padding: 15,
              marginTop: -10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={focused ? "people" : "people-outline"}
              color={focused ? COLORS.white : COLORS.greySolid}
              size={size}
            />
          </View>
        ),
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Thông báo"
      component={NotificationStackScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <View
            style={{
              backgroundColor: focused ? COLORS.green : COLORS.transparent,
              borderRadius: 50,
              padding: 15,
              marginTop: -10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={focused ? "notifications" : "notifications-outline"}
              color={focused ? COLORS.white : COLORS.greySolid}
              size={size}
            />
          </View>
        ),
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Tài khoản"
      component={ProfileStackScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <View
            style={{
              backgroundColor: focused ? COLORS.green : COLORS.transparent,
              borderRadius: 50,
              padding: 20,
              marginTop: -10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={focused ? "person" : "person-outline"}
              color={focused ? COLORS.white : COLORS.greySolid}
              size={size}
            />
          </View>
        ),
        headerShown: false,
      }}
    />
  </Tab.Navigator>
);

const requestPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Quyền thông báo đã được cấp!");
    getToken();
  } else {
    console.log("Quyền thông báo bị từ chối.");
  }
};

const getToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log("FCM Token:", token);
    await AsyncStorage.setItem("deviceToken", token);
  } catch (error) {
    console.error("Lỗi khi lấy FCM Token:", error);
  }
};

const showToastNotification = (remoteMessage) => {
  if (remoteMessage.notification) {
    Toast.show({
      type: "success",
      text1: remoteMessage.notification.title,
      text2: remoteMessage.notification.body,
    });
  }
};

export default function App() {
  const [fontsLoaded] = useFonts({
    "OpenSans-Bold": require("./assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-SemiBold": require("./assets/fonts/OpenSans-SemiBold.ttf"),
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
  });
  const [initialRoute, setInitialRoute] = useState(null);
  const navigationRef = React.useRef(null); // Create navigation ref

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId");

        if (!token || !userId) {
          setInitialRoute("Login");
          return;
        }

        const response = await fetch("YOUR_API_URL", {
          // Replace with your validation API endpoint
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          Toast.show({
            type: "error",
            text1: "Phiên đăng nhập đã hết hạn",
            text2: "Vui lòng đăng nhập lại.",
          });
          setInitialRoute("Login");
        } else {
          // Navigate to Main (TabRoute) after successful login
          setInitialRoute("Main");
        }
      } catch (error) {
        setInitialRoute("Login");
      }
    };

    const initMessaging = async () => {
      await requestPermission();

      const unsubscribeForeground = messaging().onMessage(
        async (remoteMessage) => {
          console.log("Tin nhắn foreground:", remoteMessage);
          showToastNotification(remoteMessage);
        }
      );

      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log("Tin nhắn background:", remoteMessage);
      });

      return unsubscribeForeground;
    };

    checkLoginStatus();
    initMessaging();

    return () => {
      messaging().onMessage(() => {});
    };
  }, []);

  if (!fontsLoaded || initialRoute === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={initialRoute}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="InputOTP" component={InputOTPScreen} />
          <Stack.Screen name="Home" component={TabRoute} />
          <Stack.Screen name="Main" component={TabRoute} />
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
          <Stack.Screen name="Recommend" component={RecommedDishScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="DetailMenu" component={DetailMenuScreen} />
          <Stack.Screen name="Membership" component={MembershipScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Setting" component={SettingScreen} />
          <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen name="Nutrition" component={NutritionMatchingScreen} />
          <Stack.Screen name="LoginWithPhone" component={LoginWithPhone} />
          <Stack.Screen
            name="UserProfileScreen"
            component={UserProfileScreen}
          />
          <Stack.Screen
            name="NutritionArticle"
            component={NutritionArticleDetailScreen}
          />
          <Stack.Screen
            name="NotificationSetting"
            component={NotificationSettingScreen}
          />
          <Stack.Screen name="Follow" component={FollowerScreen} />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ title: "Thanh Toán" }}
          />
          <Stack.Screen
            name="WebViewScreen"
            component={WebViewScreen}
            options={{ title: "Thanh Toán QR" }}
          />
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
