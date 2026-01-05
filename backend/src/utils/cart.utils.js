export const calculateCartTotals = (cart) => {
  cart.itemsPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  cart.totalPrice = cart.itemsPrice;
};
