export const ticketSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Ticket",
  type: "object",
  required: [
    "id",
    "title",
    "eventName",
    "attendeeName",
    "attendeeEmail",
    "eventDate",
    "venue",
    "seatNumber",
  ],
  properties: {
    id: {
      type: "string",
      pattern: "^TKT-\\d+$",
      description: "Unique ticket identifier (TKT-<digits>)",
    },
    title: {
      type: "string",
      minLength: 1,
      description: "Ticket tier or title",
    },
    eventName: {
      type: "string",
      minLength: 1,
      description: "Associated event name",
    },
    attendeeName: {
      type: "string",
      minLength: 1,
      description: "Full name of the attendee",
    },
    attendeeEmail: {
      type: "string",
      format: "email",
      description: "Valid attendee contact email",
    },
    eventDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "Event date in ISO 8601 YYYY-MM-DD format",
    },
    venue: {
      type: "string",
      minLength: 1,
      description: "Venue location or hall name",
    },
    seatNumber: {
      type: "string",
      minLength: 1,
      description: "Assigned seat number or General Admission",
    },
    qrCodeUrl: {
      type: "string",
      description: "Generated QR code image URL or data URI",
    },
    createdAt: {
      type: "string",
      description: "ISO 8601 timestamp of creation",
    },
    status: {
      type: "string",
      enum: ["active", "cancelled", "used"],
      description: "Current lifecycle state of the ticket",
    },
  },
  additionalProperties: false,
};

const ID_PATTERN = /^TKT-\d+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateTicketSchema(ticket) {
  const errors = [];
  const warnings = [];

  if (!ticket || typeof ticket !== "object") {
    return {
      valid: false,
      errors: [{ field: "ticket", message: "Ticket must be an object" }],
      warnings: [],
    };
  }

  for (const field of ticketSchema.required) {
    if (ticket[field] === undefined || ticket[field] === null || ticket[field] === "") {
      errors.push({ field, message: `Missing required field: ${field}` });
    } else if (typeof ticket[field] !== ticketSchema.properties[field].type) {
      errors.push({
        field,
        message: `Field ${field} must be of type ${ticketSchema.properties[field].type}`,
      });
    }
  }

  if (ticket.id !== undefined && !ID_PATTERN.test(String(ticket.id))) {
    errors.push({ field: "id", message: "Ticket id must match pattern TKT-<digits>" });
  }

  if (ticket.eventDate !== undefined) {
    if (!DATE_PATTERN.test(String(ticket.eventDate))) {
      errors.push({ field: "eventDate", message: "eventDate must conform to ISO 8601 (YYYY-MM-DD)" });
    } else {
      const parsed = new Date(ticket.eventDate);
      if (isNaN(parsed.getTime())) {
        errors.push({ field: "eventDate", message: "eventDate is an invalid calendar date" });
      }
    }
  }

  if (ticket.attendeeEmail !== undefined && !EMAIL_PATTERN.test(String(ticket.attendeeEmail))) {
    errors.push({ field: "attendeeEmail", message: "attendeeEmail must be a valid email address" });
  }

  const allowedKeys = new Set(Object.keys(ticketSchema.properties));
  for (const key of Object.keys(ticket)) {
    if (!allowedKeys.has(key)) {
      warnings.push({ field: key, message: `Unknown property detected: ${key}` });
    }
  }

  const valid = errors.length === 0 && warnings.length === 0;

  return {
    valid,
    errors,
    warnings,
  };
}