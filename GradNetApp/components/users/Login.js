import { Text, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useState } from "react";
import { Button, TextInput } from "react-native-paper";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const fields = [
    {
      label: "Tên đăng nhập",
      icon: "account",
      field: "username",
    },
    {
      label: "Mật khẩu",
      icon: "eye",
      field: "password",
      secureTextEntry: true,
    },
  ];

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const change = (value, field) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  const login = async () => {
    setLoading(true);
    try {
      let res = await APIs.post(endpoints["login"], {
        ...user,
        client_id: "EIFOWs5h8FPJPluYFvXIQdcLvAWfjn8AHXwrW3AG",
        client_secret:
          "o3YdzEnDROX2W25N15Ar8PDdOxwYHALSfrxPEcuCHRDBXPHPPkAm3bDUrbawn5VE4FGEQaLyP8zrMGJdasYL9ZFrl77jQzK64sxB3kwevXMB5IWJLmsnAHhigeJJkJQL",
        grant_type: "password",
      });
      console.info(res.data);
      await AsyncStorage.setItem("token", res.data.access_token);

      setTimeout(async () => {
        let user = await authAPI(res.data.access_token).get(
          endpoints["current-user"]
        );
        console.info(user.data);
      }, 100);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[MyStyles.container, MyStyles.margin]}>
      <Text style={MyStyles.subject}>Đăng nhập người dùng</Text>
      {fields.map((f) => (
        <TextInput
          value={user[f.field]}
          onChangeText={(t) => change(t, f.field)}
          key={f.field}
          label={f.label}
          secureTextEntry={f.secureTextEntry}
          style={MyStyles.margin}
          right={<TextInput.Icon icon={f.icon} />}
        />
      ))}

      <Button loading={loading} onPress={login} icon="account" mode="contained">
        Đăng nhập
      </Button>
    </View>
  );
};

export default Login;
