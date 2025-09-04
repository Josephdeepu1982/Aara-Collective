// src/pages/CheckoutPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { priceLabel } from "@/lib/money";
import api from "@/lib/api";
import { useCartContext } from "@/context/useCartContext";

// ---------------- Types ----------------
type Props = {
  initialItems?: CartItem[];
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  quantity: number;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
};

type CouponInfo = {
  code?: string;
  discountPercent?: number;
  amountOff?: number;
  discountCents?: number;
};

// --------------- Stripe Setup ---------------
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

// --------------- Helper (email) ---------------
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// --------------- Component ---------------
const CheckoutPage = (props: Props) => {
  // Coupon state
  const [coupon, setCoupon] = useState<string>("");
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Place order / payment state
  const [isCreatingIntent, setIsCreatingIntent] = useState<boolean>(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    orderId: string;
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
  } | null>(null);

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Cart + form state
  const { cartItems: contextCartItems } = useCartContext();
  const [cartItems] = useState<CartItem[]>(
    (props.initialItems ?? contextCartItems ?? []) as CartItem[],
  );

  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });

  const [billingSameAsShipping, setBillingSameAsShipping] =
    useState<boolean>(true);
  const [orderNotes, setOrderNotes] = useState<string>("");

  // Totals (client view only; server will re-compute)
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const unitPrice =
        typeof item.salePrice === "number" ? item.salePrice : item.price;
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const shippingFee = useMemo(() => {
    return subtotal > 50 ? 0 : 15;
  }, [subtotal]);

  const discount = useMemo(() => {
    if (!couponInfo) return 0;
    let temp = 0;
    const percent = Number(couponInfo.discountPercent);
    if (!Number.isNaN(percent) && percent > 0) {
      temp = (subtotal * percent) / 100;
    } else if (typeof couponInfo.discountCents === "number") {
      temp = couponInfo.discountCents / 100;
    } else if (typeof couponInfo.amountOff === "number") {
      temp = couponInfo.amountOff;
    }
    return Math.max(0, Math.min(temp, subtotal));
  }, [couponInfo, subtotal]);

  const total = useMemo(
    () => Math.max(0, subtotal - discount + shippingFee),
    [subtotal, discount, shippingFee],
  );

  // Basic form validation
  const isFormValid = () => {
    const hasName = shipping.fullName.trim().length > 0;
    const hasEmail = isEmail(shipping.email.trim());
    const hasAddress = shipping.address.trim().length > 0;
    const hasCity = shipping.city.trim().length > 0;
    const hasCountry = shipping.country.trim().length > 0;
    const hasPostal = shipping.postalCode.trim().length > 0;
    const hasItems = Array.isArray(cartItems) && cartItems.length > 0;

    return (
      hasName &&
      hasEmail &&
      hasAddress &&
      hasCity &&
      hasCountry &&
      hasPostal &&
      hasItems
    );
  };

  // Field updates
  const handleChange = (fieldName: keyof ShippingAddress, value: string) => {
    setShipping((previous) => ({ ...previous, [fieldName]: value }));
  };

  // Coupon check
  const applyCoupon = async () => {
    const code = coupon.trim();
    if (!code) {
      setCouponInfo(null);
      setCouponError("Enter a coupon code.");
      return;
    }
    setCouponError(null);
    try {
      const response = await api.getCouponDetails(code);
      if (!response.valid || !response.coupon) {
        setCouponInfo(null);
        setCouponError("Invalid or expired coupon.");
      } else {
        setCouponInfo(response.coupon as CouponInfo);
      }
    } catch {
      setCouponInfo(null);
      setCouponError("Failed to validate coupon. Please try again.");
    }
  };

  // Step 1: Create PaymentIntent (first click)
  const handleCreateIntent = async () => {
    if (!isFormValid()) {
      setPayError("Please fill in all required fields.");
      return;
    }
    setPayError(null);
    setIsCreatingIntent(true);
    try {
      const payload = {
        email: shipping.email.trim(),
        name: shipping.fullName.trim(),
        couponCode: couponInfo ? coupon.trim() : undefined,
        notes: orderNotes || undefined,
        shipping: {
          fullName: shipping.fullName.trim(),
          email: shipping.email.trim(),
          phone: shipping.phone || undefined,
          address: shipping.address,
          city: shipping.city,
          country: shipping.country,
          postalCode: shipping.postalCode,
        },
        items: cartItems.map((cartItem) => ({
          productId: cartItem.id,
          quantity: cartItem.quantity,
        })),
      };
      const response = await api.createStripePaymentIntent(payload);
      setClientSecret(response.clientSecret);
      setCreatedOrderId(response.orderId);
      // Pre-fill result totals for success page later
      setResult({
        orderId: response.orderId,
        subtotalCents: response.totals.subtotalCents,
        discountCents: response.totals.discountCents,
        shippingCents: response.totals.shippingCents,
        totalCents: response.totals.totalCents,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create payment intent.";
      setPayError(message);
    } finally {
      setIsCreatingIntent(false);
    }
  };
  const getDisabledReason = (): string | null => {
    if (isCreatingIntent) return "Preparing payment…";
    if (!shipping.fullName.trim()) return "Full name is required.";
    if (!isEmail(shipping.email.trim())) return "Valid email is required.";
    if (!shipping.address.trim()) return "Address is required.";
    if (!shipping.city.trim()) return "City is required.";
    if (!shipping.country.trim()) return "Country is required.";
    if (!shipping.postalCode.trim()) return "Postal code is required.";
    if (!Array.isArray(cartItems) || cartItems.length === 0)
      return "Your cart is empty.";
    return null;
  };

  // Success screen (after confirm)
  if (result && clientSecret === "PAID") {
    return (
      <div className="bg-gray-50 pt-20">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Thank you! 🎉
          </h1>
          <p className="mt-2 text-gray-700">Your order has been placed.</p>
          <div className="mx-auto mt-6 w-full max-w-md rounded-lg bg-white p-6 text-left shadow-sm">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="mb-4 font-mono text-sm">{result.orderId}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {priceLabel(result.subtotalCents / 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium">
                  -{priceLabel(result.discountCents / 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {priceLabel(result.shippingCents / 100)}
                </span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-pink-700">
                {priceLabel(result.totalCents / 100)}
              </span>
            </div>
          </div>
          <Link to="/shop">
            <Button className="mt-6 bg-pink-700 hover:bg-pink-800">
              Continue shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-20">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold">Checkout</h1>
          <Link
            to="/cart"
            className="text-sm font-medium text-pink-700 hover:text-pink-900"
          >
            ← Back to Cart
          </Link>
        </div>

        {/* Error banner */}
        {payError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {payError}
          </div>
        )}

        {/* 2 columns on large screens */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: forms */}
          <div className="space-y-8 lg:col-span-2">
            {/* Shipping */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-gray-700">
                    Full Name *
                  </label>
                  <Input
                    value={shipping.fullName}
                    onChange={(event) =>
                      handleChange("fullName", event.target.value)
                    }
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={shipping.email}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                    onBlur={(event) =>
                      handleChange("email", event.target.value.trim())
                    }
                    placeholder="jane@example.com"
                  />
                  {!isEmail(shipping.email.trim()) &&
                    shipping.email.length > 0 && (
                      <p className="mt-1 text-xs text-red-600">
                        Please enter a valid email.
                      </p>
                    )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    Phone
                  </label>
                  <Input
                    value={shipping.phone}
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                    placeholder="+65 9000 0000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-gray-700">
                    Address *
                  </label>
                  <Input
                    value={shipping.address}
                    onChange={(event) =>
                      handleChange("address", event.target.value)
                    }
                    placeholder="123 Orchard Road"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    City *
                  </label>
                  <Input
                    value={shipping.city}
                    onChange={(event) =>
                      handleChange("city", event.target.value)
                    }
                    placeholder="Singapore"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    Country *
                  </label>
                  <Input
                    value={shipping.country}
                    onChange={(event) =>
                      handleChange("country", event.target.value)
                    }
                    placeholder="Singapore"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-gray-700">
                    Postal Code *
                  </label>
                  <Input
                    value={shipping.postalCode}
                    onChange={(event) =>
                      handleChange("postalCode", event.target.value)
                    }
                    placeholder="123456"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 sm:col-span-2">
                  <Checkbox
                    id="billingSame"
                    checked={billingSameAsShipping}
                    onCheckedChange={(value) =>
                      setBillingSameAsShipping(Boolean(value))
                    }
                  />
                  <label htmlFor="billingSame" className="text-sm">
                    Billing address same as shipping
                  </label>
                </div>
              </div>
            </div>

            {/* Notes + Payment */}
            <div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Order Notes (Optional)
                </h2>
                <textarea
                  className="w-full rounded-md border border-yellow-300 bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-yellow-400"
                  rows={4}
                  value={orderNotes}
                  onChange={(event) => setOrderNotes(event.target.value)}
                  placeholder="Any delivery instructions?"
                />
              </div>

              {/* Payment box */}

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-lg font-semibold text-gray-900">
                  Payment
                </h2>
                {!clientSecret && (
                  <>
                    <p className="text-sm text-gray-600">
                      Click “Pay Now” to prepare a secure Stripe payment.
                    </p>
                    <Button
                      className="mt-4 bg-pink-700 hover:bg-pink-800"
                      onClick={handleCreateIntent}
                      disabled={isCreatingIntent || !isFormValid()}
                    >
                      {isCreatingIntent ? "Preparing…" : "Pay Now"}
                    </Button>
                    {getDisabledReason() && (
                      <p className="mt-2 text-xs text-red-600">
                        {getDisabledReason()}
                      </p>
                    )}
                  </>
                )}

                {clientSecret && clientSecret !== "PAID" && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: clientSecret,
                      appearance: { theme: "stripe" },
                    }}
                  >
                    <PaymentInner
                      onPaid={() => {
                        // Flip clientSecret to "PAID" to trigger your success screen above
                        setClientSecret("PAID");
                      }}
                      onError={(message) => setPayError(message)}
                    />
                  </Elements>
                )}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Order Summary
              </h2>

              <ul className="divide-y">
                {cartItems.map((item) => {
                  const unit =
                    typeof item.salePrice === "number"
                      ? item.salePrice
                      : item.price;
                  const line = unit * item.quantity;
                  return (
                    <li key={item.id} className="py-4">
                      <div className="flex items-center">
                        <div className="h-16 w-16 overflow-hidden rounded-md border">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {priceLabel(line)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Coupon */}
              <div className="mt-4 flex gap-2">
                <Input
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  placeholder="Coupon code"
                />
                <Button
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={!coupon.trim()}
                >
                  Apply
                </Button>
              </div>
              {couponError && (
                <div className="mt-2 text-xs text-red-600">{couponError}</div>
              )}
              {couponInfo && !couponError && (
                <div className="mt-2 text-xs text-green-700">
                  Coupon applied
                  {couponInfo.discountPercent
                    ? `: ${couponInfo.discountPercent}% off`
                    : ""}
                  .
                </div>
              )}

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{priceLabel(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>-{priceLabel(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? "Free" : priceLabel(shippingFee)}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-pink-700">{priceLabel(total)}</span>
              </div>

              <p className="mt-3 text-center text-xs text-gray-500">
                Secure checkout • Powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// A small inner component so we can use Stripe hooks
type PaymentInnerProps = {
  onPaid: () => void;
  onError: (message: string) => void;
};

const PaymentInner = (props: PaymentInnerProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  // Handles the final confirm step
  const handleConfirm = async () => {
    if (!stripe || !elements) {
      props.onError("Stripe is not ready yet. Please try again in a moment.");
      return;
    }
    setIsConfirming(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe may redirect for 3DS; this URL is where users land afterwards
        return_url: `${window.location.origin}/checkout`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      props.onError(
        result.error.message || "Payment failed. Please try again.",
      );
    } else {
      // If no redirect was required and no error, payment should be complete
      props.onPaid();
    }
    setIsConfirming(false);
  };

  return (
    <div className="mt-2">
      <PaymentElement />
      <Button
        className="mt-4 w-full bg-pink-700 hover:bg-pink-800"
        onClick={handleConfirm}
        disabled={isConfirming}
      >
        {isConfirming ? "Processing…" : "Confirm & Pay"}
      </Button>
      <p className="mt-3 text-center text-xs text-gray-500">
        Your card details are encrypted and submitted to Stripe.
      </p>
    </div>
  );
};

export default CheckoutPage;
