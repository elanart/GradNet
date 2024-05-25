import axios from "axios";

// const BASE_URL = "http://192.168.1.210:8000/";
const BASE_URL = "http://10.17.64.128:8000/";

export const endpoints = {
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
