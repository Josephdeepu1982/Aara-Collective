import type { RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const requireAdmin: RequestHandler = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

    if (process.env.NODE_ENV === "development") return next();

    const user = await clerkClient.users.getUser(auth.userId);
    const role =
      (user.publicMetadata as any)?.role ??
      (user.privateMetadata as any)?.role ??
      (user.unsafeMetadata as any)?.role ??
      (auth.sessionClaims as any)?.publicMetadata?.role ??
      (auth.sessionClaims as any)?.metadata?.role;

    if (role === "admin") return next();
    return res.status(403).json({ error: "Admin privileges required" });
  } catch (err) {
    console.error("requireAdmin error:", err);
    return res.status(500).json({ error: "Auth check failed" });
  }
};
