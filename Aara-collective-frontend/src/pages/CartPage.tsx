import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
//Lucide icons
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
//shadcn UI component generator that is customizable
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

//----------Types------------//
type Props = {};

//Shape of single item in cart
type CartItem = {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  quantity: number;
  variant?: string;
};

//--------Mock Data (To be replaced with API calls from DB)--------//
const initialCartItems: CartItem[] = [
  {
    id: "1",
    name: "Kundan Gold Necklace Set",
    price: 899,
    image:
      "https://images.unsplash.com/photo-1601821765780-754fa98637c1?auto=format&fit=crop&w=800&q=80",
    quantity: 1,
    variant: "Gold",
  },
  {
    id: "2",
    name: "Embroidered Silk Saree",
    price: 499,
    salePrice: 399,
    image:
      "https://images.unsplash.com/photo-1610030469668-8e6b6a582e23?auto=format&fit=crop&w=800&q=80",
    quantity: 1,
    variant: "Pink",
  },
];

// --------------- Component --------------- //

const CartPage = ({}: Props) => {
  //<CartItem[]> : We tell TS that This state will hold an array of CartItem objects. Each object in the array must match the CartItem structure. We also get autocompletion.
  //initialCartItems is initial value of the state
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponApplied, setCouponApplied] = useState<boolean>(false);

  //Helper: takes a number (like 499 or 899) and turns it into SGD 499 or SGD 899
  //takes one input: a number called amount
  //Intl.NumberFormat is a built-in international formatter
  //.format(amount); takes the number (like 499) and formats it using the rules above.
  const priceLabel = (amount: number) =>
    Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
    }).format(amount);

  // change the quantity of an item in the shopping cart - but never let it drop below 1
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }
    //If the quantity is valid, it updates the cart by: Finding the item with the matching id & Replacing its quantity with the new number.
    //map() function that loops through all items in your cart. If the item's ID matches the one we want to update, we use the spread operator (...) to update qty of an object while keeping the rest unchanged. Example: {id: "saree123", name: "Silk Saree", price: 120, *quantity: 3*}
    // If it doesn’t match, it just returns the item as-is.
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  //Remove item from cart: Look at current list of items in the cart > filters out the item whose id matches the removed item > updates cart wtih new item.
  const removeItem = (id: string) => {
    setCartItems(
      (previousItems) => previousItems.filter((item) => item.id !== id), //keeps every item except the one with the matching id.
    );
  };

  //Apply coupon -> .trim() removes any extra spaces before or after the code.
  // .toUpperCase() makes the code uppercase
  const applyCoupon = () => {
    const trimmed = couponCode.trim().toUpperCase();
    if (trimmed === "Discount20") {
      setCouponApplied(true);
    } else {
      alert("invalid coupon code");
    }
  };

  //----------Computations--------//

  //adds up cost of all items in cart.
  // If item has a saleprice it uses that, else uses the regular price
  //.reduce() combines all items into one value. The accumulator is a variable that keeps track of the result as you go through each item
  //useMemo ensures this only recalculates when cartItems change
  const subtotal = useMemo(() => {
    return cartItems.reduce((accumulator, item) => {
      const unitPrice = item.salePrice ?? item.price;
      return accumulator + unitPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  //if discount coupopn applied
  const discount = useMemo(() => {
    return couponApplied ? subtotal * 0.2 : 0;
  }, [couponApplied, subtotal]);

  //Free shipping over 50$
  const shipping = useMemo(() => {
    return subtotal > 50 ? 0 : 15;
  }, [subtotal]);

  //grand Total
  const total = useMemo(() => {
    return subtotal - discount + shipping;
  }, [subtotal, discount, shipping]);

  //---------render-----------//

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* gray Outer container, centers content (mx-auto), limits width */}
        <h1 className="mb-8 font-serif text-3xl font-bold">
          Your Shopping Cart
        </h1>
        {/* Empty State */}
        {/* Check if cart is empty, if true show white card with a shopping cart and a message */}
        {/* Continue shopping button to go back to shop page */}
        {cartItems.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="mb-4 flex justify-center">
              <ShoppingCart size={64} className="text-gray-300" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mb-6 text-gray-600">
              Looks like you haven't added anything yet.
            </p>
            <Link to="/shop">
              <Button className="bg-pink-700 hover:bg-pink-800">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          // If the cart has items, shows a 3-column grid layout.
          //Left side takes up 2 columns.
          // Shows column headers for: Product name, Quantity & Total price. Only visible on medium screens and up (md:grid).
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Items */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                <div className="hidden grid-cols-12 gap-4 bg-gray-50 px-6 py-4 text-sm font-medium text-gray-500 md:grid">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>

                <ul className="divide-y">
                  {cartItems.map((item) => {
                    const unitPrice = item.salePrice ?? item.price;
                    const lineTotal = unitPrice * item.quantity;

                    return (
                      <li key={item.id} className="p-4 md:p-6">
                        <div className="grid grid-cols-12 gap-4 items-start">
                          {/* Product Info */}
                          <div className="col-span-12 md:col-span-6 flex">
                            {/* box to display image */}
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <Link
                                to={`/product/${item.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-pink-700"
                              >
                                {item.name}
                              </Link>
                              {item.variant && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Variant: {item.variant}
                                </p>
                              )}
                              <div className="mt-1 text-sm">
                                {item.salePrice ? (
                                  <>
                                    <span className="font-medium text-pink-700">
                                      {priceLabel(item.salePrice)}
                                    </span>
                                    <span className="ml-2 text-gray-400 line-through">
                                      {priceLabel(item.price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-medium text-gray-900">
                                    {priceLabel(item.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Increase / Decrese Quantity */}
                          {/* Uses a grid layout. On medium screens and up, it centers the controls and spans 3 columns. */}
                          <div className="col-span-6 flex items-center md:col-span-3 md:justify-center">
                            {/* quantity control box with rounded borders*/}
                            <div className="flex w-32 items-center rounded-md border">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="px-3 py-2 text-gray-600 hover:text-pink-700"
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                readOnly
                                value={item.quantity}
                                className="w-full py-2 text-center text-sm"
                              />
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="px-3 py-2 text-gray-600 hover:text-pink-700"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          {/* total price for each item and option to remove item */}
                          {/* Spans 6 columns on small screens, 3 on medium. Uses Flexbox to space out the price and remove button.*/}
                          <div className="col-span-6 flex items-center justify-between md:col-span-3 md:block md:text-right">
                            <span className="text-sm font-medium text-gray-900 mr-1">
                              {priceLabel(lineTotal)}
                            </span>
                            <button
                              type="button"
                              aria-label="Remove item"
                              onClick={() => removeItem(item.id)}
                              className="mt-2 md:mt-3 inline-flex items-center text-gray-400 hover:text-red-600 "
                            >
                              <Trash2 size={20} />
                              <span className="ml-1 text-xs md:hidden">
                                Remove
                              </span>
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Continue Shopping Link */}
                <div className="bg-gray-50 px-4 py-4 md:px-6">
                  <Link
                    to="/shop"
                    className="text-sm font-medium text-pink-700 hover:text-pink-900"
                  >
                    &larr; Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Summary */}
            <div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-medium text-gray-900">
                  Order Summary
                </h2>

                {/* Coupon */}

                <div className="mb-6">
                  <label
                    htmlFor="coupon"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Coupon Code
                  </label>
                  <div className="flex">
                    <Input
                      id="coupon"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value)}
                      disabled={couponApplied}
                      className="rounded-r-none"
                    />
                    <Button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponApplied}
                      className="rounded-l-none bg-pink-700 hover:bg-pink-800"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponApplied && (
                    <p className="mt-2 text-sm text-green-600">
                      Coupon applied successfully! 20% off.
                    </p>
                  )}
                </div>
                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {priceLabel(subtotal)}
                    </span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount (20%)</span>
                      <span>-{priceLabel(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {shipping === 0 ? "Free" : priceLabel(shipping)}
                    </span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-pink-700">{priceLabel(total)}</span>
                  </div>
                </div>

                {/* Checkout */}
                <div className="mt-6">
                  <Link to="/checkout">
                    <Button className="w-full bg-pink-700 hover:bg-pink-800">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>

                {/* Small reassurance text */}
                <p className="mt-3 text-center text-xs text-gray-500">
                  Secure checkout • Free shipping over {priceLabel(50)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
