import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface AiAssistOptions {
  type: "polish_bio" | "match_category";
  prompt: string;
}

export const aiService = {
  async assist(opts: AiAssistOptions): Promise<{ suggestion: string; isFallback: boolean }> {
    const trimmed = opts.prompt.trim().slice(0, 500);

    // Fallback template if OpenRouter is unreachable or in test environment
    const getFallback = () => {
      if (opts.type === "polish_bio") {
        return {
          suggestion: `Experienced, punctual, and reliable service provider in Nigeria. Committed to high quality workmanship and honest customer pricing. Contact for quick response.`,
          isFallback: true,
        };
      }
      return {
        suggestion: "General Home Repairs & Maintenance",
        isFallback: true,
      };
    };

    if (!env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY.includes("placeholder")) {
      return getFallback();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const systemPrompt =
        opts.type === "polish_bio"
          ? "You are a professional copywriter for Nigerian service providers (plumbers, electricians, cleaners). Rewrite the user's rough notes into a concise, trustworthy 2-3 sentence business bio. Do not add fluff or markdown."
          : "You map everyday Nigerian problem descriptions to the single most relevant service category (Plumber, Electrician, Cleaner, Carpenter, Laundry, Mechanic, Painter, AC Technician). Return only the category name.";

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.NEXT_PUBLIC_APP_URL,
          "X-Title": env.NEXT_PUBLIC_APP_NAME,
        },
        body: JSON.stringify({
          model: env.OPENROUTER_FREE_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: trimmed },
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn({ event: "openrouter_api_error", errorCode: `${response.status}` });
        return getFallback();
      }

      const json = await response.json();
      const reply = json.choices?.[0]?.message?.content?.trim();

      if (!reply) return getFallback();

      return { suggestion: reply, isFallback: false };
    } catch (err) {
      logger.warn({ event: "openrouter_request_exception", error: (err as Error).message });
      return getFallback();
    }
  },
};
