import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let generateQRCode;
try {
  ({ generateQRCode } = await import("../qrService.js"));
} catch {
  generateQRCode = undefined;
}

let trackEvent;
try {
  ({ trackEvent } = await import("../analytics.js"));
} catch {
  trackEvent = undefined;
}

const EXPECTED_LOG =
  "[Analytics] User interacted with Ticket QR Code Generator Worker";

describe("TRD §7 – Analytics Simulation", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("trackEvent() should be exported from analytics.js", () => {
    expect(trackEvent, "trackEvent is not implemented yet").toBeDefined();
  });

  it('trackEvent() should log "[Analytics] User interacted with Ticket QR Code Generator Worker"', () => {
    expect(typeof trackEvent, "trackEvent must be a function").toBe("function");
    trackEvent("Ticket QR Code Generator Worker");
    const calls = consoleSpy.mock.calls.flat();
    expect(calls).toContain(EXPECTED_LOG);
  });

  it("console.log must contain the analytics message after generateQRCode succeeds", async () => {
    expect(typeof generateQRCode, "generateQRCode must be a function").toBe("function");
    const ticket = {
      id: "TKT-ANALYTICS",
      title: "Test",
      eventName: "Capstone Event",
      attendeeName: "Ana",
      attendeeEmail: "ana@example.com",
      eventDate: "2026-12-01",
      venue: "Hall A",
      seatNumber: "D4",
    };
    await generateQRCode(ticket);

    const allLogs = consoleSpy.mock.calls.flat();
    expect(allLogs).toContain(EXPECTED_LOG);
  });

  it("analytics log must NOT appear when generateQRCode fails (error path)", async () => {
    expect(typeof generateQRCode, "generateQRCode must be a function").toBe("function");
    try {
      await generateQRCode(null);
    } catch {
    }
    const allLogs = consoleSpy.mock.calls.flat();
    expect(allLogs).not.toContain(EXPECTED_LOG);
  });

  it("analytics log must appear exactly once per successful generateQRCode call", async () => {
    expect(typeof generateQRCode, "generateQRCode must be a function").toBe("function");
    const ticket = {
      id: "TKT-ONCE",
      title: "Test",
      eventName: "E",
      attendeeName: "A",
      attendeeEmail: "a@e.com",
      eventDate: "2026-01-01",
      venue: "V",
      seatNumber: "S1",
    };
    await generateQRCode(ticket);

    const matchingCalls = consoleSpy.mock.calls.filter((args) =>
      args.includes(EXPECTED_LOG),
    );
    expect(matchingCalls).toHaveLength(1);
  });
});