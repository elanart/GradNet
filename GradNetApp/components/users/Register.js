import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import MyStyles from "../../styles/MyStyles";
import {
  Button,
  HelperText,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import APIs, { endpoints } from "../../configs/APIs";
import useDebounce from "../../hooks/useDebounce";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
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

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [error, setError] = useState({});
  const [secureTextEntry, setSecureTextEntry] = useState({
    password: true,
    confirm: true,
  });

  // const nav = useNavigation();
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

  const picker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Gradnet", "Permissions denied!");
    } else {
      const res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) change(res.assets[0], "avatar");
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

  const register = async () => {
    if (user?.password !== user?.confirm) {
      setError((current) => ({ ...current, password: "Mật khẩu không khớp!" }));
      return;
    }

    if (error.username) return;

    setLoading(true);
    try {
      let form = new FormData();
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

      form.append("email", "2151050223@ou.edu.vn");

      let res = await APIs.post(endpoints["register"], form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // if (res.status === 201) nav.navigate("Login");
    } catch (ex) {
      console.log(ex);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={(MyStyles.container, MyStyles.margin)}>
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Text style={MyStyles.subject}>ĐĂNG KÝ NGƯỜI DÙNG</Text>
          {fields.map((f) => (
            <>
              <TextInput
                key={f.field}
                value={user[f.field]}
                onChangeText={(t) => change(t, f.field)}
                label={f.label}
                style={MyStyles.margin}
                secureTextEntry={f.secureTextEntry && secureTextEntry[f.field]}
                right={
                  f.secureTextEntry ? (
                    <TextInput.Icon
                      icon={secureTextEntry[f.field] ? "eye" : "eye-off"}
                      onPress={() => {
                        setSecureTextEntry((prev) => ({
                          ...prev,
                          [f.field]: !prev[f.field],
                        }));
                      }}
                    />
                  ) : (
                    <TextInput.Icon icon={f.icon} />
                  )
                }
              />
              {f.field === "username" && error.username && (
                <HelperText type="error" visible={error.username}>
                  {error.username}
                </HelperText>
              )}
              {f.field === "confirm" && error.password && (
                <HelperText type="error" visible={error.password}>
                  {error.password}
                </HelperText>
              )}
            </>
          ))}

          <TouchableRipple onPress={picker}>
            <Button style={MyStyles.margin}>Chọn ảnh đại diện...</Button>
          </TouchableRipple>

          {user.avatar && (
            <Image source={{ uri: user.avatar.uri }} style={MyStyles.avatar} />
          )}

          <Button
            loading={loading}
            onPress={register}
            icon="account"
            mode="contained"
            disabled={loading}
          >
            Đăng ký
          </Button>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default Register;
