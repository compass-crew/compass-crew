import assert from "node:assert/strict";

// We test our permission model and security functions
import {
  APP_ROLES,
  ADMINISTRATIVE_ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAdminAccess,
  pickPrimaryRole,
} from "../src/lib/auth/roles.ts";

import { assertServerRole, assertServerPermission } from "../src/lib/auth/server-guards.ts";

import { sanitizeAuditMeta } from "../src/lib/auth/admin-audit.server.ts";

console.log("=== COMPASS CREW ADMIN ARCHITECTURE & SECURITY TEST SUITE ===");

// 1. Role Definitions & Hierarchy
console.log("\n[Test 1] Role definitions and administrative grouping...");
assert.ok(APP_ROLES.includes("super_admin"), "super_admin must exist in APP_ROLES");
assert.ok(APP_ROLES.includes("organizer"), "organizer must exist in APP_ROLES");
assert.ok(APP_ROLES.includes("participant"), "participant must exist in APP_ROLES");

assert.ok(ADMINISTRATIVE_ROLES.includes("super_admin"), "super_admin is administrative");
assert.ok(
  !ADMINISTRATIVE_ROLES.includes("organizer"),
  "organizer is scoped to organizer routes, not platform super_admin",
);
assert.ok(!ADMINISTRATIVE_ROLES.includes("participant"), "participant is NOT administrative");
assert.ok(!ADMINISTRATIVE_ROLES.includes("guest"), "guest is NOT administrative");
console.log("✓ Role definitions and administrative grouping verified.");

// 2. hasAdminAccess
console.log("\n[Test 2] hasAdminAccess validation...");
assert.equal(hasAdminAccess(["super_admin"]), true, "super_admin has admin access");
assert.equal(
  hasAdminAccess(["organizer"]),
  false,
  "organizer alone does NOT have admin console access",
);
assert.equal(hasAdminAccess(["participant"]), false, "participant does NOT have admin access");
assert.equal(hasAdminAccess(["guest"]), false, "guest does NOT have admin access");
assert.equal(hasAdminAccess([]), false, "empty roles does NOT have admin access");
assert.equal(
  hasAdminAccess(["participant", "super_admin"]),
  true,
  "multi-role with super_admin has admin access",
);
console.log("✓ hasAdminAccess correctly restricts access.");

// 3. Granular Permission Matrix & hasPermission
console.log("\n[Test 3] Granular Permission Matrix...");
// super_admin has universal access
assert.equal(hasPermission(["super_admin"], "users:delete"), true, "super_admin can delete users");
assert.equal(
  hasPermission(["super_admin"], "security:manage"),
  true,
  "super_admin can manage security",
);
assert.equal(
  hasPermission(["super_admin"], "system:manage"),
  true,
  "super_admin can manage system",
);

// organizer has scoped permissions
assert.equal(
  hasPermission(["organizer"], "hackathons:create"),
  true,
  "organizer can create hackathons",
);
assert.equal(hasPermission(["organizer"], "events:create"), true, "organizer can create events");
assert.equal(
  hasPermission(["organizer"], "security:manage"),
  false,
  "organizer CANNOT manage security",
);
assert.equal(hasPermission(["organizer"], "users:delete"), false, "organizer CANNOT delete users");
assert.equal(hasPermission(["organizer"], "audit:read"), false, "organizer CANNOT read audit logs");

// participant has no administrative permissions
assert.equal(
  hasPermission(["participant"], "hackathons:create"),
  false,
  "participant CANNOT create hackathons",
);
assert.equal(
  hasPermission(["participant"], "users:read"),
  false,
  "participant CANNOT read all users",
);
assert.equal(
  hasPermission(["participant"], "security:read"),
  false,
  "participant CANNOT read security",
);
console.log("✓ Granular permission matrix strictly enforced.");

// 4. pickPrimaryRole Priority
console.log("\n[Test 4] pickPrimaryRole resolution...");
assert.equal(pickPrimaryRole(["participant", "super_admin"]), "super_admin");
assert.equal(pickPrimaryRole(["participant", "judge"]), "judge");
assert.equal(pickPrimaryRole(["participant", "organizer"]), "organizer");
assert.equal(pickPrimaryRole(["participant"]), "participant");
assert.equal(pickPrimaryRole([]), "guest");
console.log("✓ pickPrimaryRole correctly prioritizes highest privilege role.");

// 5. Server Guard: assertServerRole
console.log("\n[Test 5] assertServerRole server assertion...");
// super_admin universally bypasses
assert.doesNotThrow(() => assertServerRole(["super_admin"], ["organizer"]));
assert.doesNotThrow(() => assertServerRole(["organizer"], ["organizer"]));

// Unauthorized throws 403
assert.throws(
  () => assertServerRole(["participant"], ["super_admin"]),
  /403 Forbidden/,
  "Participant must throw 403 Forbidden",
);
assert.throws(
  () => assertServerRole(["judge"], ["super_admin", "organizer"]),
  /403 Forbidden/,
  "Judge must throw 403 Forbidden for organizer action",
);
console.log("✓ assertServerRole enforces role boundary server-side.");

// 6. Server Guard: assertServerPermission
console.log("\n[Test 6] assertServerPermission server assertion...");
assert.doesNotThrow(() => assertServerPermission(["super_admin"], "security:manage"));
assert.doesNotThrow(() => assertServerPermission(["organizer"], "hackathons:create"));

assert.throws(
  () => assertServerPermission(["organizer"], "security:manage"),
  /403 Forbidden/,
  "Organizer lacks security:manage",
);
assert.throws(
  () => assertServerPermission(["participant"], "users:delete"),
  /403 Forbidden/,
  "Participant lacks users:delete",
);
console.log("✓ assertServerPermission enforces granular permission boundary.");

// 7. Audit Logging Redaction: sanitizeAuditMeta
console.log("\n[Test 7] Audit Logging Metadata Sanitization & Secret Redaction...");
const sensitivePayload = {
  userName: "Alice Builder",
  action: "password_update",
  password: "SuperSecretPassword123!",
  confirmPassword: "SuperSecretPassword123!",
  jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  apiKey: "sb_secret_9876543210abcdef",
  serviceRoleKey: "service_role_secret_key_abc",
  nestedConfig: {
    clientSecret: "oauth_client_secret_xyz",
    safeDescription: "Updated user profile settings",
    headers: {
      authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...",
    },
  },
  ip: "127.0.0.1",
};

const sanitized = sanitizeAuditMeta(sensitivePayload);

assert.equal(sanitized.password, "[REDACTED]");
assert.equal(sanitized.confirmPassword, "[REDACTED]");
assert.equal(sanitized.jwtToken, "[REDACTED]");
assert.equal(sanitized.apiKey, "[REDACTED]");
assert.equal(sanitized.serviceRoleKey, "[REDACTED]");
assert.equal(sanitized.nestedConfig.clientSecret, "[REDACTED]");
assert.equal(sanitized.nestedConfig.headers.authorization, "[REDACTED]");
assert.equal(sanitized.userName, "Alice Builder");
assert.equal(sanitized.nestedConfig.safeDescription, "Updated user profile settings");
assert.equal(sanitized.ip, "127.0.0.1");
console.log("✓ All credentials, secrets, tokens, and OAuth payloads safely redacted.");

console.log("\n==================================================");
console.log("ALL ADMIN SECURITY TESTS PASSED SUCCESSFULLY! (7/7)");
console.log("==================================================");
