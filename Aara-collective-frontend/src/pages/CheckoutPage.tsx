import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

//------Types--------//
//define props for checkout component.
//initialItems is a prop that can be passed into a React component. it should be an array of CartItem objects, each representing a product in the cart.
type Props = {
  initialItems?: CartItem[];
};

//Represents a single item in the user's shopping cart.
type CartItem = {
  id: string;
  name: string;
  price: number;
  salePrice?: number; // Optional discounted price
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

// ---------- Mock data - to be replace with your cart state / context) ----------
const mockItems: CartItem[] = [
  {
    id: "1",
    name: "Kundan Gold Necklace Set",
    price: 899,
    image:
      "https://images.unsplash.com/photo-1601821765780-754fa98637c1?auto=format&fit=crop&w=800&q=80",
    quantity: 1,
  },
  {
    id: "2",
    name: "Embroidered Silk Saree",
    price: 499,
    salePrice: 399,
    image:
      "https://images.unsplash.com/photo-1610030469668-8e6b6a582e23?auto=format&fit=crop&w=800&q=80",
    quantity: 1,
  },
];

//-------Component----//
const CheckoutPage = ({ initialItems }: Props) => {
  //If initialItems is provided (not null or undefined), use it. Otherwise, fall back to mockItems
  const [cartItems] = useState<CartItem[]>(initialItems ?? mockItems);
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });

  //If user prefers a separate billing address
  const [billingSameAsShipping, setBillingSameAsShipping] =
    useState<boolean>(true);

  const [orderNotes, setOrderNotes] = useState<string>("");

  // Helper to format money as SGD
  const priceLabel = (amount: number) =>
    Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(
      amount,
    );

  // Compute totals (memoized so it recalculates only when cart changes)
  //reduce loops through each item in the cartItems array
  // If salePrice exists, use it, else it uses the regular price.
  const subtotal = useMemo(() => {
    return cartItems.reduce((accumulator, cartItem) => {
      const unitPrice = cartItem.salePrice ?? cartItem.price;
      return accumulator + unitPrice * cartItem.quantity;
    }, 0);
  }, [cartItems]);

  const shippingFee = useMemo(() => {
    return subtotal > 50 ? 0 : 15;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + shippingFee;
  }, [subtotal, shippingFee]);

  //Basic validation: checks whether all required fields in the shipping object are non-empty strings. It returns true only if every field passes the check. .trim() removes leading and trailing whitespace.
  const isFormValid = () => {
    return (
      shipping.fullName.trim() !== "" &&
      shipping.email.trim() !== "" &&
      shipping.address.trim() !== "" &&
      shipping.city.trim() !== "" &&
      shipping.country.trim() !== "" &&
      shipping.postalCode.trim() !== ""
    );
  };

  //for future stripe integration
  const handlePlaceOrder = () => {
    if (!isFormValid()) {
      alert("Please fill in all required fields.");
      return;
    }
    // TODO: Stripe integration-> confirm payment here.
    alert("This is a placeholder for stripe integration- Payment successful");
  };

  //When the user changes a field (like city or email), update just that field in the shipping state.”
  //If someone types "Singapore" into the city input, this line:
  // handleChange("city", "Singapore");
  //will update your shipping state to: { ...previousShippingState, city: "Singapore" }
  const handleChange = (fieldName: keyof ShippingAddress, value: string) => {
    setShipping((previous) => ({ ...previous, [fieldName]: value }));
  };

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header/Breadcrumb lite */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold">Checkout</h1>
          <Link
            to="/cart"
            className="text-sm font-medium text-pink-700 hover:text-pink-900"
          >
            ← Back to Cart
          </Link>
        </div>

        {/* Layout: 2 columns in large screen */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: forms (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Adress */}
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
                    placeholder="jane@example.com"
                  />
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
                    onCheckedChange={(checkedValue) =>
                      setBillingSameAsShipping(Boolean(checkedValue))
                    }
                  />
                  <label htmlFor="billingSame" className="text-sm">
                    Billing address same as shipping
                  </label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Order Notes (Optional)
                </h2>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  rows={4}
                  value={orderNotes}
                  onChange={(event) => setOrderNotes(event.target.value)}
                  placeholder="Any delivery instructions?"
                />
              </div>

              {/* Payment  */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-lg font-semibold text-gray-900">
                  Payment
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your card details Pay Now.
                </p>
              </div>
            </div>

            {/* Right order Summary */}
            <div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>

                <ul className="divide-y">
                  {cartItems.map((cartItem) => {
                    const unitPrice = cartItem.salePrice ?? cartItem.price;
                    const lineTotal = unitPrice * cartItem.quantity;
                    return (
                      <li key={cartItem.id} className="py-4">
                        <div className="flex items-center">
                          <div className="h-16 w-16 overflow-hidden rounded-md border">
                            <img
                              src={cartItem.image}
                              alt={cartItem.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {cartItem.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {cartItem.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            {priceLabel(lineTotal)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{priceLabel(subtotal)}</span>
                  </div>
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

                <Button
                  className="mt-6 w-full bg-pink-700 hover:bg-pink-800"
                  onClick={handlePlaceOrder}
                >
                  Pay Now
                </Button>

                <p className="mt-3 text-center text-xs text-gray-500">
                  Secure checkout • Powered by Stripe (soon)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
