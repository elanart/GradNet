import { Button, Image, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import AntDesign from "react-native-vector-icons/AntDesign";
import FormInput from "../base/form/FormInput";
import { useContext, useEffect, useState } from "react";
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
import { FormStyle } from "../base/form/FormStyle";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { HelperText } from "react-native-paper";

const Login = ({ navigation }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useContext(MyDispatcherContext);

  // useEffect(() => {}, []);

  //hàm này dùng để cập nhật thông tin user
  const change = (value, field) => {
    setUser((current) => ({ ...current, [field]: value }));
    // current: lấy ra user hiện tại
    //trả về 1 user mới với sao chép các trường cũ "...current" và trường mới có giá trị mới "[field]: value"

    setError(""); // Ẩn lỗi khi người dùng chỉnh sửa input
  };

  const login = async () => {
    // Kiểm tra các trường nhập
    if (!user.username || !user.password) {
      setError("Tên người dùng và mật khẩu không được để trống");
      return;
    }

    // let errors = {};
    // if (!user.username) {
    //   errors.username = "Tên người dùng không được để trống";
    // }
    // if (!user.password) {
    //   errors.password = "Mật khẩu không được để trống";
    // }

    // if (Object.keys(errors).length > 0) {
    //   setError(errors);
    //   return;
    // }

    setLoading(true);
    try {
      const payLoad = new URLSearchParams();
      payLoad.append("username", user.username);
      payLoad.append("password", user.password);
      payLoad.append("client_id", client_id);
      payLoad.append("client_secret", client_secret);
      payLoad.append("grant_type", "password");

      let res = await APIs.post(endpoints.login, payLoad.toString(), {
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

        //
        dispatch({
          type: "login",
          payload: user.data,
        });

        // Chuyển hướng người dùng sau khi đăng nhập thành công
        navigation.navigate("Register");
      }, 100);
    } catch (ex) {
      // console.error(ex);
      setError("Tên người dùng hoặc mật khẩu không đúng");
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

      <HelperText
        style={{
          fontSize: 16,
        }}
        type="error"
        visible={!!error}
      >
        {error}
      </HelperText>

      <FormButton title="Đăng nhập" onPress={login} disabled={loading} />

      <TouchableOpacity
        style={MyStyles.forgotpasswordButton}
        onPress={() => {}}
      >
        <Text style={MyStyles.navigationText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[FormStyle.buttonContainer, { backgroundColor: "#f5e7ea" }]}
        onPress={() => {}}
      >
        <View style={FormStyle.iconWrapper}>
          <FontAwesome
            name="google"
            style={FormStyle.icon}
            size={22}
            color="#de4d41"
          />
        </View>
        <View style={FormStyle.btnTxtWrapper}>
          <Text style={[FormStyle.buttonText, { color: "#de4d41" }]}>
            Đăng nhập bằng Google
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[FormStyle.buttonContainer, { backgroundColor: "#6e7c8a" }]}
        onPress={() => {}}
      >
        <View style={FormStyle.iconWrapper}>
          <FontAwesome
            name="github"
            style={FormStyle.icon}
            size={22}
            color="#ffffff"
          />
        </View>
        <View style={FormStyle.btnTxtWrapper}>
          <Text style={[FormStyle.buttonText, { color: "#ffffff" }]}>
            Đăng nhập bằng GitHub
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={MyStyles.forgotpasswordButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={MyStyles.navigationText}>
          Chưa có tài khoản? Đăng ký tại đây
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
