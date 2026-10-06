# Ticket QR Code Generator Worker

**Live Demo:** https://ticket-qr-worker.vercel.app/

---

A web-based Ticket QR Code Generator Worker that allows users to enter ticket and attendee details, validate the input, generate a ticket with a QR code, and display the generated ticket information.

## Features

- Ticket QR code generation
- Ticket and attendee information form
- Input validation
- Invalid input highlighting
- Empty state with "No data found" message
- Loading indicator during QR generation
- XSS input sanitization
- Consistent ticket data structure
- Analytics console logging
- Responsive design
- Keyboard navigation support
- ARIA labels and accessibility support
- Clean corporate user interface
- Mobile-friendly layout

## Ticket Information

The generator supports the following ticket fields:

- Ticket Title
- Event Name
- Attendee Name
- Attendee Email
- Event Date

Generated ticket data also supports:

- Ticket ID
- Venue
- Seat Number
- QR Code URL
- Creation timestamp
- Ticket status

## Technology Stack

- HTML
- CSS
- JavaScript
- Vitest
- Custom test runner
- QR Code API
- Vercel

## Project Structure

```text
ticket-qr-worker/
│
├── docs/
│   ├── API_CONTRACT.md
│   └── DATABASE_SCHEMA.md
│
├── src/
│   ├── tests/
│   │   ├── accessibility.test.js
│   │   ├── analytics.test.js
│   │   ├── apiContract.test.js
│   │   ├── dataConsistency.test.js
│   │   ├── emptyState.test.js
│   │   ├── invalidInput.test.js
│   │   ├── loadingState.test.js
│   │   ├── security.test.js
│   │   └── setup.js
│   │
│   ├── analytics.js
│   ├── apiClient.js
│   ├── app.js
│   ├── qrService.js
│   ├── sanitizer.js
│   ├── styles.css
│   ├── ticketSchema.js
│   ├── ticketService.js
│   ├── ticketStore.js
│   └── ticketValidator.js
│
├── .gitignore
├── index.htm
├── package.json
├── PROMPTS.md
├── README.md
├── runner.cjs
└── vitest.config.js
