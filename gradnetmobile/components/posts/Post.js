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
const reactions = [
  { id: 1, name: 'thumb-up-outline', label: 'Thích' },
  { id: 2, name: 'heart-outline', label: 'Yêu' },
  { id: 3, name: 'emoticon-happy-outline', label: 'Haha' },
  { id: 4, name: 'emoticon-surprised-outline', label: 'Wow' },
  { id: 5, name: 'emoticon-sad-outline', label: 'Buồn' },
  { id: 6, name: 'emoticon-angry-outline', label: 'Phẫn nộ' }
];

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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
      console.info(Math.random());
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
    // Thực hiện hành động cảm xúc
    console.log(`Thực hiện hành động: ${action} trên bài viết: ${post.id}`);
    setShowReactions(false);
  };

  const toggleReactions = (post) => {
    setSelectedPost(post);
    setShowReactions(!showReactions);
  };
  // Hàm này được truyền đến thành phần CreatePost.
   //Khi một bài viết mới được tạo, hàm này sẽ được gọi với bài viết mới,
   // và nó sẽ cập nhật danh sách bài viết (posts) để hiển thị bài viết mới ở đầu danh sách.
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
    </View>
  );
};

export default Post;
