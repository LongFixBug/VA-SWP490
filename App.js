// App.js

import React, { useEffect, useState, useContext } from "react";
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

// Import các màn hình khác
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
import ContactUsScreen from "./screens/ContactUsScreen";
import FollowerScreen from "./screens/FollowerScreen";
import RecommedDishScreen from "./screens/RecommendDishScreen";
import NutritionMatchingScreen from "./screens/NutritionMatchingScreen";
import NutritionArticleDetailScreen from "./screens/NutritionArticleDetailScreen";
import LoginWithPhone from "./screens/LoginWithPhone";
import OTPScreen from "./screens/OTPScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import WalletScreen from "./screens/WalletScreen";
import WebViewsScreen from "./screens/WebViewsScreen";
import CombineScreen from "./screens/CombineScreen";

import COLORS from "./constants/color";
import FONTS from "./constants/font";

import {
  NotificationProvider,
  NotificationContext,
} from "./context/NotificationContext"; // Import NotificationProvider và Context
import { Provider as PaperProvider } from "react-native-paper";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = createStackNavigator();
const OrderStack = createStackNavigator();
const CommunityStack = createStackNavigator();
const NotificationStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Custom Toast Config
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

// Các Stack Navigator cụ thể
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
    <HomeStack.Screen
      name="CombineScreen"
      component={CombineScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="WalletScreen"
      component={WalletScreen}
      options={{ unmountOnBlur: true }}
    />
    <HomeStack.Screen
      name="WebViewsScreen"
      component={WebViewsScreen}
      options={{ unmountOnBlur: true }}
    />
  </HomeStack.Navigator>
);

// Tương tự cho các Stack khác...

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
    <CommunityStack.Screen
      name="UserProfileScreen"
      component={UserProfileScreen}
    />
    <CommunityStack.Screen name="Profile" component={ProfileScreen} />
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
    <ProfileStack.Screen name="WalletScreen" component={WalletScreen} />
    <ProfileStack.Screen name="WebViewsScreen" component={WebViewsScreen} />
    {/* <ProfileStack.Screen name="ChatScreen" component={ChatScreen} /> */}
  </ProfileStack.Navigator>
);

// Component Custom Tab Bar
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { unreadCount } = useContext(NotificationContext); // Sử dụng context

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Animation for icon
          const scale = useSharedValue(1);

          useEffect(() => {
            if (isFocused) {
              scale.value = withSpring(1.2);
            } else {
              scale.value = withSpring(1);
            }
          }, [isFocused]);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
          }));

          // Xác định tên icon dựa trên route
          const iconName = () => {
            switch (route.name) {
              case "Trang chủ":
                return isFocused ? "home" : "home-outline";
              case "Đơn hàng":
                return isFocused ? "albums" : "albums-outline";
              case "Cộng đồng":
                return isFocused ? "people" : "people-outline";
              case "Thông báo":
                return isFocused ? "notifications" : "notifications-outline";
              case "Tài khoản":
                return isFocused ? "person" : "person-outline";
              default:
                return "circle";
            }
          };

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              key={index}
            >
              <Animated.View style={[animatedStyle, styles.iconContainer]}>
                <Icon
                  name={iconName()}
                  size={24}
                  color={isFocused ? COLORS.green : COLORS.greySolid}
                />
                {route.name === "Thông báo" && unreadCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? COLORS.green : COLORS.greySolid },
                  ]}
                >
                  {label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Cấu hình Tab Navigator sử dụng Custom Tab Bar
const TabRoute = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
    }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Trang chủ" component={HomeStackScreen} />
    <Tab.Screen name="Đơn hàng" component={OrderStackScreen} />
    <Tab.Screen name="Cộng đồng" component={CommunityStackScreen} />
    <Tab.Screen name="Thông báo" component={NotificationStackScreen} />
    <Tab.Screen name="Tài khoản" component={ProfileStackScreen} />
  </Tab.Navigator>
);

