import { test, expect, chromium } from "@playwright/test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const extensionPath = path.resolve(".output/chrome-mv3");

test("built extension manifest preserves expected pages and permissions", async () => {
  const manifest = JSON.parse(
    await fs.readFile(path.join(extensionPath, "manifest.json"), "utf8")
  );
  const packageJson = JSON.parse(
    await fs.readFile(path.resolve("package.json"), "utf8")
  );

  expect(manifest.manifest_version).toBe(3);
  expect(manifest.name).toBe("Job Scout Extension");
  expect(manifest.description).toBe("Find, save, and export job opportunities from LinkedIn content search results.");
  expect(manifest.version).toBe(packageJson.version);
  expect(manifest.icons["128"]).toBe("icons/icon-128.png");
  expect(manifest.action.default_icon["128"]).toBe("icons/icon-128.png");
  expect(manifest.action.default_popup).toBe("popup.html");
  expect(manifest.options_ui.page).toBe("options.html");
  expect(manifest.permissions).toEqual(expect.arrayContaining([
    "activeTab",
    "storage",
    "tabs",
    "unlimitedStorage"
  ]));
  expect(manifest.host_permissions).toEqual(["https://www.linkedin.com/*"]);
  expect(manifest.content_scripts[0].matches).toEqual([
    "https://www.linkedin.com/search/results/content/*"
  ]);
});

test("popup, options, and results pages load from the packed extension", async () => {
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "job-extension-e2e-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  try {
    let [serviceWorker] = context.serviceWorkers();
    serviceWorker ||= await context.waitForEvent("serviceworker");
    const extensionId = serviceWorker.url().split("/")[2];

    for (const pageName of ["popup.html", "options.html", "results.html"]) {
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));

      await page.goto(`chrome-extension://${extensionId}/${pageName}`);
      await expect(page.locator("body")).toBeVisible();
      expect(errors).toEqual([]);
      await page.close();
    }
  } finally {
    await context.close();
    await fs.rm(userDataDir, { recursive: true, force: true });
  }
});
