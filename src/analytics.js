export const ANALYTICS_EVENT_MESSAGE =
  "[Analytics] User interacted with Ticket QR Code Generator Worker";

export function trackEvent(eventName = "Ticket QR Code Generator Worker") {
  const message = `[Analytics] User interacted with ${eventName}`;
  console.log(message);
  return message;
}