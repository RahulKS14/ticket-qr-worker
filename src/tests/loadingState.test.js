import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let generateQRCode, getLoadingState;
try {
  ({ generateQRCode, getLoadingState } = await import("../qrService.js"));
} catch {
  generateQRCode = undefined;
  getLoadingState = undefined;
}

describe("TRD §4 – Loading State", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("generateQRCode() should return a Promise", () => {
    expect(typeof generateQRCode, "generateQRCode must be a function").toBe("function");
    const result = generateQRCode({ id: "TKT-001", title: "Test" });
    expect(result).toBeInstanceOf(Promise);
  });

  it("loading state should be true while generateQRCode is running", async () => {
    expect(typeof generateQRCode, "generateQRCode must be a function").toBe("function");
    expect(typeof getLoadingState, "getLoadingState must be a function").toBe("function");

    const promise = generateQRCode({ id: "TKT-001", title: "Test" });
    expect(getLoadingState()).toBe(true);

    await promise;
    expect(getLoadingState()).toBe(false);
  });

  it("loading state should be false after generateQRCode resolves successfully", async () => {
    expect(typeof generateQRCode, "generateQRCode must be a function").toBe("function");
    expect(typeof getLoadingState, "getLoadingState must be a function").toBe("function");
    await generateQRCode({ id: "TKT-001", title: "Test" });
    expect(getLoadingState()).toBe(false);
  });

  it("loading state should be false after generateQRCode rejects (error case)", async () => {
    expect(typeof generateQRCode, "generateQRCode must be a function").toBe("function");
    expect(typeof getLoadingState, "getLoadingState must be a function").toBe("function");
    try {
      await generateQRCode(null);
    } catch {
    }
    expect(getLoadingState()).toBe(false);
  });

  it("should remain in loading state for the full duration of a slow operation", async () => {
    expect(typeof generateQRCode, "generateQRCode must be a function").toBe("function");
    expect(typeof getLoadingState, "getLoadingState must be a function").toBe("function");

    const slowFetch = () =>
      new Promise((resolve) => setTimeout(resolve, 5000));

    const spy = vi.fn(slowFetch);
    const promise = generateQRCode({ id: "TKT-SLOW", title: "Slow Test" }, spy);

    vi.advanceTimersByTime(2000);
    expect(getLoadingState()).toBe(true);

    vi.advanceTimersByTime(3000);
    await promise;
    expect(getLoadingState()).toBe(false);
  });

  it("DOM should contain a loading indicator element while operation is pending", () => {
    expect(typeof generateQRCode, "generateQRCode must be a function").toBe("function");
    document.body.innerHTML = '<div id="app"></div>';

    generateQRCode({ id: "TKT-001", title: "Test" });

    const spinner =
      document.querySelector('[role="status"]') ||
      document.querySelector('[aria-busy="true"]') ||
      document.querySelector(".loading") ||
      document.querySelector('[data-testid="loading-indicator"]');

    expect(spinner).not.toBeNull();
  });
});