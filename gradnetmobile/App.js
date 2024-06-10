import React, { useContext, useReducer } from "react";
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
import { Home, Home2, LoginCurve, Profile, Profile2User } from "iconsax-react-native";


const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();


const MyTab = () => {
  return (
    <Tab.Navigator screenOptions={
      ({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
              let icon, variant;

              switch (route.name) {
                  case "Post":
                      variant = focused ? 'Bold' : 'Outline'
                      icon = <Home2 color={color} size={size} />
                      break;
                  case "Profile":
                      variant = focused ? 'Bold' : 'Outline'
                      icon = <Profile2User color={color} size={size} />
                      break;
                  case "Register":
                      variant = focused ? 'Bold' : 'Outline'
                      icon = <LoginCurve color={color} size={size} />
                      break;
                  case "Login":
                      variant = focused ? 'Bold' : 'Outline'
                      icon = <LoginCurve color={color} size={size} />
                      break;
                  default:
                      variant = focused ? 'Bold' : 'Outline'
              }

              return icon;
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Post" component={Post} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Register" component={Register} />
      <Tab.Screen name="Login" component={Login} />
      
  </ Tab.Navigator>
  );
};

const MyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Post" component={Post} />
      <Stack.Screen name="Main" component={MyTab} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
};


const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  return (
    <NavigationContainer>
      <MyUserContext.Provider value={user}>
        <MyDispatcherContext.Provider value={dispatch}>
          <MyTab />
        </MyDispatcherContext.Provider>
      </MyUserContext.Provider>
    </NavigationContainer>
  );
};

export default App;

