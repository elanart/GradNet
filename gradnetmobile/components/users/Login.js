import { Button, Image, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import AntDesign from "react-native-vector-icons/AntDesign";
import FormInput from "../base/form/FormInput";
import { useState } from "react";
import FormButton from "../base/form/FormButton";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ navigation }) => {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
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
    <View style={MyStyles.container}>
      <Image
        source={require("../../assets/logoOU.png")}
        style={MyStyles.logo}
      />
      <Text style={MyStyles.text}>ĐĂNG NHẬP TÀI KHOẢN</Text>
      <FormInput
        value={username}
        text="Tên người dùng"
        icon="user"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FormInput
        value={password}
        text="Nhập mật khẩu"
        icon="lock"
        secureTextEntry={true}
      />
      <FormButton title="Đăng nhập" />

      <TouchableOpacity
        style={MyStyles.forgotpasswordButton}
        onPress={() => {}}
      >
        <Text style={MyStyles.navigationText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={MyStyles.forgotpasswordButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={MyStyles.navigationText}>
          Chưa có tài khoản? Đăng ký tại đây
        </Text>
      </TouchableOpacity>

      {/* <AntDesign name="user" size={25} color="#666" />
      <Text>ĐĂNG NHẬP TÀI KHOẢN</Text>
      <Button
        title="Đăng nhập"
        onPress={() => navigation.navigate("Register")}
      /> */}
    </View>
  );
};

export default Login;
