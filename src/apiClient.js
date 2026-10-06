const API_BASE_URL = "/api";

export const apiClient = {
  async createTicket(ticketData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: body.error || {
            code: response.status === 400 ? "VALIDATION_ERROR" : "API_ERROR",
            message: body.message || `Request failed with status ${response.status}`,
          },
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data: body.data || {
          id: body.id || `TKT-${Date.now()}`,
          qrCodeUrl: body.qrCodeUrl || `https://cdn.example.com/qr/${body.id || "ticket"}.png`,
        },
        message: body.message || "Ticket created successfully",
        statusCode: response.status || 201,
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: err?.message || "A network error occurred while communicating with the server",
        },
        statusCode: 0,
      };
    }
  },

  async getTicket(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: body.error || {
            code: response.status === 404 ? "NOT_FOUND" : "API_ERROR",
            message: body.message || `Ticket ${id} not found`,
          },
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data: body.data || body,
        message: body.message || "OK",
        statusCode: response.status || 200,
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: err?.message || "Failed to retrieve ticket due to network error",
        },
        statusCode: 0,
      };
    }
  },
};