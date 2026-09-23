import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { importDataset } from "../core/dataset/import.ts";
import { prepareRecommendations } from "../server/ai/context.ts";
import { runRecommendationAgent } from "../server/ai/graph.ts";
import { createOpenAIProvider } from "../server/ai/openai-transport.ts";
import { readAIConfig } from "../server/ai/config.ts";
import { aiRequestSchema } from "../core/ai/contracts.ts";
import { createUserStore } from "../stores/career-store.ts";

const read = (name) => readFileSync(new URL(`../career_quest_dataset/${name}`, import.meta.url), "utf8");
const base = importDataset({ employees: read("employees.json"), events: read("events.json"), skills: read("skills.json"), activityHistoryCsv: read("activity_history.csv") });
const request = { employeeId: base.employees[0].employee_id, targetGoal: base.employees[0].career_goal, interests: "System Design", learningFormat: "any", weeklyHours: "undecided", commands: [] };
const prepared = prepareRecommendations(base, request);
const input = { ...prepared, interests: request.interests };
const config = readAIConfig({});
const coaching = { explanation: "AI explains the personal skill gap and the priority of this activity.", firstStep: "AI suggests a small practical exercise to begin developing the skill." };
const summary = "AI synthesizes the current role, target and a recommended learning sequence.";
const choices = (items) => ({ summary, choices: items.map((item) => ({ eventId: item.eventId, reasonIds: [2, 0, 1], ...coaching })) });
const success = async () => runRecommendationAgent(input, config, async () => choices(prepared.result.recommendations));

test("LangGraph preserves AI coaching alongside computed facts and omits employee identifiers from context", async () => {
  let sent;
  const result = await runRecommendationAgent(input, config, async (context) => { sent = context; return choices(prepared.result.recommendations); });
  assert.equal(result.source, "ai");
  assert.deepEqual(result.feedback, choices(prepared.result.recommendations));
  assert.equal(result.result.recommendations[0].reasons[0], prepared.result.recommendations[0].reasons[2]);
  assert.ok(!sent.includes(base.employees[0].full_name));
  assert.ok(!sent.includes(base.employees[0].employee_id));
  assert.deepEqual(result.result.recommendations[0].evidence, prepared.result.recommendations[0].evidence);
});

test("no key and no candidates fall back without calling the provider", async () => {
  assert.equal((await runRecommendationAgent(input, config, null)).fallbackReason, "not_configured");
  let called = false;
  const empty = { ...input, result: { ...input.result, candidates: [] } };
  assert.equal((await runRecommendationAgent(empty, config, async () => { called = true; })).fallbackReason, "no_candidates");
  assert.equal(called, false);
});

test("invalid IDs, duplicate choices, omitted factors and unexpected fields trigger fallback", async () => {
  const first = prepared.result.recommendations[0].eventId;
  for (const output of [
    { choices: [{ eventId: "INVENTED", reasonIds: [0, 1, 2] }] },
    { choices: [{ eventId: first, reasonIds: [0, 1, 1] }] },
    { choices: [{ eventId: first, reasonIds: [0, 1, 9] }] },
    { choices: [{ eventId: first, reasonIds: [0, 1, 2], inventedField: "unexpected" }] },
    { choices: [{ eventId: first, reasonIds: [0, 1, 2] }, { eventId: first, reasonIds: [0, 1, 2] }] },
  ]) assert.equal((await runRecommendationAgent(input, config, async () => ({ summary,
    choices: output.choices.map((choice) => ({ ...coaching, ...choice })),
  }))).fallbackReason, "invalid_output");
});

