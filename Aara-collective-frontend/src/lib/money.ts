// price label helper used across pages
export const priceLabel = (amount: number) =>
  Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
