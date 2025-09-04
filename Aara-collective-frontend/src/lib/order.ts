import api from "./api";

// Validate a coupon before placing order (optional UI step)
export const validateCoupon = async (couponCode: string): Promise<boolean> => {
  if (!couponCode) return false;
  try {
    const response = await api.getCouponDetails(couponCode);
    return !!response.valid;
  } catch {
    return false; // fail silently or log if needed
  }
};

// This function sends the order details to the backend to create a new order.
// It includes customer info, shipping address, cart items, and optional coupon.
export const placeOrder = async (orderDetails: {
  cartItems: {
    id: string;
    quantity: number;
    variantId?: string;
  }[];
  shipping: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    phone?: string;
  };
  couponCode?: string;
  email?: string;
  name?: string;
  notes?: string;
}) => {
  const requestBody = {
    email: orderDetails.email,
    name: orderDetails.name,
    couponCode: orderDetails.couponCode,
    notes: orderDetails.notes,
    shipping: orderDetails.shipping,
    items: orderDetails.cartItems.map((cartItem) => ({
      productId: cartItem.id,
      variantId: cartItem.variantId,
      quantity: cartItem.quantity,
    })),
  };

  // Server calculates all totals; never trust client-side totals for payment.
  const result = await api.createNewOrder(requestBody);
  return result; // { orderId, subtotalCents, discountCents, shippingCents, totalCents }
};
