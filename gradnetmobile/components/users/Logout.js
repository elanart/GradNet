import React, { useContext, useEffect } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatcherContext } from "../../configs/Context";

const Logout = () => {
  const dispatch = useContext(MyDispatcherContext);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    // Dispatch logout action
    dispatch({
      type: "logout",
    });
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Đang đăng xuất...</Text>
    </View>
  );
};

export default Logout;
