import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,
} from "react-native";
import MyStyles from "../../styles/MyStyles"; // Assuming MyStyles exists
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import {
  ActivityIndicator,
  Card,
  Searchbar,
  Avatar,
  Button,
  Menu,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import CreatePost from "./CreatePost";
import { PostStyles } from "./Styles";
import { reactions } from "../../configs/constants";

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPostContent, setEditingPostContent] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postReactions, setPostReactions] = useState({}); // Track reactions for each post
  const [commentingPostId, setCommentingPostId] = useState(null); // Track which post is being commented
  const [comments, setComments] = useState({}); // Track comments for each post
  const [commentText, setCommentText] = useState(""); // Track the current comment text
  const [selectedComment, setSelectedComment] = useState(null); // Selected comment for edit/delete
  const [editingCommentText, setEditingCommentText] = useState(""); // Text of the comment being edited
  const [menuVisible, setMenuVisible] = useState(false); // Track menu visibility
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    loadPosts();
  }, [keyword, page]);

  //======================Post==================================

  // Nạp post
  const loadPosts = async () => {
    if (page > 0) {
      setLoading(true);
      let url = `${endpoints["posts"]}?q=${keyword}&page=${page}`;
      try {
        let res = await APIs.get(url);
        if (page === 1) setPosts(res.data.results);
        else setPosts((current) => [...current, ...res.data.results]);

        if (res.data.next === null) setPage(0);

        // Lấy phản ứng và bình luận cho các bài viết
        const postIds = res.data.results.map((post) => post.id);
        await fetchReactionsAndComments(postIds);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  // Kiểm tra xem đã cuộn đến cuối danh sách chưa
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  // Tải thêm bài viết khi cuộn đến cuối
  const loadMore = ({ nativeEvent }) => {
    if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
      setPage(page + 1);
    }
  };

  // Hàm xử lý tạo post
  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  // Tìm kiếm post cần chỉnh sửa
  const handleEditPost = (postId) => {
    const post = posts.find((post) => post.id === postId);
    setSelectedPost(post);
    setEditingPostContent(post.content);
  };

  // Hàm xử lý event gửi cập nhật bài viết
  const handlePostUpdateSubmit = async (postId) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", editingPostContent);

      const response = await authAPI(token).patch(
        `${endpoints["posts"]}/${postId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedPost = response.data;

      setPosts((currentPosts) => {
        return currentPosts.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        );
      });

      setSelectedPost(null);
      setEditingPostContent("");
    } catch (error) {
      console.error("Lỗi không thể cập nhật bài viết:", error);
      Alert.alert(
        "Không thể cập nhật bài viết",
        "Xem lại nội dung cập nhật và quyền sở hữu bài viết"
      );
    }
  };

  // Hàm xử lý event xóa bài viết
  const handleDeletePost = async (postId) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }

    try {
      let url = `${endpoints["posts"]}/${postId}/`;
      const response = await authAPI(token).delete(url);

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      );
    } catch (error) {
      console.error("Lỗi không thể xóa bài viết:", error);
      Alert.alert("Error", "Lỗi không thể xóa bài viết");
    }
  };

  // =======================Action=======================

  const fetchReactionsAndComments = async (postIds) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found");
      }

      const postsWithReactionsAndComments = await Promise.all(
        postIds.map(async (postId) => {
          try {
            //   const reactionsUrl = `${endpoints.posts}/${postId}/get-actions/`;
            //   const reactionsRes = await APIs.get(reactionsUrl, {
            //     headers: {
            //       Authorization: `Bearer ${token}`,
            //       'Content-Type': 'application/json'
            //     }
            //   });
            // const reactions = reactionsRes.data;

            const commentsUrl = `${endpoints.posts}/${postId}/get-comments/`;
            const commentsRes = await APIs.get(commentsUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            const comments = commentsRes.data.results;

            return {
              postId,
              // reactions,
              comments,
            };
          } catch (ex) {
            console.error(`Failed to fetch data for post ${postId}:`, ex);
            return {
              postId,
              // reactions: [],
              comments: [],
            };
          }
        })
      );

      setComments((currentComments) => {
        const newComments = { ...currentComments };
        postsWithReactionsAndComments.forEach(({ postId, comments }) => {
          newComments[postId] = comments;
        });
        return newComments;
      });

      setPosts((currentPosts) => {
        return currentPosts.map((post) => {
          const postData = postsWithReactionsAndComments.find(
            (data) => data.postId === post.id
          );
          if (postData) {
            return {
              ...post,
              reactions: postData.reactions,
            };
          }
          return post;
        });
      });
    } catch (ex) {
      console.error("Failed to fetch reactions and comments:", ex);
    }
  };

  const handleAction = async (actionLabel, post) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để thực hiện thao tác này.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    try {
      const selectedReaction = reactions.find(
        (reaction) => reaction.label === actionLabel
      );
      if (!selectedReaction) {
        console.error(`Không tìm thấy phản ứng cho hành động: ${actionLabel}`);
        return;
      }

      const formData = new FormData();
      formData.append("type", selectedReaction.id);

      const response = await APIs.post(
        `/posts/${post.id}/add-action/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedAction = response.data;

      setPosts((currentPosts) => {
        return currentPosts.map((p) => {
          if (p.id === post.id) {
            let updatedReactions;
            if (updatedAction.is_active) {
              updatedReactions = Array.isArray(p.reactions)
                ? p.reactions.map((r) =>
                    r.user.id === updatedAction.user.id ? updatedAction : r
                  )
                : [updatedAction];
              p.reacted = true;
            } else {
              updatedReactions = Array.isArray(p.reactions)
                ? p.reactions.filter((r) => r.user.id !== updatedAction.user.id)
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
            [post.id]: selectedReaction,
          };
        } else {
          const { [post.id]: _, ...rest } = current;
          return rest;
        }
      });
    } catch (error) {
      console.error("Error updating reactions:", error);
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

  //====================Comment=============================

  const handleCommentButtonPress = (postId) => {
    setCommentingPostId(commentingPostId === postId ? null : postId);
  };

  //Hàm xử lý event gửi comment
  const handleCommentSubmit = async (postId) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", commentText);

      const response = await authAPI(token).post(
        endpoints["add-comment"](postId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newComment = response.data;

      setComments((currentComments) => {
        return {
          ...currentComments,
          [postId]: [...(currentComments[postId] || []), newComment],
        };
      });

      setCommentText("");
      setCommentingPostId(null);
    } catch (error) {
      console.error("Lỗi không thể gửi bình luận:", error);
    }
  };

  //Tìm kiếm comment cần xử lý
  const handleEditComment = (commentId, postId) => {
    const comment = comments[postId].find(
      (comment) => comment.id === commentId
    );
    setSelectedComment(comment);
    setEditingCommentText(comment.content);
  };

  // Hàm xử lý event chỉnh sửa comment
  const handleCommentUpdateSubmit = async (commentId, postId) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("comment_id", commentId);
      formData.append("content", editingCommentText);

      const response = await authAPI(token).post(
        endpoints["update-comment"](postId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedComment = response.data;

      setComments((currentComments) => {
        return {
          ...currentComments,
          [postId]: currentComments[postId].map((comment) =>
            comment.id === updatedComment.id ? updatedComment : comment
          ),
        };
      });

      setSelectedComment(null);
      setEditingCommentText("");
    } catch (error) {
      console.error("Lỗi không thể chỉnh sửa bình luận:", error);
    }
  };

  //Hàm xử lý event xóa comment
  const handleDeleteComment = async (comment_id, post_id) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }

    try {
      const response = await authAPI(token).delete(
        endpoints["delete-comment"](post_id),
        {
          data: { comment_id: comment_id },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      setComments((currentComments) => ({
        ...currentComments,
        [post_id]: currentComments[post_id].filter(
          (comment) => comment.id !== comment_id
        ),
      }));

      await fetchReactionsAndComments([post_id]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={MyStyles.container}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
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
                right={() => (
                  <Menu
                    visible={selectedPostId === p.id}
                    onDismiss={() => setSelectedPostId(null)}
                    anchor={
                      <TouchableOpacity onPress={() => setSelectedPostId(p.id)}>
                        <Icon name="dots-vertical" size={24} />
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        handleEditPost(p.id);
                        setSelectedPostId(null);
                      }}
                      title="Chỉnh sửa"
                    />
                    <Menu.Item
                      onPress={() => handleDeletePost(p.id)}
                      title="Xóa"
                    />
                  </Menu>
                )}
              />
              <Card.Content>
                {selectedPost && selectedPost.id === p.id ? (
                  <View>
                    <TextInput
                      value={editingPostContent}
                      onChangeText={setEditingPostContent}
                      style={{ marginBottom: 8 }}
                    />
                    <Button
                      mode="contained"
                      onPress={() => handlePostUpdateSubmit(p.id)}
                    >
                      Cập nhật bài viết
                    </Button>
                  </View>
                ) : (
                  <Text>{p.content}</Text>
                )}
              </Card.Content>
              {p.media.length > 0 && (
                <Card.Cover
                  source={{ uri: p.media[0].file }}
                  resizeMode="cover"
                />
              )}

              {/* Viết IU chỉnh sửa bài viết */}

              <Card.Actions style={MyStyles.cardActions}>
                <View style={MyStyles.actionContainer}>
                  <TouchableOpacity
                    style={MyStyles.actionButton}
                    onPress={() => handleLikeButtonPress(p)}
                  >
                    <Icon
                      name={
                        currentReaction
                          ? currentReaction.name
                          : "thumb-up-outline"
                      }
                      size={20}
                      color={
                        currentReaction ? currentReaction.color : undefined
                      }
                    />
                    <Text
                      style={[
                        MyStyles.actionText,
                        {
                          color: currentReaction
                            ? currentReaction.color
                            : undefined,
                        },
                      ]}
                    >
                      {currentReaction ? currentReaction.label : "Thích"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={MyStyles.actionButton}
                    onPress={() => handleCommentButtonPress(p.id)}
                  >
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
                      <TouchableOpacity
                        key={reaction.label}
                        style={MyStyles.reactionButton}
                        onPress={() => handleAction(reaction.label, p)}
                      >
                        <Icon
                          name={reaction.name}
                          size={30}
                          color={reaction.color}
                        />
                        <Text style={MyStyles.reactionText}>
                          {reaction.label}
                        </Text>
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
                  <Button
                    mode="contained"
                    onPress={() => handleCommentSubmit(p.id)}
                  >
                    Bình luận
                  </Button>
                </View>
              )}
              {comments[p.id] &&
                comments[p.id].map((comment) => (
                  <View key={comment.id} style={PostStyles.commentContainer}>
                    <Avatar.Image
                      size={24}
                      source={{ uri: comment.user.avatar }}
                      style={PostStyles.commentAvatar}
                    />
                    <View style={PostStyles.commentContent}>
                      <Text style={PostStyles.commentUserName}>
                        {comment.user.first_name} {comment.user.last_name}
                      </Text>
                      {selectedComment && selectedComment.id === comment.id ? (
                        <View style={PostStyles.editingCommentContainer}>
                          <TextInput
                            style={PostStyles.commentInput}
                            value={editingCommentText}
                            onChangeText={setEditingCommentText}
                          />
                          <Button
                            mode="contained"
                            onPress={() =>
                              handleCommentUpdateSubmit(comment.id, p.id)
                            }
                          >
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
                        <TouchableOpacity
                          onPress={() => setSelectedCommentId(comment.id)}
                        >
                          <Icon name="dots-vertical" size={20} />
                        </TouchableOpacity>
                      }
                    >
                      <Menu.Item
                        onPress={() => handleEditComment(comment.id, p.id)}
                        title="Chỉnh sửa"
                      />
                      <Menu.Item
                        onPress={() => handleDeleteComment(comment.id, p.id)}
                        title="Xóa"
                      />
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

export default Post;
