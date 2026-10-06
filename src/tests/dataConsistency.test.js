import { describe, it, expect } from "vitest";

let ticketSchema, validateTicketSchema;
try {
  ({ ticketSchema, validateTicketSchema } = await import("../ticketSchema.js"));
} catch {
  ticketSchema = undefined;
  validateTicketSchema = undefined;
}

const REQUIRED_FIELDS = [
  "id",
  "title",
  "eventName",
  "attendeeName",
  "attendeeEmail",
  "eventDate",
  "venue",
  "seatNumber",
];

const FIELD_TYPES = {
  id: "string",
  title: "string",
  eventName: "string",
  attendeeName: "string",
  attendeeEmail: "string",
  eventDate: "string",
  venue: "string",
  seatNumber: "string",
};

describe("TRD §5 – Data Consistency", () => {
  it("ticketSchema must be exported from ticketSchema.js", () => {
    expect(ticketSchema, "ticketSchema is not exported yet").toBeDefined();
  });

  it("ticketSchema must list all required fields", () => {
    expect(ticketSchema, "ticketSchema is not implemented yet").toBeDefined();
    REQUIRED_FIELDS.forEach((field) => {
      expect(
        ticketSchema.required ?? ticketSchema.fields,
        `Schema is missing required field: ${field}`,
      ).toContain(field);
    });
  });

  it("ticketSchema must enforce correct types for all fields", () => {
    expect(ticketSchema, "ticketSchema is not implemented yet").toBeDefined();
    Object.entries(FIELD_TYPES).forEach(([field, expectedType]) => {
      const schemaDef = ticketSchema.properties?.[field] ?? ticketSchema[field];
      expect(
        schemaDef?.type ?? schemaDef,
        `Schema type mismatch for field: ${field}`,
      ).toBe(expectedType);
    });
  });

  it("validateTicketSchema() must return valid:true for a well-formed ticket", () => {
    expect(typeof validateTicketSchema, "validateTicketSchema must be a function").toBe("function");
    const ticket = {
      id: "TKT-001",
      title: "VIP",
      eventName: "Annual Gala",
      attendeeName: "Alice Smith",
      attendeeEmail: "alice@example.com",
      eventDate: "2026-12-25",
      venue: "Grand Hall",
      seatNumber: "B2",
    };
    const result = validateTicketSchema(ticket);
    expect(result.valid).toBe(true);
  });

  it("validateTicketSchema() should flag unknown fields (data-consistency risk)", () => {
    expect(typeof validateTicketSchema, "validateTicketSchema must be a function").toBe("function");
    const ticket = {
      id: "TKT-001",
      title: "VIP",
      eventName: "Annual Gala",
      attendeeName: "Alice Smith",
      attendeeEmail: "alice@example.com",
      eventDate: "2026-12-25",
      venue: "Grand Hall",
      seatNumber: "B2",
      __proto__: {},
      unknownField: "injected",
    };
    const result = validateTicketSchema(ticket);
    expect(
      result.valid === false || result.warnings?.length > 0,
      "Unknown fields should not be silently accepted",
    ).toBe(true);
  });

  it("ticket id must match the pattern TKT-<digits>", () => {
    expect(typeof validateTicketSchema, "validateTicketSchema must be a function").toBe("function");
    const ticket = {
      id: "INVALID_ID",
      title: "VIP",
      eventName: "Annual Gala",
      attendeeName: "Alice Smith",
      attendeeEmail: "alice@example.com",
      eventDate: "2026-12-25",
      venue: "Grand Hall",
      seatNumber: "B2",
    };
    const result = validateTicketSchema(ticket);
    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.field === "id")).toBe(true);
  });

  it("eventDate must conform to ISO 8601 (YYYY-MM-DD)", () => {
    expect(typeof validateTicketSchema, "validateTicketSchema must be a function").toBe("function");
    const ticket = {
      id: "TKT-002",
      title: "Standard",
      eventName: "Tech Expo",
      attendeeName: "Bob Jones",
      attendeeEmail: "bob@example.com",
      eventDate: "25/12/2026",
      venue: "Expo Center",
      seatNumber: "C3",
    };
    const result = validateTicketSchema(ticket);
    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.field === "eventDate")).toBe(true);
  });
});