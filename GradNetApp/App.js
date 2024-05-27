import { SafeAreaProvider } from "react-native-safe-area-context";
import Post from "./components/posts/Posts";
import Register from "./components/users/Register";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "./components/users/Login";

const AppStack = createStackNavigator();

const App = () => {
  // const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  // useEffect(() => {
  //   AsyncStorage.getItem("alreadyLaunched").then((value) => {
  //     if (value === null) {
  //       AsyncStorage.setItem("alreadyLaunched", "true");
  //       setIsFirstLaunch(true);
  //     } else {
  //       setIsFirstLaunch(false);
  //     }
  //   });
  // }, []);

  // if (isFirstLaunch === null) {
  //   return null;
  // } else if (isFirstLaunch === true) {
  //   return (
  //     <NavigationContainer>
  //       <AppStack.Navigator headerShown="false">
  //         <AppStack.Screen name="Onboarding" component={OnBoardingScreen} />
  //         <AppStack.Screen name="Login" component={LoginScreen} />
  //       </AppStack.Navigator>
  //     </NavigationContainer>
  //   );
  // } else {
  //   return <LoginScreen />;
  // }

  return (
    // <NavigationContainer>
    //   <AppStack.Navigator headerShown="false">
    //     <AppStack.Screen name="Onboarding" component={OnBoardingScreen} />
    //     <AppStack.Screen name="Login" component={LoginScreen} />
    //   </AppStack.Navigator>
    // </NavigationContainer>
    // <Login />
    // <NavigationContainer>
    <Register />
    // </NavigationContainer>
  );
};

export default App;