const AppContent = () => {
  const [fontsLoaded] = useFonts({
    "OpenSans-Bold": require("./assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-SemiBold": require("./assets/fonts/OpenSans-SemiBold.ttf"),
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
  });
  const [initialRoute, setInitialRoute] = useState(null);
  const navigationRef = React.useRef(null); // Create navigation ref

  const { unreadCount, notifications, markAllAsRead } =
    useContext(NotificationContext); // Sử dụng context

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId");

        if (!token || !userId) {
          setInitialRoute("Login");
          return;
        }

        // Vì không có API, ta sẽ giả định token hợp lệ
        setInitialRoute("Main");
      } catch (error) {
        console.error("Lỗi khi xác thực token:", error);
        setInitialRoute("Login");
      }
    };

    checkLoginStatus();
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
          {/* Các màn hình khác */}
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
          <Stack.Screen name="OTPScreen" component={OTPScreen} />
          <Stack.Screen
            name="ForgotPasswordScreen"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="WalletScreen" component={WalletScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <NotificationProvider>
      <PaperProvider>
        <AppContent />
      </PaperProvider>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  // ... Các styles hiện tại không thay đổi
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingBottom: 60, // Thêm padding để tránh bị che bởi Bottom Tab Bar
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },
  markAllReadContainer: {
    paddingHorizontal: 10,
    marginTop: 5,
    alignItems: "flex-end",
  },
  markAllReadButton: {
    backgroundColor: COLORS.lightGreen,
    padding: 10,
    borderRadius: 10,
  },
  markAllReadText: {
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  unreadNotification: {},
  iconContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  contentStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentText: {
    fontFamily: FONTS.medium,
    width: "75%",
    marginTop: 5,
    color: COLORS.grey,
  },
  sentDateText: {
    fontFamily: FONTS.medium,
    marginTop: 5,
    color: COLORS.grey,
    fontSize: 12,
    textAlign: "right",
  },
  statusText: {
    fontFamily: FONTS.medium,
    marginTop: 5,
    color: COLORS.grey,
  },
  bottomSheetContainer: {
    width: "100%",
    height: "auto",
    backgroundColor: COLORS.white,
    padding: 20,
  },
  bottomSheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 10,
  },
  bottomSheetContent: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.greySolid,
    marginBottom: 10,
  },
  bottomSheetDate: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.grey,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.grey,
  },
  // Styles cho CustomTabBar
  tabBarContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    // borderTopColor: COLORS.grey,
    paddingVertical: 10,
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Shadow cho Android
    elevation: 5,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    right: 10,
    top: -3,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
});
// import React, { useEffect, useState, useContext } from "react";
// import {
//   StatusBar,
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   ScrollView,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { LogBox } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { createStackNavigator } from "@react-navigation/stack";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { useFonts } from "expo-font";
// import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
// import LinearGradient from "react-native-linear-gradient";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
// } from "react-native-reanimated";

// // Import các màn hình khác
// import SplashScreen from "./screens/SplashScreen";
// import LoginScreen from "./screens/LoginScreen";
// import RegisterScreen from "./screens/RegisterScreen";
// import InputOTPScreen from "./screens/InputOTPScreen";
// import InputProfileScreen from "./screens/InputProfileScreen";
// import HomeScreen from "./screens/HomeScreen";
// import OrderScreen from "./screens/OrderScreen";
// import CommunityScreen from "./screens/CommunityScreen";
// import NotificationSettingScreen from "./screens/NotificationSettingScreen";
// import ProfileScreen from "./screens/ProfileScreen";
// import OrderDetailScreen from "./screens/OrderDetailScreen";
// import AllDishScreen from "./screens/AllDishScreen";
// import SuggestedDishesScreen from "./screens/SuggestedDishesScreen";
// import DishDetailScreen from "./screens/DishDetailScreen";
// import NewPostScreen from "./screens/NewPostScreen";
// import PostDetailScreen from "./screens/PostDetailScreen";
// import SearchDishesScreen from "./screens/SearchDishes";
// import CartScreen from "./screens/CartScreen";
// import FavouriteScreen from "./screens/FavouriteScreen";
// import CheckoutScreen from "./screens/CheckoutScreen";
// import PaymentScreen from "./screens/PaymentScreen";
// import MenuScreen from "./screens/MenuScreen";
// import MembershipScreen from "./screens/MembershipScreen";
// import DetailMenuScreen from "./screens/DetailMenuScreen";
// import EditProfileScreen from "./screens/EditProfileScreen";
// import WebViewScreen from "./screens/WebViewScreen";
// import SettingScreen from "./screens/SettingScreen";
// import NotificationScreen from "./screens/NotificationScreen";
// import UserProfileScreen from "./screens/UserProfileScreen";
// import ContactUsScreen from "./screens/ContactUsScreen";
// import FollowerScreen from "./screens/FollowerScreen";
// import RecommedDishScreen from "./screens/RecommendDishScreen";
// import NutritionMatchingScreen from "./screens/NutritionMatchingScreen";
// import NutritionArticleDetailScreen from "./screens/NutritionArticleDetailScreen";
// import LoginWithPhone from "./screens/LoginWithPhone";
// import OTPScreen from "./screens/OTPScreen";
// import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
// import WalletScreen from "./screens/WalletScreen";
// import WebViewsScreen from "./screens/WebViewsScreen";
// import CombineScreen from "./screens/CombineScreen";

