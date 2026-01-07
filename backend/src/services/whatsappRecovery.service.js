export const sendAbandonedCheckoutMessages = async () => {
  const pending = await AbandonedCheckout.find({
    status: "PENDING",
    createdAt: { $lte: new Date(Date.now() - 10 * 60 * 1000) },
  });

  for (let item of pending) {
    await sendWhatsApp(item.phone, item.name);
    item.status = "EXPIRED";
    await item.save();
  }
};
