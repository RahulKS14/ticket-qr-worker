import { validateTicket } from "./ticketValidator.js";
import { storeTicket } from "./ticketStore.js";
import { generateQRCode } from "./qrService.js";
import { renderTicketList } from "./ticketService.js";

export function renderApp(container = document.body) {
  if (!container) return;

  if (typeof document !== "undefined") {
    document.title = "Ticket QR Code Generator Worker";
  }

  container.innerHTML = `
    <main role="main" class="app-container" id="main-content">
      <header class="app-header">
        <h1 class="app-title">Ticket QR Code Generator Worker</h1>
        <p class="app-subtitle">Generate validated, tamper-resistant QR codes for event access passes.</p>
      </header>

      <div class="app-grid">
        <section class="card form-card" aria-labelledby="form-heading">
          <h2 id="form-heading" class="card-title">Create Ticket</h2>

          <div id="form-feedback" role="alert" aria-live="assertive" class="feedback-area" style="display:none;"></div>

          <form id="ticket-form" novalidate>
            <div class="form-group">
              <label for="input-title">Ticket Title <span aria-hidden="true">*</span></label>
              <input
                id="input-title"
                name="title"
                type="text"
                placeholder="e.g. VIP Access Pass"
                aria-label="Ticket Title"
                aria-required="true"
                tabindex="0"
                required
              />
              <span class="field-error" id="error-title" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="input-eventName">Event Name <span aria-hidden="true">*</span></label>
              <input
                id="input-eventName"
                name="eventName"
                type="text"
                placeholder="e.g. Annual Technology Summit"
                aria-label="Event Name"
                aria-required="true"
                tabindex="0"
                required
              />
              <span class="field-error" id="error-eventName" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="input-attendeeName">Attendee Name <span aria-hidden="true">*</span></label>
              <input
                id="input-attendeeName"
                name="attendeeName"
                type="text"
                placeholder="e.g. Jane Doe"
                aria-label="Attendee Name"
                aria-required="true"
                tabindex="0"
                required
              />
              <span class="field-error" id="error-attendeeName" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="input-attendeeEmail">Attendee Email <span aria-hidden="true">*</span></label>
              <input
                id="input-attendeeEmail"
                name="attendeeEmail"
                type="email"
                placeholder="e.g. jane@example.com"
                aria-label="Attendee Email"
                aria-required="true"
                tabindex="0"
                required
              />
              <span class="field-error" id="error-attendeeEmail" aria-live="polite"></span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="input-eventDate">Event Date <span aria-hidden="true">*</span></label>
                <input
                  id="input-eventDate"
                  name="eventDate"
                  type="date"
                  aria-label="Event Date"
                  aria-required="true"
                  tabindex="0"
                  required
                />
                <span class="field-error" id="error-eventDate" aria-live="polite"></span>
              </div>

              <div class="form-group">
                <label for="input-seatNumber">Seat / Tier</label>
                <input
                  id="input-seatNumber"
                  name="seatNumber"
                  type="text"
                  placeholder="e.g. Seat A-12"
                  aria-label="Seat Number"
                  tabindex="0"
                />
                <span class="field-error" id="error-seatNumber" aria-live="polite"></span>
              </div>
            </div>

            <div class="form-group">
              <label for="input-venue">Venue</label>
              <input
                id="input-venue"
                name="venue"
                type="text"
                placeholder="e.g. Grand Auditorium"
                aria-label="Venue Location"
                tabindex="0"
              />
              <span class="field-error" id="error-venue" aria-live="polite"></span>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                id="btn-submit"
                class="btn btn-primary"
                aria-label="Generate Ticket QR Code"
                tabindex="0"
              >
                Generate Ticket QR Code
              </button>
              <button
                type="reset"
                id="btn-reset"
                class="btn btn-secondary"
                aria-label="Reset Ticket Form"
                tabindex="0"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section class="card list-card" aria-labelledby="list-heading">
          <h2 id="list-heading" class="card-title">Generated Tickets</h2>
          <div id="tickets-container" aria-live="polite"></div>
        </section>
      </div>
    </main>
  `;

  const form = container.querySelector("#ticket-form");
  const listContainer = container.querySelector("#tickets-container");
  const feedbackArea = container.querySelector("#form-feedback");

  if (listContainer) {
    renderTicketList(listContainer, []);
  }

  const generatedTickets = [];

  if (form) {
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();

      container.querySelectorAll(".field-error").forEach((el) => {
        el.textContent = "";
      });
      container.querySelectorAll("input").forEach((el) => {
        el.removeAttribute("aria-invalid");
      });
      if (feedbackArea) {
        feedbackArea.style.display = "none";
        feedbackArea.textContent = "";
      }

      const formData = new FormData(form);
      const ticketInput = {
        id: `TKT-${Date.now().toString().slice(-6)}`,
        title: (formData.get("title") || "").toString(),
        eventName: (formData.get("eventName") || "").toString(),
        attendeeName: (formData.get("attendeeName") || "").toString(),
        attendeeEmail: (formData.get("attendeeEmail") || "").toString(),
        eventDate: (formData.get("eventDate") || "").toString(),
        venue: (formData.get("venue") || "Main Hall").toString(),
        seatNumber: (formData.get("seatNumber") || "GA").toString(),
      };

      const validation = validateTicket(ticketInput);
      if (!validation.valid) {
        if (feedbackArea) {
          feedbackArea.style.display = "block";
          feedbackArea.textContent = "Please correct the highlighted fields before submitting.";
        }
        validation.errors.forEach((err) => {
          const fieldEl = container.querySelector(`[name="${err.field}"]`);
          const errorSpan = container.querySelector(`#error-${err.field}`);
          if (fieldEl) {
            fieldEl.setAttribute("aria-invalid", "true");
          }
          if (errorSpan) {
            errorSpan.textContent = err.message;
          }
        });
        return;
      }

      const saved = storeTicket(ticketInput);

      try {
        const qrResult = await generateQRCode(saved);
        saved.qrCodeUrl = qrResult.qrCodeUrl;
        generatedTickets.unshift(saved);
        if (listContainer) {
          renderTicketList(listContainer, generatedTickets);
        }
        form.reset();
      } catch (err) {
        if (feedbackArea) {
          feedbackArea.style.display = "block";
          feedbackArea.textContent = `Error generating QR code: ${err.message}`;
        }
      }
    });
  }
}