// AddComment.js
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs from "../../configs/APIs";

const AddComment = ({ postId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState("");
  const navigation = useNavigation();

  const handleCommentSubmit = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert(
        "Thông báo",
        "Bạn cần đăng nhập để thực hiện thao tác này.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
      return;
    }

    try {
      if (!commentText) {
        Alert.alert("Thông báo", "Bạn chưa nhập nội dung bình luận.");
        return;
      }

      const formData = new FormData();
      formData.append('content', commentText);

      const response = await APIs.post(`/posts/${postId}/add-comment/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const newComment = response.data;

      // Gọi callback để thông báo đã thêm bình luận
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }

      // Clear comment input after submit
      setCommentText("");
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nhập bình luận..."
        value={commentText}
        onChangeText={setCommentText}
      />
      <Button title="Gửi" onPress={handleCommentSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
});

export default AddComment;
