# API Contract Specification: Ticket QR Code Generator Worker

This document specifies the RESTful API contracts, request payloads, response envelopes, error schemas, and HTTP status codes for the **Ticket QR Code Generator Worker**.

---

## 1. Universal Response Envelope Formats

All API endpoints strictly conform to standard, predictable response structures:

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "statusCode": 200
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Descriptive, actionable error message"
  },
  "statusCode": 400
}
```

---

## 2. Endpoints Specification

### 2.1 Create Ticket
* **Method:** `POST`
* **Path:** `/api/tickets`
* **Description:** Validates attendee information, assigns a unique ticket ID, triggers the QR code generator worker, and persists the ticket entity.

#### Request Headers
| Header | Value | Required |
|---|---|---|
| `Content-Type` | `application/json` | Yes |
| `Accept` | `application/json` | Yes |

#### Request Body
```json
{
  "title": "VIP Access Pass",
  "eventName": "Annual Technology Summit 2026",
  "attendeeName": "Jane Doe",
  "attendeeEmail": "jane@example.com",
  "eventDate": "2026-12-01",
  "venue": "Grand Ballroom",
  "seatNumber": "A-12"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "TKT-104921",
    "qrCodeUrl": "https://cdn.example.com/qr/TKT-104921.png"
  },
  "message": "Ticket created successfully",
  "statusCode": 201
}
```

#### Validation Error Response (`400 Bad Request` or `422 Unprocessable Entity`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: title, attendeeEmail"
  },
  "statusCode": 400
}
```
Or for email validation errors:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "attendeeEmail is not a valid email"
  },
  "statusCode": 422
}
```

---

### 2.2 Get Ticket by ID
* **Method:** `GET`
* **Path:** `/api/tickets/:id`
* **Description:** Retrieves the full ticket entity by its identifier.

#### Request Parameters
| Parameter | Location | Type | Example | Description |
|---|---|---|---|---|
| `id` | Path | `string` | `TKT-001` | Unique ticket identifier (`TKT-<digits>`) |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "TKT-001",
    "title": "VIP Access Pass",
    "eventName": "Annual Technology Summit 2026",
    "attendeeName": "John Doe",
    "attendeeEmail": "john@example.com",
    "eventDate": "2026-12-01",
    "venue": "Grand Hall",
    "seatNumber": "A1",
    "qrCodeUrl": "https://cdn.example.com/qr/TKT-001.png",
    "createdAt": "2026-10-06T09:00:00.000Z",
    "status": "active"
  },
  "message": "OK",
  "statusCode": 200
}
```

#### Not Found Response (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ticket TKT-999 not found"
  },
  "statusCode": 404
}
```

---

### 2.3 List / Search Tickets
* **Method:** `GET`
* **Path:** `/api/tickets`
* **Query Parameters:**
  * `email` (optional): Filter by attendee email address.
  * `status` (optional): Filter by status (`active`, `cancelled`, `used`).
  * `limit` (optional, default: 50): Page size.
  * `offset` (optional, default: 0): Pagination offset.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "TKT-001",
        "title": "VIP Access Pass",
        "eventName": "Annual Technology Summit 2026",
        "attendeeName": "John Doe",
        "attendeeEmail": "john@example.com",
        "eventDate": "2026-12-01",
        "venue": "Grand Hall",
        "seatNumber": "A1",
        "qrCodeUrl": "https://cdn.example.com/qr/TKT-001.png",
        "createdAt": "2026-10-06T09:00:00.000Z",
        "status": "active"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  },
  "message": "OK",
  "statusCode": 200
}
```

#### Empty State Response (`200 OK`)
When no matching records exist:
```json
{
  "success": true,
  "data": {
    "tickets": [],
    "total": 0,
    "limit": 50,
    "offset": 0
  },
  "message": "No data found",
  "statusCode": 200
}
```

---

### 2.4 Update Ticket Status
* **Method:** `PATCH`
* **Path:** `/api/tickets/:id/status`
* **Description:** Updates ticket status during access control check-in or cancellation.

#### Request Body
```json
{
  "status": "used"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "TKT-001",
    "status": "used",
    "updatedAt": "2026-10-06T10:15:00.000Z"
  },
  "message": "Ticket status updated to used",
  "statusCode": 200
}
```

---

## 3. Network & System Error Resilience

If a network interruption, timeout, or DNS failure occurs on the client or worker:
* The client layer does **not** throw unhandled promise rejections.
* Instead, it catches the rejection and synthesizes an adhering structured error:
```json
{
  "success": false,
  "error": {
    "code": "NETWORK_ERROR",
    "message": "A network error occurred while communicating with the server"
  },
  "statusCode": 0
}
```
This enables the UI layer to render user-friendly offline / connectivity warnings without application crashes.
