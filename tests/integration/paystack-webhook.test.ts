import assert from "node:assert";
import test from "node:test";
import crypto from "node:crypto";
import { paystackService } from "../../src/services/paystack-service.ts";
import { env } from "../../src/lib/env.ts";

test("Paystack Webhook Signature Verification", async (t) => {
  const secret = env.PAYSTACK_SECRET_KEY;
  const payload = JSON.stringify({
    event: "charge.success",
    data: {
      reference: "TEST_REF_123",
      amount: 100000,
      metadata: { providerId: "p1" },
    },
  });

  await t.test("accepts a valid HMAC SHA-512 signature", () => {
    const validSignature = crypto.createHmac("sha512", secret).update(payload).digest("hex");
    const result = paystackService.verifyWebhookSignature(payload, validSignature);
    assert.strictEqual(result, true);
  });

  await t.test("rejects an invalid or forged signature", () => {
    const forgedSignature = "invalid_forged_signature_hash";
    const result = paystackService.verifyWebhookSignature(payload, forgedSignature);
    assert.strictEqual(result, false);
  });

  await t.test("rejects missing signature", () => {
    const result = paystackService.verifyWebhookSignature(payload, null);
    assert.strictEqual(result, false);
  });
});
