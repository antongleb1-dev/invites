import { Router } from "express";
import { verifyCallback } from "./freedompay";
import * as db from "./db";

export const paymentCallbackRouter = Router();

// AI Package definitions
const AI_PACKAGES: Record<string, { edits: number }> = {
  start: { edits: 15 },
  pro: { edits: 50 },
  unlimited: { edits: 200 },
};

const AI_TOPUPS: Record<string, { edits: number }> = {
  small: { edits: 10 },
  medium: { edits: 30 },
};

/**
 * FreedomPay callback endpoint for premium upgrades
 * Called by FreedomPay after payment completion
 */
paymentCallbackRouter.post("/api/payment/callback", async (req, res) => {
  try {
    const params = req.body as Record<string, string>;
    
    console.log("=== FreedomPay Callback START ===");
    console.log("FreedomPay callback received:", JSON.stringify(params, null, 2));

    // Verify signature
    if (!verifyCallback(params)) {
      console.error("Invalid signature in FreedomPay callback");
      return res.status(400).send("Invalid signature");
    }
    
    console.log("Signature verified successfully");

    const { pg_order_id, pg_result, pg_payment_id } = params;

    // Extract wedding ID from order ID (format: wedding_{id}_{timestamp})
    const match = pg_order_id?.match(/^wedding_(\d+)_/);
    if (!match) {
      console.error("Invalid order ID format:", pg_order_id);
      return res.status(400).send("Invalid order ID");
    }

    const weddingId = parseInt(match[1], 10);
    console.log(`Extracted wedding ID: ${weddingId}, pg_result: ${pg_result}`);

    // Check payment result
    if (pg_result === "1") {
      // Payment successful
      console.log(`Payment successful for wedding ${weddingId}, payment ID: ${pg_payment_id}`);
      
      // Upgrade wedding to premium
      console.log(`Upgrading wedding ${weddingId} to premium...`);
      await db.upgradeWeddingToPremium(weddingId);
      console.log(`Wedding ${weddingId} upgraded to premium successfully!`);
      
      // Return success XML response
      console.log("=== FreedomPay Callback END (success) ===");
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>ok</pg_status>
  <pg_description>Payment processed successfully</pg_description>
</response>`);
    } else {
      // Payment failed
      console.log(`Payment failed for wedding ${weddingId}, pg_result: ${pg_result}`);
      
      console.log("=== FreedomPay Callback END (failed) ===");
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>error</pg_status>
  <pg_description>Payment failed</pg_description>
</response>`);
    }
  } catch (error) {
    console.error("=== FreedomPay Callback ERROR ===", error);
    return res.status(500).send("Internal server error");
  }
});

/**
 * FreedomPay callback endpoint for AI package purchases
 */
paymentCallbackRouter.post("/api/payment/ai-callback", async (req, res) => {
  try {
    const params = req.body as Record<string, string>;
    
    console.log("FreedomPay AI package callback received:", params);

    // Verify signature
    if (!verifyCallback(params)) {
      console.error("Invalid signature in FreedomPay AI callback");
      return res.status(400).send("Invalid signature");
    }

    const { pg_order_id, pg_result, pg_payment_id } = params;

    // Extract data from order ID (format: aipackage_{weddingId}_{packageId}_{timestamp})
    const match = pg_order_id?.match(/^aipackage_(\d+)_(\w+)_/);
    if (!match) {
      console.error("Invalid AI package order ID format:", pg_order_id);
      return res.status(400).send("Invalid order ID");
    }

    const weddingId = parseInt(match[1], 10);
    const packageId = match[2];

    // Check payment result
    if (pg_result === "1") {
      // Payment successful
      console.log(`AI package payment successful for wedding ${weddingId}, package: ${packageId}, payment ID: ${pg_payment_id}`);
      
      const pkg = AI_PACKAGES[packageId];
      if (!pkg) {
        console.error("Unknown AI package:", packageId);
        return res.status(400).send("Unknown package");
      }

      // Activate AI package AND free publication
      await db.updateWedding(weddingId, {
        aiPackage: packageId,
        aiEditsLimit: pkg.edits,
        aiPackagePaidAt: new Date(),
        isPaid: true, // Free publication with AI package
      } as any);
      
      // Return success XML response
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>ok</pg_status>
  <pg_description>AI package activated successfully</pg_description>
</response>`);
    } else {
      // Payment failed
      console.log(`AI package payment failed for wedding ${weddingId}`);
      
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>error</pg_status>
  <pg_description>Payment failed</pg_description>
</response>`);
    }
  } catch (error) {
    console.error("Error processing FreedomPay AI callback:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
 * FreedomPay callback endpoint for AI topup purchases
 */
paymentCallbackRouter.post("/api/payment/ai-topup-callback", async (req, res) => {
  try {
    const params = req.body as Record<string, string>;
    
    console.log("FreedomPay AI topup callback received:", params);

    // Verify signature
    if (!verifyCallback(params)) {
      console.error("Invalid signature in FreedomPay AI topup callback");
      return res.status(400).send("Invalid signature");
    }

    const { pg_order_id, pg_result, pg_payment_id } = params;

    // Extract data from order ID (format: aitopup_{weddingId}_{topupId}_{timestamp})
    const match = pg_order_id?.match(/^aitopup_(\d+)_(\w+)_/);
    if (!match) {
      console.error("Invalid AI topup order ID format:", pg_order_id);
      return res.status(400).send("Invalid order ID");
    }

    const weddingId = parseInt(match[1], 10);
    const topupId = match[2];

    // Check payment result
    if (pg_result === "1") {
      // Payment successful
      console.log(`AI topup payment successful for wedding ${weddingId}, topup: ${topupId}, payment ID: ${pg_payment_id}`);
      
      const topup = AI_TOPUPS[topupId];
      if (!topup) {
        console.error("Unknown AI topup:", topupId);
        return res.status(400).send("Unknown topup");
      }

      // Get current wedding and add edits
      const wedding = await db.getWeddingById(weddingId);
      if (!wedding) {
        console.error("Wedding not found:", weddingId);
        return res.status(400).send("Wedding not found");
      }

      const currentLimit = (wedding as any).aiEditsLimit || 0;
      await db.updateWedding(weddingId, {
        aiEditsLimit: currentLimit + topup.edits,
      } as any);
      
      // Return success XML response
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>ok</pg_status>
  <pg_description>AI edits added successfully</pg_description>
</response>`);
    } else {
      // Payment failed
      console.log(`AI topup payment failed for wedding ${weddingId}`);
      
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>error</pg_status>
  <pg_description>Payment failed</pg_description>
</response>`);
    }
  } catch (error) {
    console.error("Error processing FreedomPay AI topup callback:", error);
    return res.status(500).send("Internal server error");
  }
});

