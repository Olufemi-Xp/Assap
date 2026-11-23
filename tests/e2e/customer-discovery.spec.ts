import assert from "node:assert";
import test from "node:test";
import { providerService } from "../../src/services/provider-service.ts";

test("E2E Simulation: Customer Discovery Flow", async (t) => {
  await t.test("searches providers across Nigerian states and returns ranked items", async () => {
    const result = await providerService.searchProviders({
      state: "lagos",
      page: 1,
      pageSize: 10,
    });

    assert.ok(result.items.length > 0);
    const first = result.items[0];
    assert.ok(first.businessName);
    assert.strictEqual(first.state, "lagos");
    assert.ok(first.averageRating >= 0);
  });

  await t.test("enforces contact hiding when provider subscription is inactive", async () => {
    const result = await providerService.searchProviders({ page: 1, pageSize: 20 });
    const expiredProvider = result.items.find((p) => p.subscriptionStatusBadge === "contact_hidden");

    if (expiredProvider) {
      assert.strictEqual(expiredProvider.canContact, false);
      assert.strictEqual(expiredProvider.phoneNumber, undefined);
      assert.strictEqual(expiredProvider.whatsappNumber, undefined);
    }
  });

  await t.test("fetches individual provider details with ratings", async () => {
    const provider = await providerService.getProviderById("pr000000-0000-0000-0000-000000000001");
    assert.ok(provider);
    assert.strictEqual(provider.id, "pr000000-0000-0000-0000-000000000001");
    assert.ok(Array.isArray(provider.ratings));
  });
});
