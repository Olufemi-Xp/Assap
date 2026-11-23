type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  event: string;
  level?: LogLevel;
  requestId?: string;
  userId?: string;
  durationMs?: number;
  errorCode?: string;
  data?: Record<string, unknown>;
  error?: unknown;
}

const SENSITIVE_KEYS = new Set([
  "otp",
  "password",
  "secret",
  "token",
  "authorization",
  "key",
  "cookie",
  "phone",
  "whatsapp",
]);

function redact(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(redact);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = Array.from(SENSITIVE_KEYS).some((s) => lowerKey.includes(s));

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = redact(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const logger = {
  info(payload: LogPayload) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        ...payload,
        data: payload.data ? redact(payload.data) : undefined,
      })
    );
  },
  warn(payload: LogPayload) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        ...payload,
        data: payload.data ? redact(payload.data) : undefined,
      })
    );
  },
  error(payload: LogPayload) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        ...payload,
        data: payload.data ? redact(payload.data) : undefined,
      })
    );
  },
};
