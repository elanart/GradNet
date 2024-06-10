
import React, { useEffect, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const CreatePost = ({ onPostCreated }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [selectedImageURI, setSelectedImageURI] = useState(null);
  const [selectedVideoURI, setSelectedVideoURI] = useState(null);
  const [postContent, setPostContent] = useState("");

  const showCreatePostModal = () => {
    setIsModalVisible(true);
  };

  const closeCreatePostModal = () => {
    setIsModalVisible(false);
    setSelectedImageURI(null);
    setSelectedVideoURI(null);
    setPostContent("");
  };

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login", {
          redirect: "CreatePost",
        });
        return;
      }
      const response = await authAPI(token).get(endpoints["current-user"]);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 401) {
        navigation.navigate("Login", {
          redirect: "CreatePost",
        });
      } else {
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi lấy thông tin người dùng.");
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const pickMedia = async (type) => {
    let permissionResult;
    if (type === "image") {
      permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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

  const handleSubmitPost = async () => {
    if (!postContent.trim()) {
      Alert.alert("Thông báo", "Nội dung bài viết không được để trống.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      formData.append("content", postContent);
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

      const response = await authAPI(token).post(endpoints["posts"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        onPostCreated(response.data);
        closeCreatePostModal();
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài viết:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng bài viết.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.createPostContainer}>
        {user && <Image source={{ uri: user.avatar }} style={styles.avatar} />}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={showCreatePostModal}
        >
          <Text style={styles.inputPlaceholder}>
            {user
              ? `${user.first_name} ${user.last_name} đang nghĩ gì thế?`
              : "Đang tải..."}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionContainer}>
        <View style={styles.actionButton}>
          <Icon name="video-camera" type="font-awesome" color="red" />
          <Text style={styles.actionText}>Video trực tiếp</Text>
        </View>
        <View style={styles.actionButton}>
          <Icon name="image" type="font-awesome" color="green" />
          <Text style={styles.actionText}>Ảnh/video</Text>
        </View>
        <View style={styles.actionButton}>
          <Icon name="smile-o" type="font-awesome" color="orange" />
          <Text style={styles.actionText}>Cảm xúc/hoạt động</Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeCreatePostModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo bài viết</Text>
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
              placeholder="Bạn đang nghĩ gì thế?"
              multiline
              value={postContent}
              onChangeText={setPostContent}
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
              onPress={handleSubmitPost}
            >
              <Text style={styles.modalPostButtonText}>Đăng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeCreatePostModal}
            >
              <Icon name="close" type="font-awesome" color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f2f5",
    padding: 10,
    marginBottom: 10,
  },
  createPostContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
  },
  inputPlaceholder: {
    color: "#606770",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
    color: "#606770",
  },
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
    height: 100,
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
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#000",
  },
});

export default CreatePost;