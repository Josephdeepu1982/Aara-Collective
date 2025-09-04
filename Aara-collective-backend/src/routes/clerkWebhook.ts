import express from "express";
import type { Request, Response } from "express";
import bodyParser from "body-parser";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/clerk-sdk-node";

const router = express.Router();

type ClerkWebhookPayload = {
  type: string;
  data: { id: string; [key: string]: any };
};

router.post(
  "/clerk",
  bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    try {
      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

      const headers = {
        "svix-id": req.header("svix-id") as string,
        "svix-timestamp": req.header("svix-timestamp") as string,
        "svix-signature": req.header("svix-signature") as string,
      };

      const payload = wh.verify(req.body, headers) as ClerkWebhookPayload;

      console.log("🔍 Webhook payload:", JSON.stringify(payload, null, 2));

      switch (payload.type) {
        case "user.created": {
          const userId = payload.data.id;

          console.log(`➡️ Received user.created for ${userId}`);

          try {
            await clerkClient.users.updateUserMetadata(userId, {
              publicMetadata: { role: "user" },
            });

            console.log(`User ${userId} seeded with role=user`);
          } catch (err) {
            console.error(` Failed to update user ${userId}:`, err);
          }

          break;
        }

        default:
          console.log(`Ignored event type: ${payload.type}`);
          break;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: "Invalid webhook" });
    }
  }
);

export default router;
