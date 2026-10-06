const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const REQUIRED_FIELDS = [
  { field: "title", label: "Ticket Title" },
  { field: "eventName", label: "Event Name" },
  { field: "attendeeName", label: "Attendee Name" },
  { field: "attendeeEmail", label: "Attendee Email" },
  { field: "eventDate", label: "Event Date" },
];

export function validateTicket(ticket) {
  const errors = [];

  if (!ticket || typeof ticket !== "object" || Array.isArray(ticket)) {
    return {
      valid: false,
      errors: [{ field: "form", message: "Ticket submission must be an object" }],
    };
  }

  for (const { field, label } of REQUIRED_FIELDS) {
    const val = ticket[field];
    if (val === undefined || val === null) {
      errors.push({ field, message: `${label} is required` });
    } else if (typeof val === "string" && val.trim().length === 0) {
      errors.push({ field, message: `${label} cannot be empty or whitespace only` });
    }
  }

  if (ticket.attendeeEmail !== undefined && ticket.attendeeEmail !== null) {
    const emailStr = String(ticket.attendeeEmail).trim();
    if (emailStr.length > 0 && !EMAIL_REGEX.test(emailStr)) {
      if (!errors.some((e) => e.field === "attendeeEmail")) {
        errors.push({
          field: "attendeeEmail",
          message: "Attendee email must be a valid email format",
        });
      }
    }
  }

  if (ticket.eventDate !== undefined && ticket.eventDate !== null) {
    const dateStr = String(ticket.eventDate).trim();
    if (dateStr.length > 0) {
      if (!DATE_REGEX.test(dateStr)) {
        if (!errors.some((e) => e.field === "eventDate")) {
          errors.push({
            field: "eventDate",
            message: "Event date must be in YYYY-MM-DD format",
          });
        }
      } else {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
          if (!errors.some((e) => e.field === "eventDate")) {
            errors.push({
              field: "eventDate",
              message: "Event date must be a valid calendar date",
            });
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}