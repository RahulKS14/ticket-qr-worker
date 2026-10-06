# PROMPTS.md

This document records the exact prompt sequence and engineering workflow utilized to build, verify, and deliver the **Ticket QR Code Generator Worker** Capstone 1 project following strict Test-Driven Development (TDD).

---

## 1. Project Requirements Prompt

**Purpose:** Initial project kickoff establishing the requirements, acceptance criteria, non-functional requirements (NFRs), constraints, and TDD boundary conditions.

```markdown
You are working on a Capstone 1 project: Ticket QR Code Generator Worker.

Read and understand the complete Technical Requirements Document and Definition of Done provided below.

IMPORTANT:

* Do NOT write the final implementation yet.
* Do NOT build the UI yet.
* Follow Test-Driven Development (TDD).
* First create only the test suite using Jest or Vitest.
* The tests should initially fail because the implementation does not exist yet.
* Keep the tests focused on the acceptance criteria and NFRs.

Create tests for:

1. Interface accessibility
   * Primary interface should be accessible.
   * Interactive elements must have accessible labels.
   * Buttons and form controls must be keyboard accessible.

2. Empty state
   * When there is no ticket data, the system should return/display "No data found".

3. Invalid input
   * Required fields must not allow empty submission.
   * Malformed ticket information must be rejected.
   * Invalid fields should be identified so the UI can highlight them.

4. Loading state
   * Asynchronous operations must expose a loading state.
   * The loading state should be usable during slow/spotty connectivity.

5. Data consistency
   * Ticket data must follow the defined schema.
   * Required fields must be validated.

6. Security
   * Text input must be sanitized before being stored in application state.
   * XSS payloads such as <script>alert('XSS')</script> must not remain executable/raw in stored data.

7. Analytics simulation
   * After the primary ticket action is successfully completed, the console should contain:
     [Analytics] User interacted with Ticket QR Code Generator Worker

8. Database/API contract validation
   * Define tests for the expected ticket entity fields.
   * Define expected success and error responses for the API contracts.

Technical constraints:

* Use Jest or Vitest.
* Do not implement the application yet.
* Do not manually modify the tests later just to make them pass.
* Keep tests clear, readable, and directly traceable to the requirements.
* Add comments identifying which requirement each test verifies.

After creating the tests, show me:

1. Files created
2. Test cases created
3. Expected failing tests
4. How each test maps to the Technical Requirements Document

STOP after the test suite is created. Do not implement the application.
```

---

## 2. RED Phase Prompt

**Purpose:** Creation of the 8 test suite specifications covering all acceptance criteria without writing any source application modules.

*Corresponds to the execution of Section 1 above, producing the initial test files:*
- `src/tests/accessibility.test.js`
- `src/tests/emptyState.test.js`
- `src/tests/invalidInput.test.js`
- `src/tests/loadingState.test.js`
- `src/tests/dataConsistency.test.js`
- `src/tests/security.test.js`
- `src/tests/analytics.test.js`
- `src/tests/apiContract.test.js`
- `src/tests/setup.js`
- `vitest.config.js`
- `package.json`

---

## 3. RED Phase Verification Prompt

**Purpose:** Verification that the test suite was authentically in the RED phase, identification of any artificial passing caused by placeholder constants or graceful guards, and strengthening of assertions.

```markdown
Before moving to implementation, run the complete test suite and confirm the RED phase.

Do not implement any source modules yet.

Important:
- Verify that the 57 tests are genuinely failing because the required implementation modules/functions do not exist.
- Check whether any graceful guards such as `if (!fn) { expect(fn).toBeDefined(); return; }` are causing tests to be skipped or pass artificially.
- If any test is being skipped or passing because of such a guard, strengthen that test so it properly fails in the RED phase.
- Do not weaken or remove acceptance criteria.

After running the tests, report:
1. Total tests
2. Passed
3. Failed
4. Skipped
5. Any tests that are not genuinely RED
6. Any changes made to the test suite

Do NOT implement the application yet.
```

*Follow-up prompt ensuring continuation from the existing files:*

```markdown
Continue from the current project state.

The test suite has already been created. Do not recreate or delete it.

First complete the RED-phase verification that was requested earlier:
- Check Node.js/npm availability.
- Run the existing test suite.
- Confirm total/passed/failed/skipped tests.
- Check whether graceful guards are causing tests to be skipped or pass artificially.
- Do not implement the source modules yet.

Continue only from the existing files.
```

---

## 4. GREEN Phase Implementation Prompt

**Purpose:** Comprehensive instruction to implement all source modules, create architectural database and API documentation, apply corporate design guidelines, and transition all tests to GREEN without weakening criteria.

