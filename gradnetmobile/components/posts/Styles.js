import { StyleSheet } from "react-native";

export const PostStyles = StyleSheet.create({
  postContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
  },
  postContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  commentAvatar: {
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontWeight: "bold",
  },
  commentInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  editingCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
