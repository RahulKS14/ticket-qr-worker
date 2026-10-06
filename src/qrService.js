import { trackEvent } from "./analytics.js";

let _isLoading = false;

export function getLoadingState() {
  return _isLoading;
}

function setLoading(loading) {
  _isLoading = loading;

  if (typeof document !== "undefined" && document.body) {
    let indicator = document.querySelector('[data-testid="loading-indicator"]');

    if (loading) {
      if (!indicator) {
        indicator = document.createElement("div");
        indicator.setAttribute("role", "status");
        indicator.setAttribute("aria-busy", "true");
        indicator.setAttribute("data-testid", "loading-indicator");
        indicator.className = "loading-spinner loading";
        indicator.textContent = "Generating QR Code...";

        const appRoot = document.getElementById("app") || document.body;
        appRoot.appendChild(indicator);
      } else {
        indicator.setAttribute("aria-busy", "true");
        indicator.style.display = "block";
      }
    } else if (indicator) {
      indicator.setAttribute("aria-busy", "false");
      indicator.remove();
    }
  }
}

export async function generateQRCode(ticket, customWorkerFn) {
  if (!ticket || typeof ticket !== "object") {
    setLoading(false);
    throw new Error("Invalid ticket: ticket object is required to generate QR code");
  }

  setLoading(true);

  try {
    let result;
    if (typeof customWorkerFn === "function") {
      result = await customWorkerFn(ticket);
    } else {
      result = await new Promise((resolve) => {
        setTimeout(() => {
          const qrPayload = encodeURIComponent(
            JSON.stringify({
              id: ticket.id,
              event: ticket.eventName,
              attendee: ticket.attendeeName,
            })
          );
          resolve({
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrPayload}`,
            ticket,
          });
        }, 10);
      });
    }

    trackEvent("Ticket QR Code Generator Worker");

    return result || { qrCodeUrl: `https://cdn.example.com/qr/${ticket.id}.png`, ticket };
  } finally {
    setLoading(false);
  }
}