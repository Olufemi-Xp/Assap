import assert from "node:assert";
import test from "node:test";
import { isSubscriptionActive, sanitizeProviderContact } from "../../src/lib/contact-sanitizer.ts";

test("Subscription Rules & Zero Grace Period Enforcement", async (t) => {
  await t.test("returns true when status is active and current_period_end is in the future", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(); // +5 days
    const active = isSubscriptionActive({
      status: "active",
      currentPeriodEnd: futureDate,
    });
    assert.strictEqual(active, true);
  });

  await t.test("returns false when current_period_end has passed (zero grace period)", () => {
    const pastDate = new Date(Date.now() - 1000).toISOString(); // -1 second
    const active = isSubscriptionActive({
      status: "active",
      currentPeriodEnd: pastDate,
    });
    assert.strictEqual(active, false);
  });

  await t.test("returns false when status is not active even if future date", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    assert.strictEqual(
      isSubscriptionActive({ status: "expired", currentPeriodEnd: futureDate }),
      false
    );
    assert.strictEqual(
      isSubscriptionActive({ status: "pending_payment", currentPeriodEnd: futureDate }),
      false
    );
  });
});

test("Contact Sanitizer Sanitization Rules", async (t) => {
  const provider = {
    id: "p1",
    businessName: "Tunde Plumbing",
    phoneNumber: "+2348012345678",
    whatsappNumber: "+2348012345678",
  };

  await t.test("exposes phone and WhatsApp when subscription is active", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString();
    const sanitized = sanitizeProviderContact(provider, {
      status: "active",
      currentPeriodEnd: futureDate,
    });

    assert.strictEqual(sanitized.canContact, true);
    assert.strictEqual(sanitized.phoneNumber, "+2348012345678");
    assert.strictEqual(sanitized.whatsappNumber, "+2348012345678");
  });

  await t.test("strips phone and WhatsApp completely when subscription is expired", () => {
    const pastDate = new Date(Date.now() - 5000).toISOString();
    const sanitized = sanitizeProviderContact(provider, {
      status: "active",
      currentPeriodEnd: pastDate,
    });

    assert.strictEqual(sanitized.canContact, false);
    assert.strictEqual(sanitized.phoneNumber, undefined);
    assert.strictEqual(sanitized.whatsappNumber, undefined);
    assert.strictEqual(sanitized.subscriptionStatusBadge, "contact_hidden");
    assert.strictEqual("phoneNumber" in sanitized, false);
    assert.strictEqual("whatsappNumber" in sanitized, false);
  });
});
