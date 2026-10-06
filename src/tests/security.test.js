import { describe, it, expect } from "vitest";

let sanitizeInput, storeTicket, getStoredTicket;
try {
  ({ sanitizeInput } = await import("../sanitizer.js"));
} catch {
  sanitizeInput = undefined;
}
try {
  ({ storeTicket, getStoredTicket } = await import("../ticketStore.js"));
} catch {
  storeTicket = undefined;
  getStoredTicket = undefined;
}

const XSS_PAYLOADS = [
  "<script>alert('XSS')</script>",
  '<img src=x onerror="alert(1)">',
  "javascript:alert(1)",
  "<svg onload=alert(1)>",
  '"><script>alert(document.cookie)</script>',
  "'; DROP TABLE tickets; --",
  "<iframe src='javascript:alert(1)'>",
];

describe("TRD §6 – Security / Input Sanitization", () => {
  it("sanitizeInput() should be exported from sanitizer.js", () => {
    expect(sanitizeInput, "sanitizeInput is not implemented yet").toBeDefined();
  });

  it("sanitizeInput() must strip or encode <script> tags", () => {
    expect(typeof sanitizeInput, "sanitizeInput must be a function").toBe("function");
    const raw = "<script>alert('XSS')</script>";
    const result = sanitizeInput(raw);
    expect(result).not.toMatch(/<script[\s>]/i);
  });

  XSS_PAYLOADS.forEach((payload, index) => {
    it(`sanitizeInput() must neutralize XSS payload #${index + 1}: ${payload.slice(0, 40)}`, () => {
      expect(typeof sanitizeInput, "sanitizeInput must be a function").toBe("function");
      const result = sanitizeInput(payload);
      expect(result).not.toBe(payload);
      expect(result).not.toMatch(/<script[\s>]/i);
      expect(result).not.toMatch(/on\w+\s*=/i);
      expect(result).not.toMatch(/javascript\s*:/i);
    });
  });

  it("storeTicket() must store sanitized data, not the raw XSS payload", () => {
    expect(typeof storeTicket, "storeTicket must be a function").toBe("function");
    expect(typeof getStoredTicket, "getStoredTicket must be a function").toBe("function");

    const maliciousTicket = {
      id: "TKT-XSS",
      title: "<script>alert('XSS')</script>",
      eventName: '<img src=x onerror="alert(1)">Annual Gala',
      attendeeName: "Eve Hacker",
      attendeeEmail: "eve@evil.com",
      eventDate: "2026-12-01",
      venue: "Main Hall",
      seatNumber: "Z99",
    };

    storeTicket(maliciousTicket);
    const stored = getStoredTicket("TKT-XSS");

    expect(stored).toBeDefined();
    expect(stored.title).not.toMatch(/<script[\s>]/i);
    expect(stored.eventName).not.toMatch(/onerror\s*=/i);
  });

  it("sanitizeInput() must preserve safe plain text unchanged", () => {
    expect(typeof sanitizeInput, "sanitizeInput must be a function").toBe("function");
    const safeText = "General Admission – Row B, Seat 12";
    const result = sanitizeInput(safeText);
    expect(result).toBe(safeText);
  });

  it("storeTicket() must not allow __proto__ injection to corrupt app state", () => {
    expect(typeof storeTicket, "storeTicket must be a function").toBe("function");
    const ticket = JSON.parse(
      '{"id":"TKT-PROTO","__proto__":{"polluted":true},"title":"Safe","eventName":"E","attendeeName":"A","attendeeEmail":"a@b.com","eventDate":"2026-01-01","venue":"V","seatNumber":"S1"}',
    );
    storeTicket(ticket);
    expect({}.polluted).toBeUndefined();
  });
});