// import COLORS from "./constants/color";
// import FONTS from "./constants/font";

// import {
//   NotificationProvider,
//   NotificationContext,
// } from "./context/NotificationContext"; // Import NotificationProvider và Context

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

// const HomeStack = createStackNavigator();
// const OrderStack = createStackNavigator();
// const CommunityStack = createStackNavigator();
// const NotificationStack = createStackNavigator();
// const ProfileStack = createStackNavigator();

// // Custom Toast Config
// const toastConfig = {
//   success: (props) => (
//     <BaseToast
//       {...props}
//       style={{ borderLeftColor: COLORS.green, marginTop: 30, height: 70 }}
//       contentContainerStyle={{ paddingHorizontal: 15 }}
//       text1Style={{
//         fontSize: 15,
//         fontFamily: FONTS.semiBold,
//       }}
//       text2Style={{
//         fontSize: 14,
//         fontFamily: FONTS.medium,
//       }}
//     />
//   ),
//   error: (props) => (
//     <ErrorToast
//       {...props}
//       text1Style={{
//         fontSize: 17,
//         fontFamily: FONTS.medium,
//       }}
//       text2Style={{
//         fontSize: 15,
//         fontFamily: FONTS.medium,
//       }}
//     />
//   ),
//   tomatoToast: ({ text1, props }) => (
//     <View style={{ height: 60, width: "100%", backgroundColor: "tomato" }}>
//       <Text>{text1}</Text>
//       <Text>{props.uuid}</Text>
//     </View>
//   ),
// };

// // Các Stack Navigator cụ thể
// const HomeStackScreen = () => (
//   <HomeStack.Navigator screenOptions={{ headerShown: false }}>
//     <HomeStack.Screen name="Home" component={HomeScreen} />
//     <HomeStack.Screen
//       name="DishDetail"
//       component={DishDetailScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="AllDishes"
//       component={AllDishScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="Recommend"
//       component={RecommedDishScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="RecommendDish"
//       component={RecommedDishScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="NutritionMatching"
//       component={NutritionMatchingScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="Menu"
//       component={MenuScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="DetailMenu"
//       component={DetailMenuScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="Cart"
//       component={CartScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="Checkout"
//       component={CheckoutScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="Favourite"
//       component={FavouriteScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="Payment"
//       component={PaymentScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="WebViewScreen"
//       component={WebViewScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="Order"
//       component={OrderScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="CombineScreen"
//       component={CombineScreen}
//       options={{ unmountOnBlur: true }}
//     />
//     <HomeStack.Screen
//       name="WalletScreen"
//       component={WalletScreen}
//       options={{ unmountOnBlur: true }}
//     />
//   </HomeStack.Navigator>
// );

// // Tương tự cho các Stack khác...

// const OrderStackScreen = () => (
//   <OrderStack.Navigator screenOptions={{ headerShown: false }}>
//     <OrderStack.Screen name="Order" component={OrderScreen} />
//     <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} />
//     <OrderStack.Screen name="WebViewScreen" component={WebViewScreen} />
//   </OrderStack.Navigator>
// );

// const CommunityStackScreen = () => (
//   <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
//     <CommunityStack.Screen name="Community" component={CommunityScreen} />
//     <CommunityStack.Screen name="NewPost" component={NewPostScreen} />
//     <CommunityStack.Screen name="PostDetail" component={PostDetailScreen} />
//     <CommunityStack.Screen
//       name="UserProfileScreen"
//       component={UserProfileScreen}
//     />
//     <CommunityStack.Screen name="Profile" component={ProfileScreen} />
//   </CommunityStack.Navigator>
// );

