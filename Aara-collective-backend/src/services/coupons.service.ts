//This function checks if a coupon code was entered by the user. If it was, it looks up the coupon in the database to see if it's valid and active.
//Then it returns the coupon info along with a default discount value (which is currently set to 0 cents).

import { findActiveCoupon } from "../dao/coupon.dao.js"; //helper function to search the database for a coupon using a code.

//function checks if a coupon code is provided and finds the coupon if it exists
const resolveCoupon = async (enteredCouponCode?: string) => {
  //If no coupon code was entered, we return: discountCents: 0: no discount applied & coupon: null: no coupon object found
  if (!enteredCouponCode) {
    return {
      discountCents: 0,
      coupon: null,
    };
  }

  //If a coupon code was entered, we use the helper function to look it up in the database.
  const foundCoupon = await findActiveCoupon(enteredCouponCode);

  // return the coupon object (if found) and a default discount value of 0 cents.
  return {
    coupon: foundCoupon,
    discountCents: 0, //calculate the actual discount later based on the coupon’s rules.
  };
};

export default resolveCoupon;
