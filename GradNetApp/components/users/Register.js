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
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import APIs, { endpoints } from "../../configs/APIs";

const Register = () => {
  const fields = [
    {
      label: "Tên người dùng",
      icon: "text",
      field: "first_name",
    },
    {
      label: "Họ và tên lót",
      icon: "text",
      field: "last_name",
    },
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
    {
      label: "Xác nhận mật khẩu",
      icon: "eye",
      field: "confirm",
      secureTextEntry: true,
    },
  ];

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [error, setError] = useState(false);

  const change = (value, field) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  const picker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Gradnet", "Permissions denied!");
    } else {
      const res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled)
        setUser((current) => {
          return { ...current, avatar: res.assets[0] };
        });
    }
  };

  const register = async () => {
    if (user?.password !== user?.confirm) {
      setError(true);
      return;
    } else setError(false);

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
      console.info(form);

      let res = await APIs.post(endpoints["register"], form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 201) nav.navigate("Login");
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

          <TouchableRipple onPress={picker}>
            <Text style={MyStyles.margin}>Chọn ảnh đại diện...</Text>
          </TouchableRipple>

          <HelperText type="error" visible={error}>
            Mật khẩu không khớp!
          </HelperText>

          {user.avatar && (
            <Image source={{ uri: user.avatar.uri }} style={MyStyles.avatar} />
          )}

          <Button
            loading={loading}
            onPress={register}
            icon="account"
            mode="contained"
          >
            Đăng ký
          </Button>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default Register;
