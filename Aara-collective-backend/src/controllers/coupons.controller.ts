//helps check if a coupon code is valid at checkout-> gets coupon code from URL, converts to UPPERCASE, checks if coupon exists and is active, sends back a response saying wheteher the coupon is valid, and includes coupon details if any.

import type { Request, Response } from "express";
import { findActiveCoupon } from "../dao/coupon.dao.js"; //checks the database for an active coupon

const getCoupon = async (request: Request, response: Response) => {
  const couponCodeFromUrl = request.params.code; // Get the coupon code from the URL path (e.g., /coupon/SAVE10 -> request.params.code will be "SAVE10" — it grabs the :code part from the URL.)
  if (!couponCodeFromUrl) {
    return response.status(400).json({ error: "Coupon code is required" });
  }
  const couponCodeUppercase = couponCodeFromUrl.toUpperCase();
  const couponData = await findActiveCoupon(couponCodeUppercase); // Look for an active coupon in the database
  if (!couponData) {
    return response.status(404).json({ valid: false });
  }

  // If a coupon is found, send back valid: true and include the coupon details
  // coupon details: { id: "abc123", code: "SAVE10", discountPercent: 15, expiresAt: "2025-12-31T23:59:59Z", isActive: true}

  response.json({ valid: true, coupon: couponData });
};

export default getCoupon;
