import React, { useState, useEffect } from "react";
import { Image, ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import MyStyles from "../../styles/MyStyles";
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, Card, List, Searchbar, Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import CreatePost from "./CreatePost";

// Icon cảm xúc
export const reactions = [
  { id: 1, name: 'thumb-up-outline', label: 'Thích', color: '#3b5998' },
  { id: 2, name: 'heart-outline', label: 'Yêu', color: '#e0245e' },
  { id: 3, name: 'emoticon-happy-outline', label: 'Haha', color: '#f7b125' },
  { id: 4, name: 'emoticon-surprised-outline', label: 'Wow', color: '#ffac33' },
  { id: 5, name: 'emoticon-sad-outline', label: 'Buồn', color: '#1c1e21' },
  { id: 6, name: 'emoticon-angry-outline', label: 'Phẫn nộ', color: '#d52834' },
];

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigation = useNavigation();

  const loadPosts = async () => {
    if (page > 0) {
      setLoading(true);
      let url = `${endpoints.posts}?q=${keyword}&page=${page}`;
      try {
        let res = await APIs.get(url);
        if (page === 1) setPosts(res.data.results);
        else setPosts((current) => [...current, ...res.data.results]);

        if (res.data.next === null) setPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPosts();
  }, [keyword, page]);

  const loadMore = ({ nativeEvent }) => {
    if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
      setPage(page + 1);
    }
  };

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
    try {
      // Gửi yêu cầu đến backend để thực hiện hành động like/unlike
      const response = await APIs.post(
        `${endpoints.posts}/${post.id}/add-action/`,
        { type: action },
        { headers: { 'Content-Type': 'application/json' } }
      );
      // Cập nhật trạng thái của bài viết sau khi đã thực hiện hành động
      setPosts((currentPosts) =>
        currentPosts.map((p) =>
          p.id === post.id ? { ...p, reaction: response.data.type } : p
        )
      );
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động:", error);
    }
    setShowReactions(false);
  };

  const toggleReactions = (post) => {
    setSelectedPost(post);
    setShowReactions(!showReactions);
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={MyStyles.container}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
          DANH MỤC BÀI VIẾT
        </Text>
      </View>
      <View style={MyStyles.searchBar}>
        <Searchbar
          placeholder="Nhập từ khóa..."
          onChangeText={setKeyword}
          value={keyword}
        />
      </View>

      <CreatePost onPostCreated={handlePostCreated} />
      <ScrollView 
        contentContainerStyle={MyStyles.scrollViewContent}
        onScroll={loadMore}
        scrollEventThrottle={400}
      >
        {loading && <ActivityIndicator />}
        {posts.map((p) => {
          const currentReaction = reactions.find(r => r.label === p.reaction);
          return (
            <Card key={p.id} style={MyStyles.card}>
              <Card.Title
                title={`${p.user.first_name} ${p.user.last_name}`}
                subtitle={new Date(p.created_date).toLocaleString()}
                left={() => (
                  <Avatar.Image size={40} source={{ uri: p.user.avatar }} />
                )}
              />
              <Card.Content>
                <Text>{p.content}</Text>
                {p.media.length > 0 && (
                  <Image style={MyStyles.media} source={{ uri: p.media[0].file }} />
                )}
              </Card.Content>
              <Card.Actions style={MyStyles.cardActions}>
                <View style={MyStyles.actionContainer}>
                  <TouchableOpacity style={MyStyles.actionButton} onPress={() => toggleReactions(p)}>
                    <Icon name={currentReaction ? currentReaction.name : "thumb-up-outline"} size={20} color={currentReaction ? currentReaction.color : undefined} />
                    <Text style={[MyStyles.actionText, { color: currentReaction ? currentReaction.color : undefined }]}>{currentReaction ? currentReaction.label : "Thích"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={MyStyles.actionButton}>
                    <Icon name="comment-outline" size={20} />
                    <Text style={MyStyles.actionText}>Bình luận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={MyStyles.actionButton}>
                    <Icon name="share-outline" size={20} />
                    <Text style={MyStyles.actionText}>Chia sẻ</Text>
                  </TouchableOpacity>
                </View>
                {showReactions && selectedPost && selectedPost.id === p.id && (
                  <View style={MyStyles.reactionsContainer}>
                    {reactions.map((reaction) => (
                      <TouchableOpacity key={reaction.id} style={MyStyles.reactionButton} onPress={() => handleAction(reaction.label, p)}>
                        <Icon name={reaction.name} size={30} color={reaction.color} />
                        <Text style={MyStyles.reactionText}>{reaction.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Card.Actions>
            </Card>
          );
        })}
        {loading && <ActivityIndicator size="large" />}
      </ScrollView>
    </View>
  );
};

export default Post;
