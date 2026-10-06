import { sanitizeInput } from "./sanitizer.js";

const _store = new Map();

export function storeTicket(ticket) {
  if (!ticket || typeof ticket !== "object") {
    throw new TypeError("Ticket must be a valid object");
  }

  const safeTicket = Object.create(null);

  for (const key of Object.keys(ticket)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    const val = ticket[key];
    if (typeof val === "string") {
      safeTicket[key] = sanitizeInput(val);
    } else {
      safeTicket[key] = val;
    }
  }

  if (safeTicket.id) {
    _store.set(String(safeTicket.id), safeTicket);
  }

  return safeTicket;
}

export function getStoredTicket(id) {
  return _store.get(String(id));
}

export function clearTicketStore() {
  _store.clear();
}