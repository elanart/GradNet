import axios from "axios";

const BASE_URL = "https://elanart.pythonanywhere.com";
export const client_id = "E91viVd5R6KT71qXjNxPoM7OmtvHox2C5Eodq9sw";
export const client_secret =
  "ushMLls9Pto0qNtCwQ04Cq4b6wDJeg06V5XzplSZnTxCTPHXIBeZjH9fw1kihYumwDKBh3K0hHbOSvT8qTcZ8R92L7WZNaHglZ8rBuqTNIXlF1ZJsIY24F087DLfxs6e";

export const endpoints = {
  posts: "/posts/",
  login: "/o/token/",
  "current-user": "/users/current-user",
  register: "/users/",

  "add-comment": (post_id) => `/posts/${post_id}/add-comment/`,
  "update-comment": (post_id) => `/posts/${post_id}/update-comment/`,
  "delete-comment": (post_id) => `/posts/${post_id}/delete-comment/`,
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
  // headers: {
  //   "Content-Type": "application/json",
  // },
});
