import { describe, it, expect, beforeEach } from "vitest";

let renderApp;
try {
  ({ renderApp } = await import("../app.js"));
} catch {
  renderApp = undefined;
}

function buildDOM() {
  expect(typeof renderApp, "renderApp must be a function").toBe("function");
  renderApp(document.body);
}

describe("TRD §1 – Interface Accessibility", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    buildDOM();
  });

  it("should render a primary landmark region (main / role=main)", () => {
    const main =
      document.querySelector("main") ||
      document.querySelector('[role="main"]');
    expect(main).not.toBeNull();
  });

  it("should have a non-empty document title", () => {
    expect(document.title).toBeTruthy();
    expect(document.title.trim().length).toBeGreaterThan(0);
  });

  it("all <input> elements must have an accessible label (aria-label, aria-labelledby, or <label>)", () => {
    const inputs = Array.from(document.querySelectorAll("input"));
    expect(inputs.length).toBeGreaterThan(0);

    inputs.forEach((input) => {
      const hasAriaLabel = input.getAttribute("aria-label")?.trim().length > 0;
      const hasAriaLabelledby = input.getAttribute("aria-labelledby")?.trim().length > 0;
      const id = input.id;
      const hasLabel = id
        ? document.querySelector(`label[for="${id}"]`) !== null
        : false;
      const isWrapped = input.closest("label") !== null;

      expect(
        hasAriaLabel || hasAriaLabelledby || hasLabel || isWrapped,
        `Input[name="${input.name}"] has no accessible label`,
      ).toBe(true);
    });
  });

  it("all <button> elements must have discernible text or aria-label", () => {
    const buttons = Array.from(document.querySelectorAll("button"));
    expect(buttons.length).toBeGreaterThan(0);

    buttons.forEach((btn) => {
      const discernibleText =
        btn.textContent?.trim().length > 0 ||
        btn.getAttribute("aria-label")?.trim().length > 0 ||
        btn.getAttribute("aria-labelledby")?.trim().length > 0;
      expect(discernibleText, `Button has no accessible name`).toBe(true);
    });
  });

  it("interactive elements (buttons, inputs) must not have tabIndex < 0", () => {
    const interactives = Array.from(
      document.querySelectorAll("button, input, select, textarea, a[href]"),
    );
    expect(interactives.length).toBeGreaterThan(0);

    interactives.forEach((el) => {
      const tabIndex = parseInt(el.getAttribute("tabindex") ?? "0", 10);
      expect(tabIndex, `${el.tagName} has tabindex="${tabIndex}"`).toBeGreaterThanOrEqual(0);
    });
  });

  it("form controls must be wrapped in a <form> element", () => {
    const form = document.querySelector("form");
    expect(form).not.toBeNull();
  });
});