// frontend/src/api/hero.api.js
import axios from "./axios";

// GET all hero slides
export const getHeroSlides = async () => {
  return await axios.get("/hero");
};

// CREATE new slide
export const createHeroSlide = async (formData) => {
  return await axios.post("/hero/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// UPDATE slide
export const updateHeroSlide = async (id, formData) => {
  return await axios.put(`/hero/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// DELETE slide
export const deleteHeroSlide = async (id) => {
  return await axios.delete(`/hero/${id}`);
};
