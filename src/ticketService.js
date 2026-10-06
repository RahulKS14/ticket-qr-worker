export async function getTickets(options = {}) {
  const store = options.store;
  if (Array.isArray(store)) {
    return [...store];
  }
  return [];
}

export function renderTicketList(container, tickets = []) {
  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(tickets) || tickets.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.setAttribute("role", "status");
    emptyState.className = "empty-state-card";
    emptyState.style.display = "block";
    emptyState.style.visibility = "visible";

    const message = document.createElement("p");
    message.className = "empty-state-message";
    message.textContent = "No data found";
    message.style.display = "block";
    message.style.visibility = "visible";

    emptyState.appendChild(message);
    container.appendChild(emptyState);
    return;
  }

  const list = document.createElement("ul");
  list.className = "ticket-list";
  list.setAttribute("aria-label", "Generated Tickets");

  tickets.forEach((ticket) => {
    const item = document.createElement("li");
    item.className = "ticket-card";

    const title = document.createElement("h3");
    title.className = "ticket-title";
    title.textContent = ticket.title || "Ticket";

    const eventName = document.createElement("p");
    eventName.className = "ticket-event";
    eventName.textContent = `Event: ${ticket.eventName || "N/A"}`;

    const attendee = document.createElement("p");
    attendee.className = "ticket-attendee";
    attendee.textContent = `Attendee: ${ticket.attendeeName || "N/A"}`;

    const date = document.createElement("p");
    date.className = "ticket-date";
    date.textContent = `Date: ${ticket.eventDate || "N/A"}`;

    item.appendChild(title);
    item.appendChild(eventName);
    item.appendChild(attendee);
    item.appendChild(date);

    if (ticket.qrCodeUrl) {
      const qrImg = document.createElement("img");
      qrImg.src = ticket.qrCodeUrl;
      qrImg.alt = `QR Code for ${ticket.id || ticket.title}`;
      qrImg.className = "ticket-qr-image";
      item.appendChild(qrImg);
    }

    list.appendChild(item);
  });

  container.appendChild(list);
}