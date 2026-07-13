import assert from "node:assert/strict";
import { trackingPlanEvents } from "../tracking-plan.config.mjs";

const apiBaseUrl =
  process.env.LOOPAD_DASHBOARD_API_BASE_URL ??
  "https://dashboard.api.dev.loop-ad.org/api";
const projectId =
  process.env.LOOPAD_TRACKING_PLAN_PROJECT_ID ??
  "project_c05e7270-4f01-40e5-93e2-945673509cf4";
const sdkKey =
  process.env.LOOPAD_SDK_KEY ??
  "wk_b35b42ee88bb4469becef289cdf29c57";
const allowedOrigin =
  process.env.LOOPAD_ALLOWED_ORIGIN ??
  "https://demo-shoppingmall.dev.loop-ad.org";
const projectPath = `/dashboard/v1/projects/${encodeURIComponent(projectId)}`;

const plan = await request(`${projectPath}/tracking-plan`);
const existingNames = new Set(plan.events.map((event) => event.eventName));

await request(`${projectPath}/sdk-settings`, {
  method: "PATCH",
  body: { allowedOrigins: [allowedOrigin] },
});

for (const event of trackingPlanEvents) {
  const eventPath = `${projectPath}/tracking-plan/events/${encodeURIComponent(event.eventName)}`;
  if (existingNames.has(event.eventName)) {
    await request(eventPath, {
      method: "PATCH",
      body: {
        description: event.description,
        propertiesSchema: event.propertiesSchema,
      },
    });
  } else {
    await request(`${projectPath}/tracking-plan/events`, {
      method: "POST",
      body: event,
    });
  }
}

const validation = await request(`${projectPath}/tracking-plan/validate`, {
  method: "POST",
  body: {},
});
assert.deepEqual(validation, { valid: true, issues: [] });

const publishedPlan = await request(`${projectPath}/tracking-plan/publish`, {
  method: "POST",
  body: {},
});
assert.equal(publishedPlan.sdkKey, sdkKey);
assert.equal(publishedPlan.status, "published");

const connectionPath = `/public/v1/sdk/connections/${encodeURIComponent(sdkKey)}`;
const connection = await request(connectionPath, {
  headers: { Origin: allowedOrigin },
});
const schema = await request(`${connectionPath}/schema`, {
  headers: { Origin: allowedOrigin },
});

assert.equal(connection.projectId, projectId);
assert.equal(connection.writeKey, sdkKey);
assert.equal(connection.revision, publishedPlan.publishedRevision);
assert.equal(connection.schemaVersion, schema.schemaVersion);
assert.deepEqual(connection.events, schema.events);
assert.deepEqual(
  connection.events.map((event) => event.eventName).sort(),
  trackingPlanEvents.map((event) => event.eventName).sort(),
);

console.info(
  JSON.stringify({
    connectionUrl: `${apiBaseUrl}${connectionPath}`,
    schemaUrl: `${apiBaseUrl}${connectionPath}/schema`,
    revision: connection.revision,
    eventCount: connection.events.length,
  }),
);

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const value = await response.json();
  if (!response.ok) {
    throw new Error(
      `${options.method ?? "GET"} ${path} failed with HTTP ${response.status}: ${JSON.stringify(value)}`,
    );
  }
  return value.data ?? value;
}
