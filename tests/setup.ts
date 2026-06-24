import { vi } from "vitest";

Object.defineProperty(globalThis, "chrome", {
  configurable: true,
  value: {
    runtime: {
      getURL: vi.fn((path: string) => `chrome-extension://test-extension/${path.replace(/^\/+/, "")}`),
      onMessage: {
        addListener: vi.fn()
      },
      sendMessage: vi.fn()
    },
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn()
      }
    },
    tabs: {
      query: vi.fn(),
      create: vi.fn(),
      sendMessage: vi.fn(),
      onUpdated: {
        addListener: vi.fn()
      },
      onRemoved: {
        addListener: vi.fn()
      }
    }
  }
});

Object.defineProperty(globalThis, "LinkedInHiringScanner", {
  configurable: true,
  value: {}
});
