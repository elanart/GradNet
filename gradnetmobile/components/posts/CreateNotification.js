import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Icon } from "react-native-elements";
import { authAPI, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

const CreateNotification = ({ isVisible, onClose, user, onNotificationCreated }) => {
  const [selectedImageURI, setSelectedImageURI] = useState(null);
  const [selectedVideoURI, setSelectedVideoURI] = useState(null);
  const [invitationContent, setInvitationContent] = useState({
    title: "",
    content: "",
    location: "",
    recipients_users: "",
    recipients_groups: "",
  });

  const pickMedia = async (type) => {
    let permissionResult;
    if (type === "image") {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    } else if (type === "video") {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    }

    if (permissionResult.status !== "granted") {
      Alert.alert("Quyền truy cập bị từ chối!");
      return;
    }

    let result;
    if (type === "image") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
    } else if (type === "video") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });
    }

    if (!result.canceled && result.assets.length > 0) {
      if (type === "image") {
        setSelectedImageURI(result.assets[0].uri);
      } else if (type === "video") {
        setSelectedVideoURI(result.assets[0].uri);
      }
    } 
  };

  const handleSubmitInvitation = async () => {
    const { title, content, location, recipients_users, recipients_groups } = invitationContent;

    if (!title.trim() || !content.trim()) {
      Alert.alert("Thông báo", "Tiêu đề và nội dung thông báo không được để trống.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", content);
      formData.append("location", location);
      formData.append("recipients_users", recipients_users);
      formData.append("recipients_groups", recipients_groups);
      if (selectedImageURI) {
        const uriParts = selectedImageURI.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("media_image", {
          uri: selectedImageURI,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }
      if (selectedVideoURI) {
        const uriParts = selectedVideoURI.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("media_video", {
          uri: selectedVideoURI,
          name: `video.${fileType}`,
          type: `video/${fileType}`,
        });
      }

      const response = await authAPI(token).post(endpoints["invitation"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        onNotificationCreated(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi tạo thông báo:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo thông báo.");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tạo thông báo</Text>
          {selectedImageURI && (
            <Image
              source={{ uri: selectedImageURI }}
              style={styles.selectedImage}
            />
          )}
          {selectedVideoURI && (
            <View style={styles.selectedVideo}>
              <Text>Video đã chọn</Text>
            </View>
          )}
          <View style={styles.modalHeader}>
            {user && (
              <Image
                source={{ uri: user.avatar }}
                style={styles.modalAvatar}
              />
            )}
            <View>
              <Text style={styles.modalUsername}>
                {user ? `${user.first_name} ${user.last_name}` : "Người dùng"}
              </Text>
            </View>
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Tiêu đề"
            value={invitationContent.title}
            onChangeText={(text) => setInvitationContent({ ...invitationContent, title: text })}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Nội dung"
            multiline
            value={invitationContent.content}
            onChangeText={(text) => setInvitationContent({ ...invitationContent, content: text })}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Địa điểm"
            value={invitationContent.location}
            onChangeText={(text) => setInvitationContent({ ...invitationContent, location: text })}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="ID người nhận (cách nhau bằng dấu phẩy)"
            value={invitationContent.recipients_users}
            onChangeText={(text) => setInvitationContent({ ...invitationContent, recipients_users: text })}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="ID nhóm nhận (cách nhau bằng dấu phẩy)"
            value={invitationContent.recipients_groups}
            onChangeText={(text) => setInvitationContent({ ...invitationContent, recipients_groups: text })}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalActionButton}>
              <Icon name="font" type="font-awesome" color="purple" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => pickMedia("image")}
            >
              <Icon name="image" type="font-awesome" color="green" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => pickMedia("video")}
            >
              <Icon name="video-camera" type="font-awesome" color="red" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalActionButton}>
              <Icon name="smile-o" type="font-awesome" color="orange" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalActionButton}>
              <Icon name="map-marker" type="font-awesome" color="red" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalActionButton}>
              <Icon name="gift" type="font-awesome" color="blue" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.modalPostButton}
            onPress={handleSubmitInvitation}
          >
            <Text style={styles.modalPostButtonText}>Tạo thông báo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Icon name="close" type="font-awesome" color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  modalUsername: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalInput: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    marginTop: 10,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  modalActionButton: {
    padding: 10,
  },
  modalPostButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  modalPostButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedVideo: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});

export default CreateNotification;
