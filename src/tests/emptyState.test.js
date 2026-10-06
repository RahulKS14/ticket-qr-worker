import { describe, it, expect, vi } from "vitest";

let getTickets, renderTicketList;
try {
  ({ getTickets, renderTicketList } = await import("../ticketService.js"));
} catch {
  getTickets = undefined;
  renderTicketList = undefined;
}

describe("TRD §2 – Empty State", () => {
  it("getTickets() should return an empty array when the store has no entries", async () => {
    expect(typeof getTickets, "getTickets must be a function").toBe("function");
    const result = await getTickets({ store: [] });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('renderTicketList() should display "No data found" when passed an empty array', () => {
    expect(typeof renderTicketList, "renderTicketList must be a function").toBe("function");
    document.body.innerHTML = '<div id="ticket-list"></div>';
    const container = document.getElementById("ticket-list");

    renderTicketList(container, []);

    expect(container.textContent).toMatch(/no data found/i);
  });

  it('"No data found" element must be visible (not hidden) when rendered', () => {
    expect(typeof renderTicketList, "renderTicketList must be a function").toBe("function");
    document.body.innerHTML = '<div id="ticket-list"></div>';
    const container = document.getElementById("ticket-list");

    renderTicketList(container, []);

    const emptyMsg = Array.from(container.querySelectorAll("*")).find((el) =>
      /no data found/i.test(el.textContent),
    );
    expect(emptyMsg).toBeDefined();
    expect(emptyMsg?.style?.display).not.toBe("none");
    expect(emptyMsg?.style?.visibility).not.toBe("hidden");
  });

  it('"No data found" region should carry role="status" or role="alert" for screen-reader announcement', () => {
    expect(typeof renderTicketList, "renderTicketList must be a function").toBe("function");
    document.body.innerHTML = '<div id="ticket-list"></div>';
    const container = document.getElementById("ticket-list");

    renderTicketList(container, []);

    const liveRegion = container.querySelector('[role="status"],[role="alert"]');
    expect(liveRegion).not.toBeNull();
  });
});