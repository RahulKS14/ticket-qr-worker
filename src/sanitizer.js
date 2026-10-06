export function sanitizeInput(input) {
  if (typeof input !== "string") {
    return input == null ? "" : String(input);
  }

  let sanitized = input;

  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "");
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  sanitized = sanitized.replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, "");

  sanitized = sanitized.replace(/[<>]/g, "");

  sanitized = sanitized.replace(/javascript\s*:/gi, "");

  sanitized = sanitized.replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  sanitized = sanitized.replace(/--+/g, "");
  sanitized = sanitized.replace(/;\s*DROP\s+TABLE/gi, " DROP TABLE");
  sanitized = sanitized.replace(/;+/g, "");

  return sanitized;
}