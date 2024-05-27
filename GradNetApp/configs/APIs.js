import axios from "axios";

const BASE_URL = "https://elanart.pythonanywhere.com/";
// const BASE_URL = "http://192.168.1.210:8000";
// const BASE_URL = "http://10.17.64.128:8000";
// const BASE_URL = "http://192.168.1.25:8000";

export const endpoints = {
  "check-username": "/users/check-username",
  register: "/users/",
  login: "/o/token/",
  "current-user": "/users/current-user",
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