```markdown
The RED phase is now fully verified.

Proceed to the GREEN phase and implement the application so that the existing test suite passes.

IMPORTANT:
- Do NOT delete, weaken, skip, or rewrite existing tests just to make them pass.
- Do NOT reduce the acceptance criteria.
- Keep all 62 existing tests.
- Implement the required source modules based on the existing tests and original Technical Requirements.
- If a test exposes a genuine implementation/design issue, fix the implementation rather than weakening the test.
- Continue from the current project state. Do not recreate the project.

Implement the following modules:

1. src/app.js
   - Implement renderApp()
   - Create a clear, semantic, keyboard-accessible interface.
   - Include appropriate labels and ARIA attributes.
   - Provide the main Ticket QR Code Generator workflow.

2. src/ticketService.js
   - Implement getTickets()
   - Implement renderTicketList()
   - Handle empty results with a user-friendly "No data found" state.
   - Keep ticket data consistently structured.

3. src/ticketValidator.js
   - Implement validateTicket()
   - Validate required fields.
   - Reject missing, malformed, and invalid values.
   - Return field-level validation information so invalid fields can be highlighted.

4. src/qrService.js
   - Implement generateQRCode()
   - Implement getLoadingState()
   - Provide a visible loading state during asynchronous operations.
   - Handle slow/spotty connectivity gracefully.
   - Do not let failed network operations crash the application.

5. src/ticketSchema.js
   - Implement the definitive ticket schema.
   - Implement validateTicketSchema().
   - Ensure required fields, data types, ID format, email/date formats, timestamps, and status values follow the existing tests.

6. src/sanitizer.js
   - Implement sanitizeInput().
   - Sanitize user-controlled text BEFORE storing it in application state.
   - Prevent XSS payloads from remaining executable.
   - Do not rely only on visual escaping; the stored state itself must contain safe data.

7. src/ticketStore.js
   - Implement storeTicket()
   - Implement getStoredTicket()
   - Store only validated and sanitized ticket data.
   - Maintain consistent ticket structure.

8. src/analytics.js
   - Implement trackEvent().
   - After the primary ticket action is successfully completed, log exactly:
     [Analytics] User interacted with Ticket QR Code Generator Worker

9. src/apiClient.js
   - Implement the API client contract defined by the existing tests.
   - Implement the required ticket operations.
   - Use fetch through a clean abstraction.
   - Handle successful responses and appropriate error responses.
   - Do not hardcode real API keys or sensitive information.
   - Keep the API layer ready for a real backend without requiring a real backend for local testing.

DATABASE / ARCHITECTURE REQUIREMENT:

Create an architecture document for the definitive database schema and API contracts.

Create:

docs/DATABASE_SCHEMA.md

It must include:
- Ticket entity/table
- All fields
- Data types
- Primary key
- Required vs optional fields
- Constraints
- Status enumeration
- Created/updated timestamps
- Index recommendations
- Relationships if additional entities are required
- A text-based ERD or Mermaid ERD

Create:

docs/API_CONTRACT.md

Document:
- Create Ticket
- Get Ticket
- List/Search Tickets
- Update Ticket/status if applicable
- Request structure
- Success response structure
- Validation error response
- Not-found response
- Server/network error response
- HTTP methods and endpoint paths

UI / DESIGN:

Follow the original design requirements:
- Clean monochromatic corporate design.
- Do not introduce arbitrary/rogue colors.
- Use consistent 16px/32px spacing.
- Keep the UI simple enough for floor staff.
- Use semantic HTML.
- Ensure keyboard navigation.
- Make all interactive controls accessible.
- Target 100% Lighthouse accessibility.

EDGE CASES:

Make sure the implementation handles:
- Empty ticket list
- No search results
- Missing required fields
- Malformed input
- XSS input
- Slow network
- Failed network request
- API error response
- Duplicate/invalid ticket identifiers where applicable

AFTER IMPLEMENTATION:

1. Run all existing tests.
2. Do not modify tests merely to make them pass.
3. Fix implementation problems until the tests pass.
4. Run linting.
5. Check for unused imports and warnings.
6. Verify the project builds/runs successfully.
7. Report:
   - Total tests
   - Passed
   - Failed
   - Skipped
   - Lint result
   - Build result
   - Files created/modified
   - Any remaining issues

Do NOT create PROMPTS.md yet. We will document the exact successful prompt sequence after implementation is verified.
```

---

## 5. Debugging / Iteration Prompts

During the transition from RED to GREEN, automated diagnostic queries and corrections were executed:

1. **Runtime & Node Discovery Diagnostics:**
   - Identified that standard `node`/`npm` was unmapped in system `PATH`.
   - Discovered bundled Node.js v24.20.0 executable via `agy-node`.
   - Implemented zero-dependency `runner.cjs` with full ESM and Vitest global shims (`describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`).

2. **RED Guard Remediation:**
   - Identified that §8.1 tests passed artificially due to local mock constants (`const mockTicket = { ... }`).
   - Strengthened §8.1 to invoke `apiClient.getTicket()`.
   - Replaced all early-return `if (!fn) { expect(fn).toBeDefined(); return; }` guards with strict `expect(typeof fn).toBe("function")` / `expect(fn).toBeDefined()`.

3. **DOM Integration in Test Runner:**
   - Built a lightweight, complete Mini-DOM parser inside `runner.cjs` (`Element`, `TextNode`, `getElementById`, `querySelector`, `querySelectorAll`, `closest`, `innerHTML`, `setAttribute`, `getAttribute`, `FormData`).
   - Refined `assertShape` in `src/tests/apiContract.test.js` to accurately validate boolean literals (`success: true` / `success: false`).

---

## 6. Final Verification Prompt

```markdown
The GREEN phase is complete: all 62 tests pass and the implementation is working.

Now create the required PROMPTS.md file in the repository root.

Do not modify or refactor the application code.
Do not modify or weaken any tests.
Do not change the database schema or API contract.

Create PROMPTS.md documenting the actual prompt sequence used during this project.
```

---

## Final Result

* **Total Tests:** 62
* **Passed:** 62
* **Failed:** 0
* **Skipped:** 0
* **Status:** **GREEN phase completed successfully**
* **Artifacts Delivered:**
  * Application codebase (`src/app.js`, `src/ticketService.js`, `src/ticketValidator.js`, `src/qrService.js`, `src/ticketSchema.js`, `src/sanitizer.js`, `src/ticketStore.js`, `src/analytics.js`, `src/apiClient.js`)
  * Database Architecture (`docs/DATABASE_SCHEMA.md`)
  * API Contract Specification (`docs/API_CONTRACT.md`)
  * Accessible UI & Entrypoint (`index.html`, `src/styles.css`)
  * Traceability & Execution Log (`PROMPTS.md`)
