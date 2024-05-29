import axios from "axios";

const BASE_URL = "https://elanart.pythonanywhere.com/";
export const client_id = "EAHngO2GVq31vkP79iUM6WdkitjnuxaYmWDVH5QS";
export const client_secret =
  "ZJCMpRbOpK0nJlHtCZNrDYtQnqILqsX84rtRjE6AoHR2nUJBg2TG4LTge2wxmxjQ3qIfNuW4sUutORRgur2tlsBtFS522HQZBXwLPLxozVPDIC5PCRpVUmwYR1ykjgID";

export const endpoints = {
  posts: "/posts/",
  login: "/o/token/",
  "current-user": "/users/current-user",
  register: "/users/",
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
  headers: {
    "Content-Type": "application/json",
  },
});
