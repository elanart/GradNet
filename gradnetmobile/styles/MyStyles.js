import { StyleSheet } from "react-native";
import { windowHeight, windowWidth } from "../configs/Dimensions";

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
  },
  buttonContainer: {
    marginTop: 10,
    width: "100%",
    height: windowHeight / 15,
    backgroundColor: "#2e64e5",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  inputContainer: {
    marginTop: 5,
    marginBottom: 10,
    width: "100%",
    height: windowHeight / 15,
    borderColor: "#ccc",
    borderRadius: 3,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  icon: {
    padding: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRightColor: "#ccc",
    borderRightWidth: 1,
    width: 50,
  },
  input: {
    padding: 10,
    flex: 1,
    fontSize: 16,
    color: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  inputField: {
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    height: windowHeight / 15,
    width: windowWidth / 1.5,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  loginContainer: {
    backgroundColor: "#f9fafd",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    height: 200,
    width: 200,
    resizeMode: "cover",
  },
  text: {
    fontSize: 28,
    marginBottom: 10,
    color: "#051d5f",
  },
  navigationButton: {
    marginTop: 15,
  },
  forgotpasswordButton: {
    marginVertical: 35,
  },
  navigationText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2e64e5",
  },searchBar: {
    margin: 16,
  },
  containers: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    margin: 16,
  },
  card: {
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  media: {
    width: '100%',
    height: 200,
    marginTop: 8,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,

  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-around"
  },

  reactionText: {
    marginTop: 5,
    fontSize: 12
  },
  reactionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reactionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  reactionIcon: {
    color: '#000',
  },
  
});
