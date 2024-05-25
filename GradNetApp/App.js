import { SafeAreaProvider } from "react-native-safe-area-context";
import Post from "./components/posts/Posts";

const App = () => {
  return (
    <SafeAreaProvider>
      <Post />;
    </SafeAreaProvider>
  );
};

export default App;
