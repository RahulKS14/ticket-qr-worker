import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let apiClient;
try {
  ({ apiClient } = await import("../apiClient.js"));
} catch {
  apiClient = undefined;
}

const TICKET_ENTITY_FIELDS = {
  id: "string",
  title: "string",
  eventName: "string",
  attendeeName: "string",
  attendeeEmail: "string",
  eventDate: "string",
  venue: "string",
  seatNumber: "string",
  qrCodeUrl: "string",
  createdAt: "string",
  status: "string",
};

const SUCCESS_RESPONSE_SHAPE = {
  success: true,
  data: "object",
  message: "string",
  statusCode: "number",
};

const ERROR_RESPONSE_SHAPE = {
  success: false,
  error: "object",
  statusCode: "number",
};

function assertShape(obj, shape, label) {
  Object.entries(shape).forEach(([key, expectedType]) => {
    expect(
      obj,
      `${label}: response is missing field "${key}"`,
    ).toHaveProperty(key);
    if (expectedType !== "any") {
      if (typeof expectedType === "boolean") {
        expect(
          obj[key],
          `${label}: field "${key}" should be value "${expectedType}", got "${obj[key]}"`,
        ).toBe(expectedType);
      } else {
        expect(
          typeof obj[key],
          `${label}: field "${key}" should be type "${expectedType}", got "${typeof obj[key]}"`,
        ).toBe(expectedType);
      }
    }
  });
}

