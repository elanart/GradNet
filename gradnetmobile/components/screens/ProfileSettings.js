import React, { useState } from "react";
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
  Modal,
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

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const change = (value, field) => {
    setUser((current) => ({ ...current, [field]: value }));
  };

  const AvatarPicker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Gradnet", "Permissions denied!");
    } else {
      const res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) change(res.assets[0], "avatar");
    }
  };

  const CoverPicker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Gradnet", "Permissions denied!");
    } else {
      const res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) change(res.assets[0], "cover");
    }
  };

  const update = async () => {
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
        } else if (key === "cover") {
          form.append(key, {
            uri: user.cover.uri,
            name: user.cover.fileName || "cover.jpg",
            type: mime.getType(user.avatar.uri) || "image/jpeg",
          });
        } else {
          form.append(key, user[key]);
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

  const handleChangePassword = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }

    try {
      const response = await authAPI(token).post(endpoints["change-password"], {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.data.success) {
        Alert.alert("Thành công", response.data.success);
        setModalVisible(false);
      } else {
        Alert.alert("Lỗi", response.data.error || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", margin: 20 }}>
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={MyStyles.text}>CẬP NHẬT HỒ SƠ</Text>
          </View>

          {fields.map((f) => (
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

          <TouchableRipple
            onPress={() => setModalVisible(true)}
            style={(MyStyles.forgotpasswordButton, { alignItems: "center" })}
          >
            <Button labelStyle={RegisterStyles.pickerButtonText}>
              Đổi mật khẩu...
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu hiện tại"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonChangePassword]}
              onPress={handleChangePassword}
            >
              <Text style={styles.buttonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.buttonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 12,
    borderRadius: 4,
    width: 250,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonChangePassword: {
    backgroundColor: "orange",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ProfileSettings;
