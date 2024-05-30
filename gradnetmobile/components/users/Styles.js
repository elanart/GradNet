import { StyleSheet } from "react-native";

export const RegisterStyles = StyleSheet.create({
  pickerButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#2e64e5",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#2e64e5",
  },
  container: {
    backgroundColor: "#f9fafd",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // padding: 20,
  },
  text: {
    fontSize: 28,
    marginBottom: 10,
    color: "#051d5f",
  },
  navButton: {
    marginTop: 15,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2e64e5",
  },
  textPrivate: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 35,
    justifyContent: "center",
  },
  color_textPrivate: {
    fontSize: 13,
    fontWeight: "400",
    color: "grey",
  },
});