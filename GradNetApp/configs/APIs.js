import axios from "axios";

// const BASE_URL = "http://192.168.1.210:8000/";
const BASE_URL = "http://10.17.64.128:8000/";

export const endpoints = {
  users: "/users/",
  posts: "/posts/",
};

export default axios.create({
  baseURL: BASE_URL,
});