// const NotificationStackScreen = () => (
//   <NotificationStack.Navigator screenOptions={{ headerShown: false }}>
//     <NotificationStack.Screen
//       name="Notification"
//       component={NotificationScreen}
//     />
//     <NotificationStack.Screen
//       name="NotificationSetting"
//       component={NotificationSettingScreen}
//     />
//   </NotificationStack.Navigator>
// );

// const ProfileStackScreen = () => (
//   <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
//     <ProfileStack.Screen name="Profile" component={ProfileScreen} />
//     <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
//     <ProfileStack.Screen name="Setting" component={SettingScreen} />
//     <ProfileStack.Screen name="ContactUs" component={ContactUsScreen} />
//     <ProfileStack.Screen name="Membership" component={MembershipScreen} />
//     <ProfileStack.Screen name="WalletScreen" component={WalletScreen} />
//     <ProfileStack.Screen name="WebViewsScreen" component={WebViewsScreen} />
//     {/* <ProfileStack.Screen name="ChatScreen" component={ChatScreen} /> */}
//   </ProfileStack.Navigator>
// );

// // Component Custom Tab Bar
// const CustomTabBar = ({ state, descriptors, navigation }) => {
//   const { unreadCount } = useContext(NotificationContext); // Sử dụng context

//   return (
//     <View style={styles.tabBarContainer}>
//       <View style={styles.tabBar}>
//         {state.routes.map((route, index) => {
//           const { options } = descriptors[route.key];
//           const label =
//             options.tabBarLabel !== undefined
//               ? options.tabBarLabel
//               : options.title !== undefined
//               ? options.title
//               : route.name;

//           const isFocused = state.index === index;

//           const onPress = () => {
//             const event = navigation.emit({
//               type: "tabPress",
//               target: route.key,
//               canPreventDefault: true,
//             });

//             if (!isFocused && !event.defaultPrevented) {
//               navigation.navigate(route.name);
//             }
//           };

//           const onLongPress = () => {
//             navigation.emit({
//               type: "tabLongPress",
//               target: route.key,
//             });
//           };

//           // Animation for icon
//           const scale = useSharedValue(1);

//           useEffect(() => {
//             if (isFocused) {
//               scale.value = withSpring(1.2);
//             } else {
//               scale.value = withSpring(1);
//             }
//           }, [isFocused]);

//           const animatedStyle = useAnimatedStyle(() => ({
//             transform: [{ scale: scale.value }],
//           }));

//           // Xác định tên icon dựa trên route
//           const iconName = () => {
//             switch (route.name) {
//               case "Trang chủ":
//                 return isFocused ? "home" : "home-outline";
//               case "Đơn hàng":
//                 return isFocused ? "albums" : "albums-outline";
//               case "Cộng đồng":
//                 return isFocused ? "people" : "people-outline";
//               case "Thông báo":
//                 return isFocused ? "notifications" : "notifications-outline";
//               case "Tài khoản":
//                 return isFocused ? "person" : "person-outline";
//               default:
//                 return "circle";
//             }
//           };

//           return (
//             <TouchableOpacity
//               accessibilityRole="button"
//               accessibilityState={isFocused ? { selected: true } : {}}
//               accessibilityLabel={options.tabBarAccessibilityLabel}
//               testID={options.tabBarTestID}
//               onPress={onPress}
//               onLongPress={onLongPress}
//               style={styles.tabItem}
//               key={index}
//             >
//               <Animated.View style={[animatedStyle, styles.iconContainer]}>
//                 <Icon
//                   name={iconName()}
//                   size={24}
//                   color={isFocused ? COLORS.green : COLORS.greySolid}
//                 />
//                 {route.name === "Thông báo" && unreadCount > 0 && (
//                   <View style={styles.badgeContainer}>
//                     <Text style={styles.badgeText}>
//                       {unreadCount > 99 ? "99+" : unreadCount}
//                     </Text>
//                   </View>
//                 )}
//                 <Text
//                   style={[
//                     styles.tabLabel,
//                     { color: isFocused ? COLORS.green : COLORS.greySolid },
//                   ]}
//                 >
//                   {label}
//                 </Text>
//               </Animated.View>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// // Cấu hình Tab Navigator sử dụng Custom Tab Bar
// const TabRoute = () => (
//   <Tab.Navigator
//     screenOptions={{
//       headerShown: false,
//     }}
//     tabBar={(props) => <CustomTabBar {...props} />}
//   >
//     <Tab.Screen name="Trang chủ" component={HomeStackScreen} />
//     <Tab.Screen name="Đơn hàng" component={OrderStackScreen} />
//     <Tab.Screen name="Cộng đồng" component={CommunityStackScreen} />
//     <Tab.Screen name="Thông báo" component={NotificationStackScreen} />
//     <Tab.Screen name="Tài khoản" component={ProfileStackScreen} />
//   </Tab.Navigator>
// );

