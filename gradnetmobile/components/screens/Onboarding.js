import { Image, TouchableOpacity, Text } from "react-native";
import Onboarding from "react-native-onboarding-swiper";

const Skip = ({ ...props }) => (
  <TouchableOpacity style={{ marginHorizontal: 15 }} {...props}>
    <Text style={{ fontSize: 16 }}>Skip</Text>
  </TouchableOpacity>
);

const Next = ({ ...props }) => (
  <TouchableOpacity style={{ marginHorizontal: 15 }} {...props}>
    <Text style={{ fontSize: 16 }}>Next</Text>
  </TouchableOpacity>
);

const Done = ({ ...props }) => (
  <TouchableOpacity style={{ marginHorizontal: 15 }} {...props}>
    <Text style={{ fontSize: 16 }}>Done</Text>
  </TouchableOpacity>
);

const OnboardingScreen = ({ navigation }) => {
  return (
    <Onboarding
      SkipButtonComponent={Skip}
      NextButtonComponent={Next}
      DoneButtonComponent={Done}
      onSkip={() => navigation.replace("Login")}
      onDone={() => navigation.navigate("Login")}
      pages={[
        {
          backgroundColor: "#FFFAF0",
          image: <Image source={require("../../assets/logoOU.png")} />,
          title: "Chia sẻ kỷ niệm tuyệt vời",
          subtitle:
            "Đăng tải và chia sẻ những kỷ niệm đẹp, những câu chuyện thời sinh viên",
        },
        {
          backgroundColor: "#FFFAF0",
          image: <Image source={require("../../assets/logoOU.png")} />,
          title: "Xây dựng cộng đồng",
          subtitle:
            "Cập nhật thông tin, tham gia sự kiện và kết nối với cộng đồng cựu sinh viên",
        },
      ]}
    />
  );
};

export default OnboardingScreen;
