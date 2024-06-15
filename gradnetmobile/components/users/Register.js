import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import FormInput from "../base/form/FormInput";
import FormButton from "../base/form/FormButton";
import APIs, { endpoints } from "../../configs/APIs";
import * as ImagePicker from "expo-image-picker";
import { HelperText, TouchableRipple, Button } from "react-native-paper";
import useDebounce from "../../hooks/useDebounce";
import { RegisterStyles } from "../users/Styles";
import MyStyles from "../../styles/MyStyles";
import mime from "mime";

const Register = ({ navigation }) => {
  const fields = [
    { label: "Mã số sinh viên", icon: "contacts", field: "alumni_id" },
    { label: "Tên người dùng", icon: "contacts", field: "first_name" },
    { label: "Họ và tên lót", icon: "contacts", field: "last_name" },
    { label: "Tên đăng nhập", icon: "user", field: "username" },
    {
      label: "Mật khẩu",
      icon: "eye",
      field: "password",
      secureTextEntry: true,
    },
    {
      label: "Xác nhận mật khẩu",
      icon: "eye",
      field: "confirm",
      secureTextEntry: true,
    },
  ];

  // State để lưu trữ thông tin người dùng, lỗi, kiểm tra trạng thái loading
  const [user, setUser] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState({
    password: true,
    confirm: true,
  });

  // Gọi hook này để trì hoãn gửi request cho đến khi user dừng nhập trường username trong một khoảng thời gian 500.
  const usernameDebounce = useDebounce(user.username, 500);

  // Kiểm tra username mỗi khi user thay đổi trường username
  useEffect(() => {
    if (usernameDebounce) {
      checkUserName(usernameDebounce);
    }
  }, [usernameDebounce]);

  // Kiểm tra sự khác biệt giữa password và confirm
  useEffect(() => {
    if (user.password !== user.confirm) {
      setError((current) => ({ ...current, password: "Mật khẩu không khớp!" }));
    } else {
      setError((current) => {
        const { password, ...newError } = current;
        return newError;
      });
    }
  }, [user.password, user.confirm]);

  // Hàm cập nhật sự thay đổi giá trị value của trường field
  const change = (value, field) => {
    setUser((current) => ({ ...current, [field]: value }));
    // if (field === "username" && value === "") {
    //   setError((current) => {
    //     const { username, ...newError } = current;
    //     return newError;
    //   });
    // }
    // if (field === "confirm" && value === "") {
    //   setError((current) => {
    //     const { password, ...newError } = current;
    //     return newError;
    //   });
    // }
    setError({});
  };

  const checkUserName = async (username) => {
    try {
      let res = await APIs.get(endpoints["check-username"], {
        params: { username },
      });
      // Nếu username đã tồn tại = 200
      if (res.status === 200) {
        setError((current) => ({ ...current, username: res.data.error }));
      }
    } catch (ex) {
      // Xóa thuộc tính username khỏi currentError.
      setError((current) => {
        const { username, ...newError } = current;
        return newError;
      });
    }
  };

  // Lấy ảnh từ thư viện
  const picker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // "granted" (đã cấp phép)
      Alert.alert("Gradnet", "Permissions denied!");
    } else {
      const res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) change(res.assets[0], "avatar");
    }
  };

  const register = async () => {
    let isError = false;
    for (let f of fields) {
      if (!user[f.field]) {
        setError((current) => ({
          ...current,
          [f.field]: "Không được để trống!",
        }));
        isError = true;
      }
    }

    // Nếu xuất hiện lỗi => thoát hàm
    if (isError) return;

    setLoading(true);
    try {
      let form = new FormData();
      for (let key in user) {
        if (key !== "confirm") {
          if (key === "avatar") {
            form.append(key, {
              uri: user.avatar.uri,
              name: user.avatar.fileName || "avatar.jpg",
              type: mime.getType(user.avatar.uri) || "image/jpeg",
            });
          } else {
            form.append(key, user[key]);
          }
        }
      }

      let res = await APIs.post(endpoints["register"], form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) navigation.navigate("Login");
      else setError((current) => ({ ...current, ...res.data }));
    } catch (ex) {
      console.log(ex);
      Alert.alert(
        "Lỗi hệ thống",
        "Không thể đăng ký tài khoản. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        margin: 20,
      }}
    >
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={{ alignItems: "center" }}>
            <Image
              source={require("../../assets/logoOU.png")}
              style={MyStyles.logo}
            />
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={MyStyles.text}>ĐĂNG KÝ NGƯỜI DÙNG</Text>
          </View>

          {fields.map((f) => (
            <>
              <FormInput
                key={f.field}
                value={user[f.field]}
                onChangeText={(t) => change(t, f.field)}
                text={f.label}
                secureTextEntry={f.secureTextEntry && secureTextEntry[f.field]}
                icon={f.icon}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </>
          ))}

          <TouchableRipple
            onPress={picker}
            style={(MyStyles.forgotpasswordButton, { alignItems: "center" })}
          >
            <Button labelStyle={RegisterStyles.pickerButtonText}>
              Chọn ảnh đại diện...
            </Button>
          </TouchableRipple>

          {user.avatar && (
            <Image
              source={{ uri: user.avatar.uri }}
              style={{ width: 100, height: 100 }}
            />
          )}

          <HelperText
            style={{
              fontSize: 16,
            }}
            type="error"
            visible={Object.keys(error).length > 0}
          >
            {Object.values(error).join("\n")}
          </HelperText>

          <FormButton
            title="Đăng ký tài khoản"
            onPress={register}
            disabled={loading}
          />

          <TouchableOpacity
            style={
              (MyStyles.forgotpasswordButton,
              { alignItems: "center", marginTop: 15 })
            }
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={MyStyles.navigationText}>
              Đã có tài khoản? Đăng nhập tại đây
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default Register;
