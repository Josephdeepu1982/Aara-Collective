import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
//Lucide icons
import { Minus, Plus, Trash2, ShoppingCart, DotSquare } from "lucide-react";
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
    <div>
      <div>
        <h1>Your Shopping Cart</h1>
      </div>
    </div>
  );

  //end of component
};

export default CartPage;
