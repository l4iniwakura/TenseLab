// Capture real application screens. Start Vite preview on port 4173 first.
import { chromium } from "../frontend/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
const out = resolve("landing/assets");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
});
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    deviceScaleFactor: 1,
  });
  const url = process.env.CAPTURE_URL || "http://127.0.0.1:4173/TenseLab/app/";
  await page.goto(url);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if ((await page.locator("html").getAttribute("data-theme")) === "dark") {
    await page
      .getByRole("button", { name: "Переключить цветовую тему" })
      .click();
  }
  await page.getByRole("button", { name: /Показать ответ/ }).click();
  const main = page.locator("main");
  await main.screenshot({
    path: resolve(out, "drill.png"),
    animations: "disabled",
  });
  await page.goto(`${url}#reference`);
  await main.screenshot({
    path: resolve(out, "reference.png"),
    animations: "disabled",
  });
  await page.goto(`${url}#progress`);
  await main.screenshot({
    path: resolve(out, "progress.png"),
    animations: "disabled",
  });
  await page.goto(`${url}#translation`);
  if ((await page.locator("html").getAttribute("data-theme")) !== "dark") {
    await page
      .getByRole("button", { name: "Переключить цветовую тему" })
      .click();
  }
  await main.screenshot({
    path: resolve(out, "translation.png"),
    animations: "disabled",
  });
  console.log("Captured four real application screens in landing/assets/*.png");
} finally {
  await browser.close();
}
