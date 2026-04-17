/**
 * Shared test helpers for E2E Playwright tests.
 *
 * Provides reusable utilities for navigating the game,
 * starting sessions, and waiting for assets to load.
 */

/**
 * Wait for the title screen to be fully rendered and interactive.
 */
export async function waitForTitleScreen(page) {
  await page.waitForSelector("text=The Lord's Ledger", { timeout: 15_000 });
  // Wait for difficulty buttons to appear
  await page.waitForSelector("text=Normal", { timeout: 5_000 });
}

/**
 * Start a new game on the given difficulty.
 * Dismisses the initial tutorial popup, then returns
 * after the management phase is fully loaded.
 */
export async function startGame(page, difficulty = "normal") {
  await waitForTitleScreen(page);
  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  await page.getByText(label, { exact: false }).first().click();
  // Wait for the Dashboard to appear (management phase)
  await page.waitForSelector("text=Denarii", { timeout: 10_000 });
  // Dismiss the first tutorial popup that appears on the Estate tab
  await dismissTutorial(page);
}

/**
 * Navigate to a specific tab during the management phase.
 * Dismisses any tutorial popup that appears on the new tab.
 */
export async function navigateToTab(page, tabName) {
  // Dismiss any existing tutorial overlay first
  await dismissTutorial(page);
  const tabButton = page.locator(`button[aria-label*="${tabName}"]`);
  await tabButton.click();
  // Brief wait for tab content to render
  await page.waitForTimeout(300);
  // Dismiss tutorial popup on the newly opened tab
  await dismissTutorial(page);
}

/**
 * Wait for all images on the page to finish loading (or error).
 */
export async function waitForAllImages(page) {
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll("img"));
    return images.every((img) => img.complete);
  }, { timeout: 10_000 });
}

/**
 * Wait for Google Fonts to finish loading.
 */
export async function waitForFonts(page) {
  await page.waitForFunction(() => document.fonts.ready.then(() => true), {
    timeout: 15_000,
  });
}

/**
 * Dismiss the tutorial popup if one is visible.
 * The tutorial has a fixed overlay with an "I Understand" button,
 * or can be dismissed by clicking the backdrop.
 */
export async function dismissTutorial(page) {
  // Try clicking "I Understand" button first
  const dismissButton = page.getByText("I Understand", { exact: true }).first();
  if (await dismissButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await dismissButton.click();
    await page.waitForTimeout(300);
    return;
  }
  // Also try clicking the backdrop overlay
  const overlay = page.locator(".fixed.inset-0.z-50").first();
  if (await overlay.isVisible({ timeout: 500 }).catch(() => false)) {
    await overlay.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);
  }
}

/**
 * Dismiss any overlay that might be blocking interaction.
 * Handles: Scribe's Note, Tutorial popup, Raid screen buttons.
 * Returns true if an overlay was dismissed.
 */
export async function dismissOverlay(page) {
  // Scribe's Note overlay — has a "Continue" button inside a fixed z-50 div
  const scribesNote = page.locator(".fixed.inset-0.z-50 button").filter({ hasText: "Continue" });
  if (await scribesNote.isVisible({ timeout: 300 }).catch(() => false)) {
    await scribesNote.click();
    await page.waitForTimeout(300);
    return true;
  }

  // Tutorial popup
  const tutorial = page.getByText("I Understand", { exact: true });
  if (await tutorial.isVisible({ timeout: 300 }).catch(() => false)) {
    await tutorial.click();
    await page.waitForTimeout(300);
    return true;
  }

  return false;
}

/**
 * Play through one complete turn, handling all intermediate screens
 * (events, resolves, flips, raids, scribes notes, tutorials).
 * Returns true if back in management, false if game ended.
 */
export async function playOneTurn(page) {
  if (page.isClosed && page.isClosed()) return false;
  const simBtn = page.locator('button[aria-label*="Simulate"]');
  if (!(await simBtn.isVisible({ timeout: 2_000 }).catch(() => false))) {
    return false;
  }
  await simBtn.click().catch(() => {});

  for (let i = 0; i < 60; i++) {
    try {
      await page.waitForTimeout(200);
    } catch {
      return false;
    }
    if (page.isClosed && page.isClosed()) return false;

    // Check for game over
    if (await page.getByText("Try Again", { exact: true }).isVisible({ timeout: 200 }).catch(() => false)) {
      return false;
    }

    // Check for victory
    if (await page.getByText("Reign Again", { exact: true }).isVisible({ timeout: 200 }).catch(() => false)) {
      return false;
    }

    // Check if back in management
    if (await simBtn.isVisible({ timeout: 200 }).catch(() => false)) {
      // Make sure no overlay is blocking
      if (!(await dismissOverlay(page))) {
        return true;
      }
      continue;
    }

    // Priority 1: Dismiss any overlay (scribe's note, tutorial, raid)
    // by clicking the LAST matching button (topmost in stacking order).
    const overlayBtns = page.locator(".fixed.inset-0 button");
    const overlayCount = await overlayBtns.count();
    if (overlayCount > 0) {
      // Click the last overlay button (topmost z-index layer)
      await overlayBtns.last().click({ timeout: 2_000 }).catch(() => {});
      continue;
    }

    // Priority 2: Event / flip choices (both "Choose your response" and "Choose your path")
    const choices = page.locator('[role="group"] button');
    if (await choices.first().isVisible({ timeout: 200 }).catch(() => false)) {
      await choices.first().click();
      continue;
    }

    // Priority 3: Continue/resolve/progression buttons
    const continueBtn = page.locator("button").filter({
      hasText: /See What Happens Next|^Continue$|See Your Legacy|See the Consequences|Return to Your Reign|Defend|^Begin$|Proceed|Accept|^Done$|Return/,
    });
    if (await continueBtn.first().isVisible({ timeout: 200 }).catch(() => false)) {
      await continueBtn.last().click();
      continue;
    }
  }

  return simBtn.isVisible({ timeout: 1_000 }).catch(() => false);
}

/**
 * Get the computed style property of an element.
 */
export async function getComputedStyleProp(page, selector, property) {
  return page.evaluate(
    ({ sel, prop }) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return window.getComputedStyle(el).getPropertyValue(prop);
    },
    { sel: selector, prop: property }
  );
}
