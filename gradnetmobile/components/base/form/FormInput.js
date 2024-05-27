import { View } from "react-native";
import { TextInput } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import MyStyles from "../../../styles/MyStyles";

const FormInput = ({ value, text, icon, ...props }) => {
  return (
    <View style={MyStyles.inputContainer}>
      <View style={MyStyles.icon}>
        <AntDesign name={icon} size={25} color="#666" />
      </View>
      <TextInput
        style={MyStyles.input}
        value={value}
        numberOfLines={1}
        placeholder={text}
        placeholderTextColor="#666"
        {...props}
      />
    </View>
  );
};

export default FormInput;