// const AppContent = () => {
//   const [fontsLoaded] = useFonts({
//     "OpenSans-Bold": require("./assets/fonts/OpenSans-Bold.ttf"),
//     "OpenSans-SemiBold": require("./assets/fonts/OpenSans-SemiBold.ttf"),
//     "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
//     "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
//     "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
//   });
//   const [initialRoute, setInitialRoute] = useState(null);
//   const navigationRef = React.useRef(null); // Create navigation ref

//   const { unreadCount, notifications, markAllAsRead } =
//     useContext(NotificationContext); // Sử dụng context

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       try {
//         const token = await AsyncStorage.getItem("authToken");
//         const userId = await AsyncStorage.getItem("userId");

//         if (!token || !userId) {
//           setInitialRoute("Login");
//           return;
//         }

//         // Vì không có API, ta sẽ giả định token hợp lệ
//         setInitialRoute("Main");
//       } catch (error) {
//         console.error("Lỗi khi xác thực token:", error);
//         setInitialRoute("Login");
//       }
//     };

//     checkLoginStatus();
//   }, []);

//   if (!fontsLoaded || initialRoute === null) {
//     return null;
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <StatusBar
//         backgroundColor="transparent"
//         barStyle="dark-content"
//         translucent={true}
//       />
//       <NavigationContainer ref={navigationRef}>
//         <Stack.Navigator
//           screenOptions={{ headerShown: false }}
//           initialRouteName={initialRoute}
//         >
//           <Stack.Screen name="Splash" component={SplashScreen} />
//           <Stack.Screen name="Login" component={LoginScreen} />
//           <Stack.Screen name="Register" component={RegisterScreen} />
//           <Stack.Screen name="InputOTP" component={InputOTPScreen} />
//           <Stack.Screen name="Home" component={TabRoute} />
//           <Stack.Screen name="Main" component={TabRoute} />
//           {/* Các màn hình khác */}
//           <Stack.Screen name="Order" component={OrderScreen} />
//           <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
//           <Stack.Screen
//             name="SuggestedDishes"
//             component={SuggestedDishesScreen}
//           />
//           <Stack.Screen name="InputProfile" component={InputProfileScreen} />
//           <Stack.Screen name="DishDetail" component={DishDetailScreen} />
//           <Stack.Screen name="NewPostScreen" component={NewPostScreen} />
//           <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
//           <Stack.Screen name="SearchDishes" component={SearchDishesScreen} />
//           <Stack.Screen name="Cart" component={CartScreen} />
//           <Stack.Screen name="Favourite" component={FavouriteScreen} />
//           <Stack.Screen name="AllDishes" component={AllDishScreen} />
//           <Stack.Screen name="Recommend" component={RecommedDishScreen} />
//           <Stack.Screen name="Checkout" component={CheckoutScreen} />
//           <Stack.Screen name="Menu" component={MenuScreen} />
//           <Stack.Screen name="DetailMenu" component={DetailMenuScreen} />
//           <Stack.Screen name="Membership" component={MembershipScreen} />
//           <Stack.Screen name="Profile" component={ProfileScreen} />
//           <Stack.Screen name="EditProfile" component={EditProfileScreen} />
//           <Stack.Screen name="Setting" component={SettingScreen} />
//           <Stack.Screen name="ContactUs" component={ContactUsScreen} />
//           <Stack.Screen name="Nutrition" component={NutritionMatchingScreen} />
//           <Stack.Screen name="LoginWithPhone" component={LoginWithPhone} />
//           <Stack.Screen
//             name="UserProfileScreen"
//             component={UserProfileScreen}
//           />
//           <Stack.Screen
//             name="NutritionArticle"
//             component={NutritionArticleDetailScreen}
//           />
//           <Stack.Screen
//             name="NotificationSetting"
//             component={NotificationSettingScreen}
//           />
//           <Stack.Screen name="Follow" component={FollowerScreen} />
//           <Stack.Screen
//             name="Payment"
//             component={PaymentScreen}
//             options={{ title: "Thanh Toán" }}
//           />
//           <Stack.Screen
//             name="WebViewScreen"
//             component={WebViewScreen}
//             options={{ title: "Thanh Toán QR" }}
//           />
//           <Stack.Screen name="OTPScreen" component={OTPScreen} />
//           <Stack.Screen
//             name="ForgotPasswordScreen"
//             component={ForgotPasswordScreen}
//           />
//           <Stack.Screen name="WalletScreen" component={WalletScreen} />
//         </Stack.Navigator>
//       </NavigationContainer>
//       <Toast config={toastConfig} />
//     </GestureHandlerRootView>
//   );
// };

// export default function App() {
//   return (
//     <NotificationProvider>
//       <AppContent />
//     </NotificationProvider>
//   );
// }

// const styles = StyleSheet.create({
//   // ... Các styles hiện tại không thay đổi
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     paddingBottom: 60, // Thêm padding để tránh bị che bởi Bottom Tab Bar
//   },
//   listItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   markAllReadContainer: {
//     paddingHorizontal: 10,
//     marginTop: 5,
//     alignItems: "flex-end",
//   },
//   markAllReadButton: {
//     backgroundColor: COLORS.lightGreen,
//     padding: 10,
//     borderRadius: 10,
//   },
//   markAllReadText: {
//     fontFamily: FONTS.medium,
//     color: COLORS.black,
//   },
//   unreadNotification: {},
//   iconContainer: {
//     flexDirection: "column",
//     alignItems: "center",
//   },
//   textContainer: {
//     flex: 1,
//   },
//   titleText: {
//     fontFamily: FONTS.bold,
//     fontSize: 15,
//   },
//   contentStatusContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   contentText: {
//     fontFamily: FONTS.medium,
//     width: "75%",
//     marginTop: 5,
//     color: COLORS.grey,
//   },
//   sentDateText: {
//     fontFamily: FONTS.medium,
//     marginTop: 5,
//     color: COLORS.grey,
//     fontSize: 12,
//     textAlign: "right",
//   },
//   statusText: {
//     fontFamily: FONTS.medium,
//     marginTop: 5,
//     color: COLORS.grey,
//   },
//   bottomSheetContainer: {
//     width: "100%",
//     height: "auto",
//     backgroundColor: COLORS.white,
//     padding: 20,
//   },
//   bottomSheetTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: 20,
//     color: COLORS.black,
//     marginBottom: 10,
//   },
//   bottomSheetContent: {
//     fontFamily: FONTS.medium,
//     fontSize: 16,
//     color: COLORS.greySolid,
//     marginBottom: 10,
//   },
//   bottomSheetDate: {
//     fontFamily: FONTS.medium,
//     fontSize: 14,
//     color: COLORS.grey,
//   },
//   emptyContainer: {
//     marginTop: 50,
//     alignItems: "center",
//   },
//   emptyText: {
//     fontFamily: FONTS.medium,
//     fontSize: 16,
//     color: COLORS.grey,
//   },
//   // Styles cho CustomTabBar
//   tabBarContainer: {
//     backgroundColor: COLORS.white,
//     borderTopWidth: 0.5,
//     // borderTopColor: COLORS.grey,
//     paddingVertical: 10,
//     // Shadow cho iOS
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: -3,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     // Shadow cho Android
//     elevation: 5,
//     // borderTopLeftRadius: 20,
//     // borderTopRightRadius: 20,
//   },
//   tabBar: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//   },
//   tabItem: {
//     flex: 1,
//     alignItems: "center",
//   },
//   badgeContainer: {
//     position: "absolute",
//     right: 10,
//     top: -3,
//     backgroundColor: "red",
//     borderRadius: 8,
//     width: 16,
//     height: 16,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   badgeText: {
//     color: "white",
//     fontSize: 10,
//     fontWeight: "bold",
//   },
//   tabLabel: {
//     fontSize: 12,
//     fontFamily: FONTS.medium,
//     marginTop: 4,
//   },
// });
