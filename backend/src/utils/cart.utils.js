export const calculateCartTotals = (cart) => {
  cart.itemsPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  cart.discountPrice = cart.coupon?.discount || 0;

  cart.totalPrice = Math.max(
    cart.itemsPrice - cart.discountPrice,
    0
  );
};
