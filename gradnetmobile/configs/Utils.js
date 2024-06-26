import AsyncStorage from "@react-native-async-storage/async-storage";

// Kiểm tra có thông tin người dùng nào được lưu trữ trước đó không
export const checkUser = async (dispatch) => {
  const token = await AsyncStorage.getItem("token");
  const storedUser = await AsyncStorage.getItem("user");
  if (token && storedUser) {
    dispatch({ type: "login", payload: JSON.parse(storedUser) });
    // JSON.parse(storedUser) - chuyển chuỗi thành user.data (ở Login).
  }
};
