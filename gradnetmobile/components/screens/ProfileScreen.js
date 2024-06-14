import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import APIs, { authAPI, endpoints } from "../../configs/APIs";

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userResponse = await authAPI(token).get(
          endpoints["current-user"]
        );
        setUser(userResponse.data);

        const postsResponse = await APIs.get(
          endpoints["current-user"](userResponse.data.id),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPosts(postsResponse.data.results);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditPost = (post) => {
    navigation.navigate("EditPost", { post });
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await APIs.delete(endpoints["delete_post"](postId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to delete post.");
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user.cover ? (
        <Image source={{ uri: user.cover }} style={styles.cover} />
      ) : (
        <Image source={{ uri: user.cover }} style={styles.cover} />
      )}

      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: "https://99designs-blog.imgix.net/blog/wp-content/uploads/2019/07/attachment_54824442.png?auto=format&q=60&fit=max&w=930",
          }}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.name}>
        {user.first_name} {user.last_name}
      </Text>
      <Text style={styles.username}>@{user.username}</Text>

      {posts.map((post) => (
        <Card key={post.id} style={styles.postCard}>
          <Card.Title title={post.title} subtitle={post.created_at} />
          <Card.Content>
            <Text>{post.content}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => handleEditPost(post)}>Edit</Button>
            <Button onPress={() => handleDeletePost(post.id)}>Delete</Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cover: {
    width: "100%",
    height: 200,
  },
  avatarContainer: {
    marginTop: -50,
    marginBottom: 10,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  username: {
    fontSize: 18,
    color: "gray",
  },
  postCard: {
    width: "100%",
    marginVertical: 10,
  },
});

export default ProfileScreen;
