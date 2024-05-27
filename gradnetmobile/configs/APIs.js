import axios from "axios";

const BASE_URL = "https://elanart.pythonanywhere.com/";

export const endpoints = {
  posts: "/posts/",
};

export const authAPI = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default axios.create({
  baseURL: BASE_URL,
});