describe("TRD §8 – API Contract Validation", () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = vi.fn();
    global.fetch = fetchSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ticket entity must expose all required fields with correct types", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: "TKT-001",
          title: "VIP Pass",
          eventName: "Capstone Launch",
          attendeeName: "John Doe",
          attendeeEmail: "john@example.com",
          eventDate: "2026-12-01",
          venue: "Grand Hall",
          seatNumber: "A1",
          qrCodeUrl: "https://cdn.example.com/qr/TKT-001.png",
          createdAt: "2026-10-06T09:00:00.000Z",
          status: "active",
        },
        message: "OK",
        statusCode: 200,
      }),
    });

    const response = await apiClient.getTicket("TKT-001");
    assertShape(response.data, TICKET_ENTITY_FIELDS, "Ticket Entity");
  });

  it("ticket entity `id` must match pattern TKT-<digits>", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: "TKT-001",
          title: "VIP Pass",
          eventName: "Capstone Launch",
          attendeeName: "John Doe",
          attendeeEmail: "john@example.com",
          eventDate: "2026-12-01",
          venue: "Grand Hall",
          seatNumber: "A1",
          qrCodeUrl: "https://cdn.example.com/qr/TKT-001.png",
          createdAt: "2026-10-06T09:00:00.000Z",
          status: "active",
        },
        message: "OK",
        statusCode: 200,
      }),
    });

    const response = await apiClient.getTicket("TKT-001");
    expect(response.data.id).toMatch(/^TKT-\d+$/);
  });

  it("ticket entity `attendeeEmail` must be a valid email", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: "TKT-001",
          title: "VIP Pass",
          eventName: "Capstone Launch",
          attendeeName: "John Doe",
          attendeeEmail: "john@example.com",
          eventDate: "2026-12-01",
          venue: "Grand Hall",
          seatNumber: "A1",
          qrCodeUrl: "https://cdn.example.com/qr/TKT-001.png",
          createdAt: "2026-10-06T09:00:00.000Z",
          status: "active",
        },
        message: "OK",
        statusCode: 200,
      }),
    });

    const response = await apiClient.getTicket("TKT-001");
    expect(response.data.attendeeEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("ticket entity `eventDate` must conform to ISO 8601", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: "TKT-001",
          title: "VIP Pass",
          eventName: "Capstone Launch",
          attendeeName: "John Doe",
          attendeeEmail: "john@example.com",
          eventDate: "2026-12-01",
          venue: "Grand Hall",
          seatNumber: "A1",
          qrCodeUrl: "https://cdn.example.com/qr/TKT-001.png",
          createdAt: "2026-10-06T09:00:00.000Z",
          status: "active",
        },
        message: "OK",
        statusCode: 200,
      }),
    });

    const response = await apiClient.getTicket("TKT-001");
    expect(response.data.eventDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(response.data.eventDate).toString()).not.toBe("Invalid Date");
  });

  it("ticket entity `createdAt` must be a valid ISO 8601 timestamp", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: "TKT-001",
          title: "VIP Pass",
          eventName: "Capstone Launch",
          attendeeName: "John Doe",
          attendeeEmail: "john@example.com",
          eventDate: "2026-12-01",
          venue: "Grand Hall",
          seatNumber: "A1",
          qrCodeUrl: "https://cdn.example.com/qr/TKT-001.png",
          createdAt: "2026-10-06T09:00:00.000Z",
          status: "active",
        },
        message: "OK",
        statusCode: 200,
      }),
    });

    const response = await apiClient.getTicket("TKT-001");
    expect(new Date(response.data.createdAt).toString()).not.toBe("Invalid Date");
  });

  it("ticket entity `status` must be one of: active | cancelled | used", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();
    const VALID_STATUSES = ["active", "cancelled", "used"];
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: "TKT-001",
          title: "VIP Pass",
          eventName: "Capstone Launch",
          attendeeName: "John Doe",
          attendeeEmail: "john@example.com",
          eventDate: "2026-12-01",
          venue: "Grand Hall",
          seatNumber: "A1",
          qrCodeUrl: "https://cdn.example.com/qr/TKT-001.png",
          createdAt: "2026-10-06T09:00:00.000Z",
          status: "active",
        },
        message: "OK",
        statusCode: 200,
      }),
    });

    const response = await apiClient.getTicket("TKT-001");
    expect(VALID_STATUSES).toContain(response.data.status);
  });

  it("POST /tickets success response must match the success contract shape", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: { id: "TKT-001", qrCodeUrl: "https://cdn.example.com/qr/TKT-001.png" },
        message: "Ticket created successfully",
        statusCode: 201,
      }),
    });

    const response = await apiClient.createTicket({
      title: "VIP Pass",
      eventName: "Capstone",
      attendeeName: "Jane",
      attendeeEmail: "jane@example.com",
      eventDate: "2026-12-01",
      venue: "Hall A",
      seatNumber: "B3",
    });

    assertShape(response, SUCCESS_RESPONSE_SHAPE, "POST /tickets success");
    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(201);
  });

  it("success response data must contain id and qrCodeUrl", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: { id: "TKT-002", qrCodeUrl: "https://cdn.example.com/qr/TKT-002.png" },
        message: "Ticket created successfully",
        statusCode: 201,
      }),
    });

    const response = await apiClient.createTicket({});
    expect(response.data).toHaveProperty("id");
    expect(response.data).toHaveProperty("qrCodeUrl");
  });

  it("POST /tickets 400 error response must match the error contract shape", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Missing required fields" },
        statusCode: 400,
      }),
    });

    const response = await apiClient.createTicket({});
    assertShape(response, ERROR_RESPONSE_SHAPE, "POST /tickets 400");
    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(400);
  });

  it("error response must contain error.code and error.message", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        success: false,
        error: { code: "INVALID_EMAIL", message: "attendeeEmail is not a valid email" },
        statusCode: 422,
      }),
    });

    const response = await apiClient.createTicket({ attendeeEmail: "bad" });
    expect(response.error).toHaveProperty("code");
    expect(response.error).toHaveProperty("message");
    expect(typeof response.error.code).toBe("string");
    expect(typeof response.error.message).toBe("string");
  });

  it("GET /tickets/:id 404 response must match the error contract shape", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: { code: "NOT_FOUND", message: "Ticket TKT-999 not found" },
        statusCode: 404,
      }),
    });

    const response = await apiClient.getTicket("TKT-999");
    assertShape(response, ERROR_RESPONSE_SHAPE, "GET /tickets/:id 404");
    expect(response.statusCode).toBe(404);
  });

  it("GET /tickets/:id success response must return ticket data", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: "TKT-001",
          title: "VIP Pass",
          eventName: "Capstone Launch",
          attendeeName: "John Doe",
          attendeeEmail: "john@example.com",
          eventDate: "2026-12-01",
          venue: "Grand Hall",
          seatNumber: "A1",
          qrCodeUrl: "https://cdn.example.com/qr/TKT-001.png",
          createdAt: "2026-10-06T09:00:00.000Z",
          status: "active",
        },
        message: "OK",
        statusCode: 200,
      }),
    });

    const response = await apiClient.getTicket("TKT-001");
    assertShape(response, SUCCESS_RESPONSE_SHAPE, "GET /tickets/:id success");
    assertShape(response.data, TICKET_ENTITY_FIELDS, "Ticket entity in GET response");
  });

  it("network failure must result in a structured error (no unhandled rejection)", async () => {
    expect(apiClient, "apiClient is not implemented yet").toBeDefined();

    fetchSpy.mockRejectedValueOnce(new Error("Network Error"));

    const response = await apiClient.createTicket({});
    expect(response).toBeDefined();
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
});