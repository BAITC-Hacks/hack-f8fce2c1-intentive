import assert from "node:assert/strict";
import { spawn } from "node:child_process";

// Run after npm run build. Forces an empty key: this smoke check never calls OpenAI.
const origin = "http://localhost:3127";
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3127"], {
  windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, OPENAI_API_KEY: "", AI_DEMO_ENABLED: "true" },
});
let log = "";
child.stdout.on("data", (chunk) => { log += chunk; });
child.stderr.on("data", (chunk) => { log += chunk; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error(`Server exited: ${log}`);
    if (log.includes("Ready in")) { ready = true; break; }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, "Server must start on the dedicated smoke-test port");
  for (const [path, heading] of [["/", "AI-наставник"], ["/trajectory", "Главные навыки в фокусе"], ["/activities", "Выберите подходящий квест"]]) {
    const page = await fetch(`${origin}${path}`);
    assert.equal(page.status, 200);
    assert.ok((await page.text()).includes(heading), `Rendered page ${path} must include its main content`);
  }
  const body = { employeeId: "E0001", targetGoal: null, interests: "", learningFormat: "any", weeklyHours: "undecided", commands: [] };
  const call = (value, headers = {}) => fetch(`${origin}/api/recommendations`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, ...headers }, body: JSON.stringify(value) });
  const response = await call(body);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.source, "fallback");
  assert.equal(result.fallbackReason, "not_configured");
  assert.equal(result.result.employeeId, body.employeeId);
  assert.equal((await call({ ...body, employeeId: "UNKNOWN" })).status, 400);
  assert.equal((await call(body, { Origin: "https://unrelated.example" })).status, 403);
  assert.equal((await call({ ...body, interests: "x".repeat(40000) })).status, 413);
  console.log("Smoke passed: dashboard, trajectory, activities; AI fallback, invalid profile, cross-origin and body limit.");
} finally { child.kill(); }
