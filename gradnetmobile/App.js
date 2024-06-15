import React, { useContext, useEffect, useReducer } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatcherContext, MyUserContext } from "./configs/Context";
import { MyUserReducer } from "./configs/Reducers";
import Post from "./components/posts/Post";
import Register from "./components/users/Register";
import OnboardingScreen from "./components/screens/Onboarding";
import Login from "./components/users/Login";
import ProfileScreen from "./components/screens/ProfileScreen";

import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import {
  Home,
  Home2,
  LoginCurve,
  Profile,
  Profile2User,
  Notification,
  Setting,
} from "iconsax-react-native";
import { checkUser } from "./configs/Utils";
import Logout from "./components/users/Logout";
import { PaperProvider } from "react-native-paper";
import NotificationScreen from "./components/screens/NotificationScreen";
import ProfileSettings from "./components/screens/ProfileSettings";

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const MyTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Thiết lập icon cho mỗi tab
        tabBarIcon: ({ focused, color, size }) => {
          let icon, variant;

          switch (route.name) {
            case "Post":
              variant = focused ? "Bold" : "Outline";
              icon = <Home2 color={color} size={size} />;
              break;
            case "Profile":
              variant = focused ? "Bold" : "Outline";
              icon = <Profile2User color={color} size={size} />;
              break;

            case "Notification":
              variant = focused ? "Bold" : "Outline";
              icon = <Notification color={color} size={size} />;

            case "Setting":
              variant = focused ? "Bold" : "Outline";
              icon = <Setting color={color} size={size} />;

              break;
            case "Logout":
              icon = <LoginCurve color={color} size={size} />;
              break;

            default:
              icon = <Home color={color} size={size} />;
          }

          return icon;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Post" component={Post} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Setting" component={ProfileSettings} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Logout" component={Logout} />
    </Tab.Navigator>
  );
};

const MyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen
        name="Main"
        component={MyTab}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  // Sử dụng useReducer để quản lý state của user
  const [user, dispatch] = useReducer(MyUserReducer, null);

  // Kiểm tra user đã đăng nhập trước đó chưa ? dùng MyTab : dùng MyStack
  useEffect(() => {
    checkUser(dispatch);
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        {/* Chia sẻ state của user và dispatch function tới các component con */}
        <MyUserContext.Provider value={user}>
          <MyDispatcherContext.Provider value={dispatch}>
            {user ? <MyTab /> : <MyStack />}
          </MyDispatcherContext.Provider>
        </MyUserContext.Provider>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
