import { describe, it, expect } from "vitest";

let validateTicket;
try {
  ({ validateTicket } = await import("../ticketValidator.js"));
} catch {
  validateTicket = undefined;
}

function validTicket() {
  return {
    id: "TKT-001",
    title: "General Admission",
    eventName: "Capstone Launch Event",
    attendeeName: "Jane Doe",
    attendeeEmail: "jane@example.com",
    eventDate: "2026-12-01",
    venue: "Main Hall",
    seatNumber: "A1",
  };
}

describe("TRD §3 – Invalid Input", () => {
  it("should reject a completely empty ticket object", () => {
    expect(typeof validateTicket, "validateTicket must be a function").toBe("function");
    const result = validateTicket({});
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should reject a ticket with a missing `title`", () => {
    expect(typeof validateTicket, "validateTicket must be a function").toBe("function");
    const ticket = validTicket();
    delete ticket.title;
    const result = validateTicket(ticket);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "title")).toBe(true);
  });

  it("should reject a ticket with a missing `eventName`", () => {
    expect(typeof validateTicket, "validateTicket must be a function").toBe("function");
    const ticket = validTicket();
    delete ticket.eventName;
    const result = validateTicket(ticket);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "eventName")).toBe(true);
  });

  it("should reject a ticket with a missing `attendeeName`", () => {
    expect(typeof validateTicket, "validateTicket must be a function").toBe("function");
    const ticket = validTicket();
    delete ticket.attendeeName;
    const result = validateTicket(ticket);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "attendeeName")).toBe(true);
  });

  it("should reject a ticket with an invalid `attendeeEmail`", () => {
    expect(typeof validateTicket, "validateTicket must be a function").toBe("function");
    const ticket = validTicket();
    ticket.attendeeEmail = "not-an-email";
    const result = validateTicket(ticket);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "attendeeEmail")).toBe(true);
  });

  it("should reject a ticket with an invalid `eventDate` format", () => {
    expect(typeof validateTicket, "validateTicket must be a function").toBe("function");
    const ticket = validTicket();
    ticket.eventDate = "not-a-date";
    const result = validateTicket(ticket);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "eventDate")).toBe(true);
  });

  it("should reject a ticket whose required fields contain only whitespace", () => {
    expect(typeof validateTicket, "validateTicket must be a function").toBe("function");
    const ticket = validTicket();
    ticket.title = "   ";
    ticket.eventName = "\t\n";
    const result = validateTicket(ticket);
    expect(result.valid).toBe(false);
  });

  it("validation errors should identify field names so the UI can highlight them", () => {
    expect(typeof validateTicket, "validateTicket must be a function").toBe("function");
    const ticket = {};
    const result = validateTicket(ticket);
    expect(result.valid).toBe(false);
    result.errors.forEach((err) => {
      expect(err).toHaveProperty("field");
      expect(typeof err.field).toBe("string");
      expect(err.field.trim().length).toBeGreaterThan(0);
    });
  });

  it("should accept a valid ticket object", () => {
    expect(typeof validateTicket, "validateTicket must be a function").toBe("function");
    const result = validateTicket(validTicket());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});