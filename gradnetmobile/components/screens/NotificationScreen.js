import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/APIs";
import { Ionicons } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
import Modal from "react-native-modal";

const NotificationScreen = () => {
  const [invitations, setInvitations] = useState([]);
  const [filteredInvitations, setFilteredInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentInvitation, setCurrentInvitation] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");

  const fetchUser = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await authAPI(token).get(endpoints["current-user"]);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
      Alert.alert("Error", "An error occurred while fetching user info.");
    }
  };

  const fetchInvitations = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await authAPI(token).get(endpoints["invitation"]);
      setInvitations(response.data);
    } catch (error) {
      // console.error("Error fetching invitations:", error);
      Alert.alert("Lỗi!", "Bạn không có quyền để sử dụng chức năng này!");
      navigation.navigate("Post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchInvitations();
  }, []);

  useEffect(() => {
    if (user && invitations.length > 0) {
      const userInvitations = invitations.filter((invitation) =>
        invitation.recipients_users.some(
          (recipient) => recipient.id === user.id
        )
      );
      setFilteredInvitations(userInvitations);
    }
  }, [user, invitations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUser();
    fetchInvitations();
    setRefreshing(false);
  }, []);

  const handleEdit = (invitation) => {
    setCurrentInvitation(invitation);
    setTitle(invitation.title);
    setContent(invitation.content);
    setLocation(invitation.location);
    setIsModalVisible(true);
  };

  const handleSaveEdit = async () => {
    const updatedData = { title, content, location };
    const token = await AsyncStorage.getItem("token");
    try {
      await authAPI(token).patch(
        `${endpoints["invitation"]}/${currentInvitation.id}/`,
        updatedData
      );
      setIsModalVisible(false);
      onRefresh(); // Refresh the invitations list after editing
    } catch (error) {
      console.error("Error editing invitation:", error);
      Alert.alert("Error", "An error occurred while editing the invitation.");
    }
  };

  const handleDelete = async (invitationId) => {
    const token = await AsyncStorage.getItem("token");
    console.log("Token: ", token);
    console.log("URL: ", `${endpoints["invitation"]}/${invitationId}/`);

    try {
      const response = await authAPI(token).delete(
        `${endpoints["invitation"]}/${invitationId}/`
      );
      console.log("Response: ", response);
      if (response.status === 204) {
        // Xóa thành công
        setFilteredInvitations(
          filteredInvitations.filter(
            (invitation) => invitation.id !== invitationId
          )
        );
        setInvitations(
          invitations.filter((invitation) => invitation.id !== invitationId)
        );
      } else {
        Alert.alert("Error", "Failed to delete the invitation.");
      }
    } catch (error) {
      console.error("Error deleting invitation:", error);
      Alert.alert("Error", "An error occurred while deleting the invitation.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.invitationContainer}>
      <View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.location}>{item.location}</Text>
      </View>
      <Menu>
        <MenuTrigger>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </MenuTrigger>
        <MenuOptions>
          <MenuOption onSelect={() => handleEdit(item)} text="Edit" />
          <MenuOption onSelect={() => handleDelete(item.id)} text="Delete" />
        </MenuOptions>
      </Menu>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <MenuProvider>
      <View style={styles.container}>
        <FlatList
          data={filteredInvitations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text>No invitations found.</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <Modal isVisible={isModalVisible}>
          <View style={styles.modalContent}>
            <Text>Edit Invitation</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
            />
            <TextInput
              style={styles.input}
              value={content}
              onChangeText={setContent}
              placeholder="Content"
            />
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Location"
            />
            <Button title="Save" onPress={handleSaveEdit} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </Modal>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  invitationContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    fontSize: 16,
  },
  location: {
    fontSize: 14,
    color: "gray",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
});

export default NotificationScreen;
