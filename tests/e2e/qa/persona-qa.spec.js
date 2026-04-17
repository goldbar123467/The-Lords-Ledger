/**
 * Persona QA — Noob, Avg Gamer, Goat Gamer.
 *
 * Each persona plays 8 turns max, logs console errors, captures one
 * screenshot at end-of-run. Bug findings are appended to
 * `qa-findings.json` at the repo root for review.
 */

import { test, expect } from "@playwright/test";
import { startGame, dismissOverlay, playOneTurn } from "../helpers.js";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";

const FINDINGS_PATH = resolve(import.meta.dirname, "..", "..", "..", "qa-findings.json");
const SHOT_DIR = resolve(import.meta.dirname, "..", "..", "..", "playtest-screenshots");

function record(finding) {
  let out = [];
  if (existsSync(FINDINGS_PATH)) {
    try { out = JSON.parse(readFileSync(FINDINGS_PATH, "utf8")); } catch { /* empty */ }
  }
  out.push({ ts: new Date().toISOString(), ...finding });
  writeFileSync(FINDINGS_PATH, JSON.stringify(out, null, 2));
}

async function collectErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push({ type: "pageerror", msg: e.message }));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push({ type: "console", msg: msg.text() });
  });
  return errors;
}

test.describe("Persona QA", () => {
  test.describe.configure({ timeout: 120_000 });

  test("Noob — random clicker on easy", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = await collectErrors(page);
    await page.goto("/");
    await startGame(page, "easy");
    const bugs = [];

    for (let i = 0; i < 6; i++) {
      // Click every visible tab in random order
      const tabs = ["Estate", "Map", "Market", "Military", "People", "Chapel"];
      const tab = tabs[Math.floor(Math.random() * tabs.length)];
      const btn = page.locator(`button[aria-label*="${tab}"]`).first();
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(200);
        await dismissOverlay(page);
      }
      const ok = await playOneTurn(page);
      if (!ok) {
        bugs.push({ persona: "Noob", turn: i, note: "game ended / stuck before turn " + i });
        break;
      }
    }

    await page.screenshot({ path: `${SHOT_DIR}/qa-noob.png`, fullPage: true });
    record({ persona: "Noob", errors, bugs });
    expect(errors.filter(e => e.type === "pageerror").length).toBeLessThan(5);
  });

  test("Avg Gamer — builds and simulates", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = await collectErrors(page);
    await page.goto("/");
    await startGame(page, "normal");
    const bugs = [];

    // Try to build a Strip Farm
    const estate = page.locator('button[aria-label*="Estate"]').first();
    if (await estate.isVisible({ timeout: 1000 }).catch(() => false)) await estate.click();
    await page.waitForTimeout(300);
    await dismissOverlay(page);
    const build = page.getByText("Strip Farm", { exact: false }).first();
    if (await build.isVisible({ timeout: 1000 }).catch(() => false)) {
      await build.click().catch(() => {});
      await page.waitForTimeout(200);
      const buildBtn = page.locator("button").filter({ hasText: /^Build$/ }).first();
      if (await buildBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await buildBtn.click().catch(() => {});
      }
    }

    for (let i = 0; i < 8; i++) {
      const ok = await playOneTurn(page);
      if (!ok) { bugs.push({ persona: "Avg", turn: i, note: "ended early" }); break; }
    }

    await page.screenshot({ path: `${SHOT_DIR}/qa-avg.png`, fullPage: true });
    record({ persona: "Avg", errors, bugs });
    expect(errors.filter(e => e.type === "pageerror").length).toBeLessThan(3);
  });

  test("Goat Gamer — methodical full playthrough attempt", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = await collectErrors(page);
    await page.goto("/");
    await startGame(page, "hard");
    const bugs = [];

    for (let i = 0; i < 12; i++) {
      const ok = await playOneTurn(page);
      if (!ok) { bugs.push({ persona: "Goat", turn: i, note: "ended early" }); break; }
    }

    await page.screenshot({ path: `${SHOT_DIR}/qa-goat.png`, fullPage: true });
    record({ persona: "Goat", errors, bugs });
    expect(errors.filter(e => e.type === "pageerror").length).toBeLessThan(3);
  });
});