test("missing, blank or oversized coaching cannot be presented as a successful AI response", async () => {
  const valid = choices(prepared.result.recommendations);
  for (const output of [
    { choices: valid.choices }, { ...valid, summary: " ".repeat(30) }, { ...valid, summary: "x".repeat(1401) },
    { ...valid, choices: valid.choices.map(({ firstStep, ...choice }) => choice) },
    { ...valid, choices: valid.choices.map((choice) => ({ ...choice, explanation: "" })) },
  ]) {
    const result = await runRecommendationAgent(input, config, async () => output);
    assert.equal(result.fallbackReason, "invalid_output");
    assert.equal(result.feedback, null);
  }
});

test("explain mode preserves calculated activities and their order", async () => {
  const explain = { ...config, role: "explain" };
  assert.equal((await runRecommendationAgent(input, explain, async () => choices(prepared.result.recommendations))).source, "ai");
  assert.ok(prepared.result.recommendations.length > 1);
  assert.equal((await runRecommendationAgent(input, explain, async () => choices([...prepared.result.recommendations].reverse()))).fallbackReason, "invalid_output");
});

test("provider errors and deadlines fall back; deadline aborts even a non-cooperative provider", async () => {
  assert.equal((await runRecommendationAgent(input, config, async () => { throw new Error("test"); })).fallbackReason, "provider_error");
  let signal;
  const result = await runRecommendationAgent(input, { ...config, timeoutMs: 50 }, (_, value) => { signal = value; return new Promise(() => {}); });
  assert.equal(result.fallbackReason, "timeout");
  assert.equal(signal.aborted, true);
});

test("OpenAI transport uses Responses, strict schema, server bearer key and store=false", async () => {
  let sent;
  const provider = createOpenAIProvider("test-only-key", config, async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    assert.equal(options.headers.Authorization, "Bearer test-only-key");
    sent = JSON.parse(options.body);
    return Response.json({ status: "completed", output: [{ type: "reasoning" }, { type: "message", content: [{ type: "output_text", text: JSON.stringify(choices(prepared.result.recommendations)) }] }] });
  });
  const result = await provider("facts", new AbortController().signal);
  assert.ok(result.choices.length);
  assert.equal(sent.store, false);
  assert.equal(sent.text.format.strict, true);
  assert.equal(sent.model, config.model);
  assert.ok(!JSON.stringify(result).includes("test-only-key"));
  assert.match(sent.instructions, /Preserve supplied course, role, and skill names exactly as written/);
});

test("AI requests use the selected language and discard responses after a language change", async () => {
  const result = await success();
  let resolve;
  let sent;
  const store = createUserStore(base, (_url, options) => {
    sent = JSON.parse(options.body);
    return new Promise((done) => { resolve = done; });
  });
  const pending = store.getState().requestAIRecommendations();
  assert.equal(sent.language, "en");
  store.getState().setLanguage("ru");
  resolve(Response.json(result));
  await pending;
  assert.equal(store.getState().ai.status, "idle");
  assert.equal(store.getState().ai.response, null);
  let providerLanguage;
  await runRecommendationAgent({ ...input, language: "en" }, config, async (_context, _signal, language) => {
    providerLanguage = language;
    return choices(prepared.result.recommendations);
  });
  assert.equal(providerLanguage, "en");
});

test("OpenAI incomplete, refusal and HTTP errors cannot become accepted output", async () => {
  for (const response of [new Response("denied", { status: 401 }), Response.json({ status: "incomplete" }),
    Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "refusal" }] }] })]) {
    const provider = createOpenAIProvider("test-only", config, async () => response);
    await assert.rejects(provider("facts", new AbortController().signal));
  }
});

test("provider failures reach the UI as safe diagnostic reasons, without raw response data", async () => {
  for (const [status, code, reason] of [
    [401, "invalid_api_key", "authentication"],
    [429, "insufficient_quota", "quota"],
    [429, "rate_limit_exceeded", "rate_limit"],
    [404, "model_not_found", "model_unavailable"],
    [400, "unsupported_parameter", "provider_configuration"],
    [500, "server_error", "provider_error"],
  ]) {
    const provider = createOpenAIProvider("test-only", config, async () => Response.json({
      error: { code, message: "PRIVATE_PROVIDER_DETAILS" },
    }, { status }));
    const result = await runRecommendationAgent(input, config, provider);
    assert.equal(result.source, "fallback");
    assert.equal(result.fallbackReason, reason);
    assert.ok(!JSON.stringify(result).includes("PRIVATE_PROVIDER_DETAILS"));
  }
});

