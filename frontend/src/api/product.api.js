import api from "./axios";

export const getSimilarProducts = (slug) =>
  api.get(`/products/similar/${slug}`);