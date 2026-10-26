"use strict";

importScripts("catalog.js");

const USAGE_STORAGE_KEY = "scriptShelfUsageStats";
const RUN_SCRIPT_MESSAGE = "script-shelf:run";
const LIST_SCRIPTS_MESSAGE = "script-shelf:list-available";

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["catalog.js", "overlay.js"],
      world: "ISOLATED"
    });
  } catch (error) {
    console.warn("Script Shelf could not open on this page:", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === LIST_SCRIPTS_MESSAGE) {
    listAvailableScripts()
      .then((filenames) => sendResponse({ ok: true, filenames }))
      .catch((error) => sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      }));
    return true;
  }

  if (message?.type !== RUN_SCRIPT_MESSAGE) return false;

  const tabId = sender.tab?.id;
  const filename = message.filename;

  if (!tabId || !isAllowedScript(filename)) {
    sendResponse({ ok: false, error: "That script is not available." });
    return false;
  }

  runScriptAndRemember(tabId, filename)
    .then(() => sendResponse({ ok: true }))
    .catch((error) => {
      console.error("Script Shelf error:", { filename, error });
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    });

  return true;
});

function isAllowedScript(filename) {
  return (
    typeof filename === "string" &&
    Array.isArray(globalThis.SCRIPT_CATALOG) &&
    globalThis.SCRIPT_CATALOG.includes(filename)
  );
}

// Catalog entries for scripts not bundled in this ZIP stay hidden until those
// files are copied into the scripts/ directory and the extension is reloaded.
async function listAvailableScripts() {
  const candidates = Array.isArray(globalThis.SCRIPT_CATALOG)
    ? globalThis.SCRIPT_CATALOG.filter((filename) =>
        typeof filename === "string" &&
        /^[a-zA-Z0-9_-]+\.js$/.test(filename)
      )
    : [];

  const availability = await Promise.all(
    candidates.map(async (filename) => {
      try {
        const response = await fetch(chrome.runtime.getURL(`scripts/${filename}`));
        return response.ok;
      } catch {
        return false;
      }
    })
  );

  return candidates.filter((_, index) => availability[index]);
}

async function runScriptAndRemember(tabId, filename) {
  const available = await listAvailableScripts();
  if (!available.includes(filename)) {
    throw new Error("This script file is not installed in scripts/.");
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [`scripts/${filename}`],
    world: "ISOLATED"
  });

  await rememberScriptUse(filename);
}

async function rememberScriptUse(filename) {
  const stored = await chrome.storage.local.get(USAGE_STORAGE_KEY);
  const stats = normalizeStats(stored[USAGE_STORAGE_KEY]);
  const previous = stats[filename];

  stats[filename] = {
    count: previous && Number.isFinite(previous.count) ? previous.count + 1 : 1,
    lastUsed: Date.now()
  };

  await chrome.storage.local.set({ [USAGE_STORAGE_KEY]: stats });
}

function normalizeStats(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}
