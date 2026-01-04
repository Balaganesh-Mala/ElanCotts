import api from "./axios";

export const getVideos = () => {
  return api.get("/videos");
};