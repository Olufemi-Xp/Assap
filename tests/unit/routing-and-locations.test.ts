import assert from "node:assert";
import test from "node:test";
import {
  getHomeRouteForRole,
  getHomeLabelForRole,
  resolvePostAuthDestination,
  sanitizeRedirectPath,
} from "../../src/lib/routing.ts";
import {
  getCitiesForState,
  getLgasForCity,
  getLgasForState,
  normalizeLocation,
  formatLocation,
} from "../../src/lib/constants/nigeria-locations.ts";
import { NIGERIA_STATES } from "../../src/lib/constants/nigeria-states.ts";

test("Role-based routing helpers", async (t) => {
  await t.test("routes customers to /explore and providers to /provider/dashboard", () => {
    assert.strictEqual(getHomeRouteForRole("customer"), "/explore");
    assert.strictEqual(getHomeRouteForRole(null), "/explore");
    assert.strictEqual(getHomeRouteForRole("provider"), "/provider/dashboard");
    assert.strictEqual(getHomeLabelForRole("customer"), "Home");
    assert.strictEqual(getHomeLabelForRole("provider"), "Dashboard");
  });

  await t.test("prevents open redirects and cross-role leaks", () => {
    assert.strictEqual(sanitizeRedirectPath("https://evil.com"), null);
    assert.strictEqual(sanitizeRedirectPath("//evil.com"), null);
    assert.strictEqual(sanitizeRedirectPath("/"), null);
    assert.strictEqual(sanitizeRedirectPath("/auth/login"), null);
    assert.strictEqual(resolvePostAuthDestination("customer", "/providers/123"), "/providers/123");
    assert.strictEqual(resolvePostAuthDestination("customer", "/provider/dashboard"), "/explore");
    assert.strictEqual(resolvePostAuthDestination("provider", "/explore"), "/provider/dashboard");
  });
});

test("Hierarchical Nigerian Location Module (State -> City -> LGA)", async (t) => {
  await t.test("every Nigerian state has at least one city with at least one LGA", () => {
    for (const s of NIGERIA_STATES) {
      const cities = getCitiesForState(s.value);
      assert.ok(cities.length > 0, `Expected cities for state ${s.value}`);
      for (const c of cities) {
        assert.ok(c.lgas.length > 0, `Expected LGAs for ${c.name}, ${s.value}`);
      }
    }
  });

  await t.test("normalises valid hierarchies and rejects mismatched City/LGA", () => {
    const valid = normalizeLocation({
      state: "lagos",
      city: "Lagos Metropolis",
      lga: "Lagos Mainland",
    });
    assert.deepStrictEqual(valid, {
      state: "lagos",
      city: "Lagos Metropolis",
      lga: "Lagos Mainland",
    });
    assert.strictEqual(formatLocation(valid!), "Lagos Mainland, Lagos Metropolis, Lagos");

    const invalidCity = normalizeLocation({ state: "lagos", city: "Port Harcourt", lga: "" });
    assert.strictEqual(invalidCity, null);

    const invalidLga = normalizeLocation({
      state: "lagos",
      city: "Lagos Metropolis",
      lga: "Obio/Akpor",
    });
    assert.strictEqual(invalidLga, null);

    const lgas = getLgasForCity("fct", "Abuja");
    assert.ok(lgas.includes("Abuja Municipal (AMAC)"));

    const stateLgas = getLgasForState("lagos");
    assert.ok(stateLgas.includes("Ikeja"));
    assert.ok(stateLgas.includes("Ikorodu"));
  });
});
