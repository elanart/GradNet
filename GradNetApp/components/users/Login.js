import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import React, { useContext, useState } from "react";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatcherContext } from "../../configs/Context";

const Login = () => {
  const [user, setUser] = useState({});
  const fields = [
    {
      label: "Tên đăng nhập",
      icon: "account",
      name: "username",
    },
    {
      label: "Mật khẩu",
      icon: "eye",
      secureTextEntry: true,
      name: "password",
    },
  ];
  const [loading, setLoading] = useState(false);
  const dispatch = useContext(MyDispatcherContext);

  const login = async () => {
    setLoading(true);

    try {
      let res = await APIs.post(endpoints["login"], {
        ...user,
        client_id: "EIFOWs5h8FPJPluYFvXIQdcLvAWfjn8AHXwrW3AG ",
        client_secret:
          "o3YdzEnDROX2W25N15Ar8PDdOxwYHALSfrxPEcuCHRDBXPHPPkAm3bDUrbawn5VE4FGEQaLyP8zrMGJdasYL9ZFrl77jQzK64sxB3kwevXMB5IWJLmsnAHhigeJJkJQL",
        grant_type: "password",
      });

      AsyncStorage.setItem("access-token", res.data.access_token);

      setTimeout(async () => {
        let token = await AsyncStorage.getItem("access-token");
        let user = await authAPI(token).get(endpoints["current-user"]);
        AsyncStorage.setItem("user", JSON.stringify(user.data));

        dispatch({
          type: "login",
          payload: user.data,
        });

        // nav.navigate("Home");
      }, 100);
    } catch (ex) {
      console.error(ex);
      Alert.alert(
        "Login failed",
        "Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateState = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  return (
    <View style={[MyStyles.container, MyStyles.margin]}>
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {fields.map((f) => (
            <TextInput
              value={user[f.name]}
              onChangeText={(t) => updateState(f.name, t)}
              key={f.label}
              style={MyStyles.margin}
              label={f.label}
              secureTextEntry={f.secureTextEntry}
              right={<TextInput.Icon icon={f.icon} />}
            />
          ))}

          <Button
            style={MyStyles.margin}
            loading={loading}
            icon="account"
            mode="contained"
            onPress={login}
          >
            Đăng nhập
          </Button>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default Login;
