import { Button, Image, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import AntDesign from "react-native-vector-icons/AntDesign";
import FormInput from "../base/form/FormInput";
import { useContext, useState } from "react";
import FormButton from "../base/form/FormButton";
import APIs, {
  authAPI,
  client_id,
  client_secret,
  endpoints,
} from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URLSearchParams } from "react-native-url-polyfill";
import { MyDispatcherContext } from "../../configs/Context";

const Login = ({ navigation }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const dispatch = useContext(MyDispatcherContext);

  //hàm này dùng để cập nhật thông tin user
  const change = (value, field) => {
    setUser((current) => {
      // current: lấy ra user hiện tại
      return { ...current, [field]: value };
      //trả về 1 user mới với sao chép các trường cũ "...current" và trường mới có giá trị mới "[field]: value"
    });
  };

  const login = async () => {
    setLoading(true);
    try {
      const payload = new URLSearchParams();
      payload.append("username", user.username);
      payload.append("password", user.password);
      payload.append("client_id", client_id);
      payload.append("client_secret", client_secret);
      payload.append("grant_type", "password");

      let res = await APIs.post(endpoints.login, payload.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // console.info(res.data);
      await AsyncStorage.setItem("token", res.data.access_token);

      //setTimeout để chờ lưu token vào AsyncStorage
      setTimeout(async () => {
        let user = await authAPI(res.data.access_token).get(
          endpoints["current-user"] //Sau khi có token thì lấy thông tin chi tiết của user
        );
        // console.info(user.data);

        AsyncStorage.setItem("user", JSON.stringify(user.data));

        dispatch({
          type: "login",
          payload: user.data,
        });

        // Chuyển hướng người dùng sau khi đăng nhập thành công
        navigation.navigate("Register");
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
        value={user["username"]} //user["username"]: cách lấy giá trị của trường username trong user
        text="Tên người dùng"
        icon="user"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(value) => change(value, "username")} //change(giá trị cập nhật, tên trường cập nhật)
      />
      <FormInput
        value={user["password"]}
        text="Nhập mật khẩu"
        icon="lock"
        secureTextEntry={true}
        onChangeText={(value) => change(value, "password")}
      />
      <FormButton title="Đăng nhập" onPress={login} disabled={loading} />

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
