import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Button, Alert, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, endpoints } from '../../configs/APIs';
import * as ImagePicker from 'expo-image-picker';
import { Avatar, Card, Icon } from 'react-native-paper';
import MyStyles from '../../styles/MyStyles';
import Post from '../posts/Post';
const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const reactions = [
    { id: 1, name: 'thumb-up-outline', label: 'Thích' },
    { id: 2, name: 'heart-outline', label: 'Yêu' },
    { id: 3, name: 'emoticon-happy-outline', label: 'Haha' },
    { id: 4, name: 'emoticon-surprised-outline', label: 'Wow' },
    { id: 5, name: 'emoticon-sad-outline', label: 'Buồn' },
    { id: 6, name: 'emoticon-angry-outline', label: 'Phẫn nộ' }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserPosts(user.id);
    }
  }, [user]);

  const handleAction = async (action, post) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert(
        "Thông báo",
        "Bạn cần đăng nhập để thực hiện thao tác này.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
      return;
    }
    // Thực hiện hành động cảm xúc
    console.log(`Thực hiện hành động: ${action} trên bài viết: ${post.id}`);
    setShowReactions(false);
  };

  const toggleReactions = (post) => {
    setSelectedPost(post);
    setShowReactions(!showReactions);
  };
 

  const loadMore = ({ nativeEvent }) => {
    if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
      console.info(Math.random());
      setPage(page + 1);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await authAPI(token).get(endpoints["current-user"]);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await authAPI(token).get(`${endpoints.posts}?userId=${userId}`);
      setPosts(response.data.results);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedImage(result.uri);
      // Save the selected image to user profile or other necessary actions here
    }
  };

  const renderImageModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Button title="View Image" onPress={() => setSelectedImage(user.avatar)} />
          <Button title="Change Image" onPress={handleImagePicker} />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={{ uri: 'https://your-cloudinary-url/cover.jpg' }}
            style={styles.coverImage}
          />
        </TouchableOpacity>
        {user && (
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={styles.name}>{user ? `${user.first_name} ${user.last_name}` : "Loading..."}</Text>
      <ScrollView 
        contentContainerStyle={MyStyles.scrollViewContent}
        onScroll={loadMore}
        scrollEventThrottle={400}
      >
        {loading && <ActivityIndicator />}
        {posts.map((p) => (
          <Card key={p.id} style={MyStyles.card}>
            <Card.Title
              title={`${p.user.first_name} ${p.user.last_name}`}
              subtitle={new Date(p.created_date).toLocaleString()}
              left={() => (
                <Avatar.Image size={40} source={{ uri: p.user.avatar }} />
              )}
            />
            <Card.Content>
              <Text>{p.caption}</Text>
              {p.media.length > 0 && (
                <Image style={MyStyles.media} source={{ uri: p.media[0].file }} />
              )}
            </Card.Content>
            <Card.Actions style={MyStyles.cardActions}>
              <TouchableOpacity style={MyStyles.actionButton} onPress={() => toggleReactions(p)}>
                <Icon name="thumb-up-outline" size={20} />
                <Text style={MyStyles.actionText}>Thích</Text>
              </TouchableOpacity>
              <TouchableOpacity style={MyStyles.actionButton}>
                <Icon name="comment-outline" size={20} />
                <Text style={MyStyles.actionText}>Bình luận</Text>
              </TouchableOpacity>
              <TouchableOpacity style={MyStyles.actionButton}>
                <Icon name="share-outline" size={20} />
                <Text style={MyStyles.actionText}>Chia sẻ</Text>
              </TouchableOpacity>
            </Card.Actions>
            {showReactions && selectedPost && selectedPost.id === p.id && (
              <View style={MyStyles.reactionContainer}>
                {reactions.map((reaction) => (
                  <TouchableOpacity key={reaction.id} onPress={() => handleAction(reaction.label, p)}>
                    <Icon name={reaction.name} size={30} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        ))}
        {loading && <ActivityIndicator size="large" />}
      </ScrollView>
      {renderImageModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -50,
    left: 20,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
  },
  name: {
    marginTop: 60,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  postContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
});

export default ProfileScreen;
