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
  Button,
} from "react-native";
import FormInput from "../base/form/FormInput";
import FormButton from "../base/form/FormButton";
import APIs, { endpoints } from "../../configs/APIs";
import * as ImagePicker from "expo-image-picker";
import { HelperText, TouchableRipple } from "react-native-paper";
import { FormStyle } from "../base/form/FormStyle";
import useDebounce from "../hooks/useDebounce";

const RegisterScreen = ({ navigation }) => {
  const fields = [
    { label: "Tên người dùng", icon: "text", field: "first_name" },
    { label: "Họ và tên lót", icon: "text", field: "last_name" },
    { label: "Tên đăng nhập", icon: "account", field: "username" },
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

  const [user, setUser] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState({
    password: true,
    confirm: true,
  });

  const usernameDebounce = useDebounce(user.username, 500);

  useEffect(() => {
    if (usernameDebounce) {
      checkUserName(usernameDebounce);
    }
  }, [usernameDebounce]);

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

  const change = (value, field) => {
    setUser((current) => ({ ...current, [field]: value }));
    if (field === "username" && value === "") {
      setError((current) => {
        const { username, ...newError } = current;
        return newError;
      });
    }
    if (field === "confirm" && value === "") {
      setError((current) => {
        const { password, ...newError } = current;
        return newError;
      });
    }
  };

  const checkUserName = async (username) => {
    try {
      let res = await APIs.get(endpoints["check-username"], {
        params: { username },
      });
      if (res.status === 200) {
        setError((current) => ({ ...current, username: res.data.error }));
      }
    } catch (ex) {
      setError((current) => {
        const { username, ...newError } = current;
        return newError;
      });
    }
  };

  const picker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Gradnet", "Permissions denied!");
    } else {
      const res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) change(res.assets[0], "avatar");
    }
  };

  const register = async () => {
    //
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

    if (isError) return;
    //

    setLoading(true);
    try {
      let form = new FormData();
      // for (let k in user) form.append(k, user[k]);
      for (let key in user) {
        if (key !== "confirm") {
          if (key === "avatar") {
            form.append(key, {
              uri: user.avatar.uri,
              name: user.avatar.fileName || "avatar.jpg",
              type: user.avatar.type || "image/jpeg",
            });
          } else {
            form.append(key, user[key]);
          }
        }
      }

      // console.log(form);

      let res = await APIs.post(endpoints["register"], form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // console.log(res);

      // if (res.status === 201) navigation.navigate("Login");
      // else setError((current) => ({ ...current, ...res.data }));
    } catch (ex) {
      Alert.alert(
        "Lỗi hệ thống",
        "Không thể đăng ký tài khoản. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={FormStyle.container}>
        <Image
          source={require("../../assets/logoOU.png")}
          style={FormStyle.logo}
        />
        <Text style={FormStyle.text}>ĐĂNG KÝ TÀI KHOẢN</Text>
        <TouchableRipple onPress={picker} rippleColor="rgba(0, 0, 0, .32)">
          {user.avatar ? (
            <Image
              source={{ uri: user.avatar.uri }}
              style={{ width: 200, height: 200 }}
            />
          ) : (
            <View style={FormStyle.avatarPlaceholder}>
              <Text>Chọn ảnh đại diện</Text>
            </View>
          )}
        </TouchableRipple>
        {fields.map((f) => (
          <TextInput
            key={f.field}
            mode="outlined"
            label={f.label}
            secureTextEntry={secureTextEntry[f.field]}
            left={<TextInput.Icon icon={f.icon} />}
            right={
              f.secureTextEntry ? (
                <TextInput.Icon
                  icon="eye"
                  onPress={() =>
                    setSecureTextEntry((current) => ({
                      ...current,
                      [f.field]: !current[f.field],
                    }))
                  }
                />
              ) : null
            }
            onChangeText={(value) => change(value, f.field)}
            value={user[f.field]}
            error={error[f.field]}
          />
        ))}
        <HelperText
          style={{ fontSize: 16 }}
          type="error"
          visible={!!Object.keys(error).length}
        >
          {Object.values(error).join(", ")}
        </HelperText>
        <FormButton title="Đăng ký" onPress={register} disabled={loading} />
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={FormStyle.navButtonText}>
            Đã có tài khoản? Đăng nhập tại đây
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;