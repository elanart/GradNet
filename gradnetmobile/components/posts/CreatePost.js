import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { authAPI, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from "expo-image-picker";

const CreatePost = ({ onPostCreated }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [selectedImageURI, setSelectedImageURI] = useState(null);
  const [postContent, setPostContent] = useState("");// state cho nội dung bài viết
  const showCreatePostModal = () => {
    setIsModalVisible(true);
  };

  const closeCreatePostModal = () => {
    setIsModalVisible(false);
    setSelectedImageURI(null);
    setPostContent("");
  };
    // lấy user để hiển thị ảnh và tên của người đang đăng nhập 
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await authAPI(token).get(endpoints["current-user"]);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 401) {
        Alert.alert(
          "Thông báo",
          "Bạn cần đăng nhập để tiếp tục.",
          [
            {
              text: "Đăng nhập",
              onPress: () => navigation.navigate("Login"),
            },
            {
              text: "Hủy",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi lấy thông tin người dùng.");
      }
    }
  };
  // thực hiện fetch từ server
  useEffect(() => {
    fetchUserData();
  }, []);

  const picker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Gradnet", "Quyền truy cập bị từ chối!");
    } else {
      try {
        const res = await ImagePicker.launchImageLibraryAsync();
        console.log("Response from ImagePicker:", res); // Log response for debugging
        if (!res.canceled && res.assets && res.assets.length > 0) { // Kiểm tra nếu có hình ảnh được chọn và URI không rỗng
          setSelectedImageURI(res.assets[0].uri);
        }
      } catch (error) {
        console.error("Lỗi khi chọn ảnh:", error);
      }
    }
  };
  const handleSubmitPost = async () => {
    // kiểm rea nội dung bài viết và hình ảnh không được để trống hoặc có kí tự khoảng trắng 
    if (!postContent.trim() && !selectedImageURI) {
      Alert.alert("Thông báo", "Nội dung bài viết không được để trống.");
      return;
    }

    try {
        
      const token = await AsyncStorage.getItem("token");
      // khai báo dữ liệu biểu mẫu 
      const formData = new FormData();
      
      formData.append("content", postContent);// dữ liệu nội dung bài viết được thêm vào với khóa là "Caption"
      if (selectedImageURI) {
        const uriParts = selectedImageURI.split("."); // tách URI của hình ảnh từng phần dựa trên dấu chấm để xác định loại tệp
        const fileType = uriParts[uriParts.length - 1];// lấy đuôi type ( ví dụ Jpg, png)
        formData.append("media", {   // đối tượng chứa thông tin về hình ảnh được  thêm vào với khóa là media
          uri: selectedImageURI,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }
      // gửi yêu cầu đăng bài viết lên server kèm theo formData
      const response = await authAPI(token).post(endpoints["posts"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201) { // nếu thành công thì gọi hàm onPostCreated
        onPostCreated(response.data);
        closeCreatePostModal();
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài viết:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng bài viết.");
    }
  };


  useEffect(() => {
    console.log("Selected Image URI:", selectedImageURI);
  }, [selectedImageURI]);

  return (
    <View style={styles.container}>
      <View style={styles.createPostContainer}>
        {user && (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        )}
        <TouchableOpacity style={styles.inputContainer} onPress={showCreatePostModal}>
          <Text style={styles.inputPlaceholder}>{user ? `${user.first_name} ${user.last_name} đang nghĩ gì thế?` : "Đang tải..."}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionContainer}>
        <View style={styles.actionButton}>
          <Icon name="video-camera" type="font-awesome" color="red" />
          <Text style={styles.actionText}>Video trực tiếp</Text>
        </View>
        <View style={styles.actionButton} >
          <Icon name="image" type="font-awesome" color="green"  />
          <Text style={styles.actionText}>Ảnh/video</Text>
        </View>
        <View style={styles.actionButton}>
          <Icon name="smile-o" type="font-awesome" color="orange" />
          <Text style={styles.actionText}>Cảm xúc/hoạt động</Text>
        </View>
      </View>

      {/* Modal for creating a post */}
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
              <Image source={{ uri: selectedImageURI }} style={styles.selectedImage} />
            )}
            <View style={styles.modalHeader}>
              {user && (
                <Image source={{ uri: user.avatar }} style={styles.modalAvatar} />
              )}
              <View>
                <Text style={styles.modalUsername}>{user ? `${user.first_name} ${user.last_name}` : "Người dùng"}</Text>
              </View>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Bạn đang nghĩ gì thế?"
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalActionButton}>
                <Icon name="font" type="font-awesome" color="purple" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionButton} onPress={picker}>
                <Icon name="image" type="font-awesome" color="green" />
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
            <TouchableOpacity style={styles.modalPostButton} onPress={handleSubmitPost}>
              <Text style={styles.modalPostButtonText}>Đăng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeCreatePostModal}>
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
    backgroundColor: '#f0f2f5',
    padding: 10,
    marginBottom: 10,  // Add margin to separate it from other content
  },
  createPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
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
    backgroundColor: '#f0f2f5',
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
  },
  inputPlaceholder: {
    color: '#606770',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: '#606770',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  modalPrivacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  modalPrivacyText: {
    marginRight: 5,
    color: '#606770',
  },
  modalInput: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginTop: 10,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  modalActionButton: {
    padding: 10,
  },
  modalPostButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  modalPostButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  selectedImage: {
    width: '100%',
    height: 200, // Adjust the height of the selected image as needed
    borderRadius: 10,
    marginBottom: 10, // Space between image and TextInput
  },
});

export default CreatePost;
