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
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import * as ImagePicker from "expo-image-picker";
import { HelperText, TouchableRipple, Button } from "react-native-paper";
import { RegisterStyles } from "../users/Styles";
import MyStyles from "../../styles/MyStyles";
import mime from "mime";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileSettings = ({ navigation }) => {
  const fields = [
    { label: "Mã số sinh viên", icon: "contacts", field: "alumni_id" },
    { label: "Tên người dùng", icon: "contacts", field: "first_name" },
    { label: "Họ và tên lót", icon: "contacts", field: "last_name" },
    { label: "Email", icon: "contacts", field: "email" },
  ];

  // State để lưu trữ thông tin người dùng, lỗi, kiểm tra trạng thái loading
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const change = (value, field) => {
    setUser((current) => ({ ...current, [field]: value }));
  };

  const AvatarPicker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // "granted" (đã cấp phép)
      Alert.alert("Gradnet", "Permissions denied!");
    } else {
      const res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) change(res.assets[0], "avatar");
    }
  };

  const CoverPicker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // "granted" (đã cấp phép)
      Alert.alert("Gradnet", "Permissions denied!");
    } else {
      const res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) change(res.assets[0], "cover");
    }
  };

  const update = async () => {
    //Làm tiếp phần chỉnh sửa hồ sơ
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("Người dùng chưa đăng nhập");
        return;
      }

      let form = new FormData();
      for (let key in user) {
        if (key === "avatar") {
          form.append(key, {
            uri: user.avatar.uri,
            name: user.avatar.fileName || "avatar.jpg",
            type: mime.getType(user.avatar.uri) || "image/jpeg",
          });
        } else {
          if (key === "cover") {
            form.append(key, {
              uri: user.cover.uri,
              name: user.cover.fileName || "cover.jpg",
              type: mime.getType(user.avatar.uri) || "image/jpeg",
            });
          } else {
            form.append(key, user[key]);
          }
        }
      }

      let res = await authAPI(token).patch(endpoints["current-user"], form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) navigation.navigate("Profile");
    } catch (ex) {
      console.log(ex);
      Alert.alert(
        "Lỗi hệ thống",
        "Không thể cập nhật thông tin tài khoản. Vui lòng thử lại sau."
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
          {/* <View style={{ alignItems: "center" }}>
            <Image
              source={require("../../assets/logoOU.png")}
              style={MyStyles.logo}
            />
          </View> */}

          <View style={{ alignItems: "center" }}>
            <Text style={MyStyles.text}>CẬP NHẬT HỒ SƠ</Text>
          </View>

          {fields.map((f) => (
            <>
              <FormInput
                key={f.field}
                value={user[f.field]}
                onChangeText={(t) => change(t, f.field)}
                text={f.label}
                icon={f.icon}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </>
          ))}

          <TouchableRipple
            onPress={AvatarPicker}
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

          <TouchableRipple
            onPress={CoverPicker}
            style={(MyStyles.forgotpasswordButton, { alignItems: "center" })}
          >
            <Button labelStyle={RegisterStyles.pickerButtonText}>
              Chọn ảnh cover...
            </Button>
          </TouchableRipple>

          {user.cover && (
            <Image
              source={{ uri: user.cover.uri }}
              style={{ width: 100, height: 100 }}
            />
          )}

          <FormButton
            title="Cập nhật hồ sơ"
            onPress={update}
            disabled={loading}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default ProfileSettings;
