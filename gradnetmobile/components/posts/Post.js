import { Image, ScrollView, Text, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useState } from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, Card, List, Searchbar } from "react-native-paper";

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const loadPosts = async () => {
    if (page > 0) {
      setLoading(true);
      let url = `${endpoints.posts}?q=${keyword}&page=${page}`;
      try {
        let res = await APIs.get(url);
        if (page === 1) setPosts(res.data.results);
        else
          setPosts((current) => {
            return [...current, ...res.data.results];
          });

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

  const loadMore = ({ nativeEvent }) => {
    if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
      console.info(Math.random());
      setPage(page + 1);
    }
  };

  return (
    <View>
      <View style={MyStyles.container}>
        <Text>DANH MỤC BÀI VIẾT</Text>
        {posts === null ? (
          <ActivityIndicator />
        ) : (
          <>
            {posts.map((p) => (
              <Card key={p.id}>{p.content}</Card>
            ))}
          </>
        )}
      </View>
      <View>
        <Searchbar
          placeholder="Nhập từ khóa..."
          onChangeText={setKeyword}
          value={keyword}
        />
      </View>
      <ScrollView onScroll={loadMore}>
        {loading && <ActivityIndicator />}
        {posts.map((p) => (
          <List.Item
            key={p.id}
            title={p.caption}
            description={p.created_date}
            left={() => (
              <Image style={MyStyles.avatar} source={{ uri: p.media }} />
            )}
          />
        ))}
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
        <Text>Vẫn hiện oke!</Text>
      </ScrollView>
    </View>
  );
};

export default Post;
