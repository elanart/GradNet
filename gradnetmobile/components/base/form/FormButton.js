import { TouchableOpacity, View } from "react-native";
import MyStyles from "../../../styles/MyStyles";
import { Button, Text } from "react-native";

const FormButton = ({ title, ...props }) => {
  return (
    <View style={MyStyles.buttonContainer}>
      <TouchableOpacity {...props}>
        <Text style={MyStyles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FormButton;
