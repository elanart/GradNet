import { ActivityIndicator, Text, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useState } from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { Appbar, Card } from "react-native-paper";

const Post = () => {
  const [posts, setPosts] = useState(null);

  const loadPosts = async () => {
    try {
      let res = await APIs.get(endpoints["posts"]);
      setPosts(res.data.results);
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <View style={MyStyles.container}>
      <Appbar.Header>
        <Appbar.Content title="Danh mục bài viết" />
      </Appbar.Header>
      {/* {posts === null ? (
        <ActivityIndicator />
      ) : (
        <>
          {posts.map((p) => (
            <Card key={p.id} style={MyStyles.card}>
              <Card.Title title={p.caption} />
              <Card.Content>
                <Text variant="bodyMedium">{p.content}</Text>
              </Card.Content>
              <Card.Cover source={{ uri: p.image }} />
            </Card>
          ))}
        </>
      )} */}
    </View>
  );
};

export default Post;
