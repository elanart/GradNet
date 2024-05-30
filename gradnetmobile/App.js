import React, { useContext, useEffect, useReducer, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Post from "./components/posts/Post";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Register from "./components/users/Register";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import OnboardingScreen from "./components/screens/Onboarding";
import Login from "./components/users/Login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatcherContext, MyUserContext } from "./configs/Context";
import { MyUserReducer } from "./configs/Reducers";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MyTab = () => {
  return (
    <Tab.Navigator>
      {/* <Tab.Screen name="Post" component={Post} />
      <Tab.Screen name="Register" component={Register} /> */}
    </Tab.Navigator>
  );
};

const MyStack = () => {
  const user = useContext(MyUserContext);
  return (
    <Stack.Navigator>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Post" component={Post} />
    </Stack.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  return (
    <NavigationContainer>
      <MyUserContext.Provider value={user}>
        <MyDispatcherContext.Provider value={dispatch}>
          <MyStack />
        </MyDispatcherContext.Provider>
      </MyUserContext.Provider>
    </NavigationContainer>
  );
};

export default App;