test("server replay matches local demo history and rejects cross-employee commands", () => {
  const store = createUserStore(base);
  const active = base.activity_history.find((record) => record.status === "overdue" && base.events.find((event) => event.event_id === record.event_id)?.mandatory);
  assert.ok(active);
  store.getState().selectEmployee(active.employee_id);
  const replayRequest = { ...request, employeeId: active.employee_id, targetGoal: null };
  assert.equal(store.getState().completeActivity(active.employee_id, active.record_id).ok, true);
  const commands = store.getState().activityCommands;
  const replayed = prepareRecommendations(base, { ...replayRequest, commands });
  assert.deepEqual(replayed.dataset.activity_history, store.getState().dataset.activity_history);
  assert.throws(() => prepareRecommendations(base, { ...replayRequest, commands: [{ ...commands[0], employeeId: "OTHER" }] }), /another employee/);
  assert.throws(() => prepareRecommendations(base, { ...request, commands: [{ kind: "start", employeeId: request.employeeId, eventId: "EV_001", recordId: `LOCAL_${request.employeeId}_1` }] }), /not available/);
});

test("request contract rejects supplied scores and oversized input", () => {
  assert.equal(aiRequestSchema.safeParse({ ...request, scores: [1] }).success, false);
  assert.equal(aiRequestSchema.safeParse({ ...request, interests: "x".repeat(2001) }).success, false);
  assert.equal(readAIConfig({ AI_TIMEOUT_MS: "25000" }).timeoutMs, 25000);
  assert.throws(() => readAIConfig({ AI_TIMEOUT_MS: "31000" }));
});

test("client accepts success but ignores late responses after profile or preference changes", async () => {
  const result = await success();
  const store = createUserStore(base, async () => Response.json(result));
  await store.getState().requestAIRecommendations();
  assert.equal(store.getState().ai.status, "ready");
  assert.equal(store.getState().ai.response.source, "ai");
  assert.deepEqual(store.getState().ai.response.feedback, result.feedback);
  for (const change of [state => state.selectEmployee(base.employees[1].employee_id), state => state.updatePreferences({ interests: "Changed" })]) {
    let resolve;
    const pending = createUserStore(base, () => new Promise((done) => { resolve = done; }));
    const promise = pending.getState().requestAIRecommendations();
    change(pending.getState());
    resolve(Response.json(result));
    await promise;
    assert.equal(pending.getState().ai.status, "idle");
    assert.equal(pending.getState().ai.response, null);
  }
});

test("client rejects legacy success without coaching and explanations attached to other activities", async () => {
  const result = await success();
  for (const feedback of [undefined, { ...result.feedback, choices: result.feedback.choices.map((choice) => ({ ...choice, eventId: "OTHER" })) }]) {
    const store = createUserStore(base, async () => Response.json({ ...result, feedback }));
    await store.getState().requestAIRecommendations();
    assert.equal(store.getState().ai.status, "error");
    assert.equal(store.getState().ai.response, null);
  }
});

test("client deduplicates concurrent clicks and keeps deterministic UI on network failure", async () => {
  let calls = 0;
  let resolve;
  const store = createUserStore(base, () => { calls++; return new Promise((done) => { resolve = done; }); });
  const first = store.getState().requestAIRecommendations();
  await store.getState().requestAIRecommendations();
  assert.equal(calls, 1);
  resolve(new Response("rate limited", { status: 429 }));
  await first;
  assert.equal(store.getState().ai.status, "error");
  assert.equal(store.getState().ai.response, null);
});
