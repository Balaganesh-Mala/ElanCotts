import { shopProducts } from "../data/dummyShopProducts";

export const getProductById = (id) => {
  return shopProducts.find(p => p.id === Number(id));
};
