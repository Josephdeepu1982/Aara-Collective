//helper functions to talk to your backend API via fetch()

// This defines the shape of a product object returned by the backend.
// It helps TypeScript understand what fields to expect.
export type ApiProduct = {
  id: string;
  name: string;
  price: number; // already converted to dollars by the backend
  image: string;
  subtitle?: string;
  category?: string;
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  isBestSeller?: boolean;
};

const BASEURL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

//JSON helper to make JSON-based API requests
const fetchJSON = async <ResponseType>(
  path: string,
  init?: RequestInit,
): Promise<ResponseType> => {
  const res = await fetch(`${BASEURL}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
};

//fetch list of products with optional filters
const getProducts = (
  queryObject: Record<string, string | number | undefined>,
) => {
  const searchParams = new URLSearchParams();

  Object.entries(queryObject).forEach((entry) => {
    const key = entry[0];
    const value = entry[1];
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  return fetchJSON<{
    items: ApiProduct[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/products?${searchParams.toString()}`);
};

//fetches a list of featured products
const getFeaturedProducts = () => {
  return fetchJSON<ApiProduct[]>(`/products/featured`);
};

// fetches details of a single product by its ID.
const getSingleProduct = (productId: string) => {
  return fetchJSON<any>(`/products/${productId}`);
};

// This function checks if a coupon code is valid.
// It returns a boolean and optionally the coupon details.
const getCouponDetails = (couponCode: string) => {
  return fetchJSON<{ valid: boolean; coupon?: any }>(`/coupons/${couponCode}`);
};

// This function creates a new order.
// It sends customer info, shipping details, and cart items to the backend.
const createNewOrder = (orderData: {
  email?: string;
  name?: string;
  couponCode?: string;
  notes?: string;
  shipping: {
    fullName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
}) => {
  return fetchJSON<{
    orderId: string;
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
  }>(`/orders`, {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};
//const createNewOrder = (orderData) => {
//   return fetchJSON(`/orders`, {
//     method: "POST",
//     body: JSON.stringify(orderData),
//   });
// };

export type CreateIntentItem = {
  productId: string;
  quantity: number;
  variantId?: string; // optional, if you have variants
};

export type CreateIntentPayload = {
  email: string;
  name: string;
  shipping: {
    fullName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  items: CreateIntentItem[];
  couponCode?: string;
  notes?: string;
};
export type CreateIntentResponse = {
  clientSecret: string;
  orderId: string;
  totals: {
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
  };
};
const createStripePaymentIntent = (payload: CreateIntentPayload) => {
  return fetchJSON<CreateIntentResponse>(`/checkout/create-intent`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const apiHelpers = {
  getProducts,
  getFeaturedProducts,
  getSingleProduct,
  getCouponDetails,
  createNewOrder,
  createStripePaymentIntent,
};

export default apiHelpers;
