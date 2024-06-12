import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet
} from "react-native";
import MyStyles from "../../styles/MyStyles"; // Assuming MyStyles exists
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import {
  ActivityIndicator,
  Card,
  Searchbar,
  Avatar,
  Button,
  Menu
} from "react-native-paper";
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
  const [postReactions, setPostReactions] = useState({}); // Track reactions for each post
  const [commentingPostId, setCommentingPostId] = useState(null); // Track which post is being commented
  const [comments, setComments] = useState({}); // Track comments for each post
  const [commentText, setCommentText] = useState(""); // Track the current comment text
  const [selectedComment, setSelectedComment] = useState(null); // Selected comment for edit/delete
  const [editingCommentText, setEditingCommentText] = useState(""); // Text of the comment being edited
  const [menuVisible, setMenuVisible] = useState(false); // Track menu visibility

  const loadPosts = async () => {
    if (page > 0) {
      setLoading(true);
      let url = `${endpoints.posts}?q=${keyword}&page=${page}`;
      try {
        let res = await APIs.get(url);
        if (page === 1) setPosts(res.data.results);
        else setPosts((current) => [...current, ...res.data.results]);

        if (res.data.next === null) setPage(0);

        // Lấy phản ứng và bình luận cho các bài viết
        const postIds = res.data.results.map(post => post.id);
        await fetchReactionsAndComments(postIds);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchReactionsAndComments = async (postIds) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found");
      }

      const postsWithReactionsAndComments = await Promise.all(
        postIds.map(async (postId) => {
          try {
            const reactionsUrl = `${endpoints.posts}/${postId}/get-actions/`;
            console.log(`Fetching reactions from ${reactionsUrl}`);
            const reactionsRes = await APIs.get(reactionsUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const reactions = reactionsRes.data;
            console.log(`Reactions for post ${postId}:`, reactions);

            const commentsUrl = `${endpoints.posts}/${postId}/get-comments/`;
            console.log(`Fetching comments from ${commentsUrl}`);
            const commentsRes = await APIs.get(commentsUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const comments = commentsRes.data;
            console.log(`Comments for post ${postId}:`, comments);

            return {
              postId,
              reactions,
              comments,
            };
          } catch (ex) {
            console.error(`Failed to fetch data for post ${postId}:`, ex);
            return {
              postId,
              reactions: [],
              comments: [],
            };
          }
        })
      );

      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          const postData = postsWithReactionsAndComments.find(
            (data) => data.postId === post.id
          );
          if (postData) {
            return {
              ...post,
              reactions: postData.reactions,
              comments: postData.comments,
            };
          }
          return post;
        })
      );
    } catch (ex) {
      console.error("Failed to fetch reactions and comments:", ex);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [keyword, page]);

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const loadMore = ({ nativeEvent }) => {
    if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
      setPage(page + 1);
    }
  };

  const handleAction = async (actionLabel, post) => {
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
      const selectedReaction = reactions.find(reaction => reaction.label === actionLabel);
      if (!selectedReaction) {
        console.error(`Không tìm thấy phản ứng cho hành động: ${actionLabel}`);
        return;
      }

      const formData = new FormData();
      formData.append('type', selectedReaction.id);

      const response = await APIs.post(`/posts/${post.id}/add-action/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedAction = response.data;

      setPosts((currentPosts) => {
        return currentPosts.map((p) => {
          if (p.id === post.id) {
            let updatedReactions;
            if (updatedAction.is_active) {
              updatedReactions = Array.isArray(p.reactions)
                ? p.reactions.map(r => r.user.id === updatedAction.user.id ? updatedAction : r)
                : [updatedAction];
              p.reacted = true;
            } else {
              updatedReactions = Array.isArray(p.reactions)
                ? p.reactions.filter(r => r.user.id !== updatedAction.user.id)
                : [];
              p.reacted = false;
            }

            return { ...p, reactions: updatedReactions };
          }
          return p;
        });
      });

      // Update the postReactions state to show the selected reaction or null if unliked
      setPostReactions((current) => {
        if (updatedAction.is_active) {
          return {
            ...current,
            [post.id]: selectedReaction
          };
        } else {
          const { [post.id]: _, ...rest } = current;
          return rest;
        }
      });
    } catch (error) {
      console.error('Error updating reactions:', error);
    }

    setShowReactions(false);
  };

  const toggleReactions = (post) => {
    setSelectedPost(post);
    setShowReactions(!showReactions);
  };

  const handleLikeButtonPress = (post) => {
    const currentReaction = postReactions[post.id];

    if (currentReaction) {
      handleAction(currentReaction.label, post);
    } else {
      toggleReactions(post);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleCommentButtonPress = (postId) => {
    setCommentingPostId(commentingPostId === postId ? null : postId);
  };

  const handleCommentSubmit = async (postId) => {
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
      const formData = new FormData();
      formData.append('content', commentText);

      const response = await APIs.post(`/posts/${postId}/add-comment/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const newComment = response.data;

      setComments((currentComments) => {
        return {
          ...currentComments,
          [postId]: [...(currentComments[postId] || []), newComment]
        };
      });

      setCommentText("");
      setCommentingPostId(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const [selectedCommentId, setSelectedCommentId] = useState(null);////

  const handleEditComment = (commentId, postId) => {
    setSelectedCommentId(commentId);////
    const commentToEdit = comments[postId].find(comment => comment.id === commentId);
    if (commentToEdit) {
      setSelectedComment(commentToEdit);
      setEditingCommentText(commentToEdit.content);
    }
  };







const handleDeleteComment = async (commentId, postId, ) => {
    const token = await AsyncStorage.getItem("token");
    console.log("------------re---------", token);

    if (!token) {
        Alert.alert(
            "Thông báo",
            "Bạn cần đăng nhập để thực hiện thao tác này.",
            [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
        return;
    }

    try {
        const formData = new FormData();
        formData.append('comment_id', commentId);
  
        console.log('FormData:', formData);

        const api = authAPI(token);
        const response = await api({
            method: 'DELETE',
            url: `/posts/${postId}/delete-comment/`,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        });

        console.log("Response:", response);

        if (response.status === 204) {
            setComments((currentComments) => {
                return {
                    ...currentComments,
                    [postId]: currentComments[postId].filter(comment => comment.id !== commentId)
                };
            });
        }
    } catch (error) {
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error request:', error.request);
        } else {
            console.error('Error message:', error.message);
        }

        if (error.response && error.response.status === 401) {
            Alert.alert(
                "Unauthorized",
                "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.",
                [{ text: "OK", onPress: () => navigation.navigate("Login") }]
            );
        } else {
            Alert.alert(
                "Network Error",
                "Có lỗi xảy ra khi kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn và thử lại.",
                [{ text: "OK" }]
            );
        }
    } finally {
        setSelectedCommentId(null);
    }
};


  const handleCommentUpdateSubmit = async (commentId, postId) => {
    const token = await AsyncStorage.getItem("token");
    console.log("-------------respone---------------", token );
    if (!token) {
      Alert.alert(
        "Thông báo",
        "Bạn cần đăng nhập để thực hiện thao tác này.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('comment_id', commentId);
      formData.append('content', editingCommentText);
  
      const response = await APIs.post(`/posts/${postId}/update-comment/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const updatedComment = response.data;
  
      setComments((currentComments) => {
        return {
          ...currentComments,
          [postId]: currentComments[postId].map(comment =>
            comment.id === updatedComment.id ? updatedComment : comment
          )
        };
      });
  
      setSelectedComment(null);
      setEditingCommentText("");
    } catch (error) {
      console.error('Error updating comment:', error);
    }
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
          const currentReaction = postReactions[p.id]; // Get the selected reaction for this post
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

                {p.media.length > 0
                  && (
                    <Image style={MyStyles.media} source={{ uri: p.media[0].file }} />
                  )}
              </Card.Content>
              <Card.Actions style={MyStyles.cardActions}>
                <View style={MyStyles.actionContainer}>
                  <TouchableOpacity style={MyStyles.actionButton} onPress={() => handleLikeButtonPress(p)}>
                    <Icon name={currentReaction ? currentReaction.name : "thumb-up-outline"} size={20} color={currentReaction ? currentReaction.color : undefined} />
                    <Text style={[MyStyles.actionText, { color: currentReaction ? currentReaction.color : undefined }]}>
                      {currentReaction ? currentReaction.label : "Thích"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={MyStyles.actionButton} onPress={() => handleCommentButtonPress(p.id)}>
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
                      <TouchableOpacity key={reaction.label} style={MyStyles.reactionButton} onPress={() => handleAction(reaction.label, p)}>
                        <Icon name={reaction.name} size={30} color={reaction.color} />
                        <Text style={MyStyles.reactionText}>{reaction.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Card.Actions>
              {commentingPostId === p.id && (
                <View style={MyStyles.commentInputContainer}>
                  <TextInput
                    style={MyStyles.commentInput}
                    placeholder="Viết bình luận..."
                    value={commentText}
                    onChangeText={setCommentText}
                  />
                  <Button mode="contained" onPress={() => handleCommentSubmit(p.id)}>
                    Bình luận
                  </Button>
                </View>
              )}
              {comments[p.id] && comments[p.id].map((comment) => (
                <View key={comment.id} style={styles.commentContainer}>
                  <Avatar.Image size={24} source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUserName}>
                      {comment.user.first_name} {comment.user.last_name}
                    </Text>
                    {selectedComment && selectedComment.id === comment.id ? (
                      <View style={styles.editingCommentContainer}>
                        <TextInput
                          style={styles.commentInput}
                          value={editingCommentText}
                          onChangeText={setEditingCommentText}
                        />
                        <Button mode="contained" onPress={() => handleCommentUpdateSubmit(comment.id, p.id)}>
                          Cập nhật
                        </Button>
                      </View>
                    ) : (
                      <Text>{comment.content}</Text>
                    )}
                  </View>
                  <Menu
                  visible={selectedCommentId === comment.id}
                
                    
                  
                    onDismiss={() => setSelectedCommentId(null)}
                    anchor={
                      <TouchableOpacity onPress={() =>  setSelectedCommentId(comment.id)}>
                        <Icon name="dots-vertical" size={20} />
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item onPress={() => handleEditComment(comment.id, p.id)} title="Chỉnh sửa" />
                    <Menu.Item onPress={() => handleDeleteComment(comment.id, p.id)} title="Xóa" />
                  </Menu>
                </View>
              ))}

            </Card>
          );
        })}
        {loading && <ActivityIndicator size="large" />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd"
  },
  commentAvatar: {
    marginRight: 8
  },
  commentContent: {
    flex: 1
  },
  commentUserName: {
    fontWeight: "bold"
  },
  commentInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  editingCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

export default Post;
