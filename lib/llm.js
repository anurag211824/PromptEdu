import { ChatGroq } from "@langchain/groq";
import { jsonrepair } from "jsonrepair";

/**
 * Shared Groq/LangChain client for the course generation routes.
 *
 * All three generators (course layout, semester layout, chapter content) ask
 * the model for JSON, so the retry, model fallback and lenient parsing live
 * here rather than being repeated per route.
 */
/**
 * Groq meters tokens per minute *per model* (8k each on the free tier), and a
 * multi-chapter course needs well over one model's budget. Each entry here has
 * its own bucket, so rotating on a rate limit multiplies usable throughput
 * rather than just waiting. Ordered best-quality first.
 */
const MODEL_CHAIN = [
  process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
];

const MAX_RETRIES = 4;

// Enough room for the model's reasoning plus a full chapter of lesson HTML.
const MAX_OUTPUT_TOKENS = 6000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Rate limits and transient server errors are worth retrying; bad input is not. */
function isRetryable(error) {
  const status = error?.status ?? error?.response?.status ?? error?.code;
  if (status === 429 || status === 500 || status === 502 || status === 503) {
    return true;
  }
  return /rate limit|quota|overload|unavailable|too many requests|timeout|ECONNRESET|returned empty content/i.test(
    error?.message ?? ""
  );
}

/**
 * Best-effort JSON parse of a model response. Models sometimes wrap output in a
 * markdown fence or add a sentence around it, so the payload is sliced out
 * before parsing and repaired if it is still malformed.
 */
export function parseJsonResponse(rawText, { throwOnFailure = false } = {}) {
  if (!rawText) {
    if (throwOnFailure) throw new Error("Empty response from the AI model");
    return {};
  }

  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?/gi, "").replace(/```$/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      return JSON.parse(jsonrepair(cleaned));
    } catch {
      console.error("Failed to parse model JSON. Raw text was:", rawText);
      if (throwOnFailure) throw new Error("AI response was not valid JSON");
      return {};
    }
  }
}

/** Normalizes LangChain's message content, which can be a string or content blocks. */
function messageToText(message) {
  const content = message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text ?? ""))
      .join("");
  }
  return "";
}

/** Invokes Groq through LangChain and returns the raw text response. */
export async function invokeLlm(prompt, { modelIndex = 0, attempt = 0 } = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const model = MODEL_CHAIN[Math.min(modelIndex, MODEL_CHAIN.length - 1)];
  const hasNextModel = modelIndex + 1 < MODEL_CHAIN.length;

  try {
    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model,
      temperature: 0.7,
      // These are reasoning models: they spend output tokens thinking before
      // emitting an answer. At the 2048-token default they burn the whole
      // budget reasoning and return EMPTY content with finish_reason "length",
      // so give them headroom and keep the reasoning short.
      maxTokens: MAX_OUTPUT_TOKENS,
      modelKwargs: { reasoning_effort: "low" },
      // Retries are handled here so backoff is shared with model rotation.
      maxRetries: 0,
    });

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const text = messageToText(response);

    // A truncated response parses to nothing useful; treat it as retryable so
    // the caller rotates models rather than silently saving an empty chapter.
    if (!text.trim()) {
      const finish = response?.response_metadata?.finish_reason;
      throw new Error(
        `Model ${model} returned empty content (finish_reason: ${finish ?? "unknown"})`
      );
    }

    return text;
  } catch (error) {
    const notFound =
      error?.status === 404 ||
      /model.*not found|decommissioned/i.test(error?.message ?? "");

    if (notFound && hasNextModel) {
      console.warn(`Model ${model} unavailable, trying ${MODEL_CHAIN[modelIndex + 1]}`);
      return invokeLlm(prompt, { modelIndex: modelIndex + 1, attempt });
    }

    if (isRetryable(error)) {
      // One short retry on the same model absorbs a brief spike...
      if (attempt < 1) {
        const delay = 1000 + Math.random() * 400;
        await sleep(delay);
        return invokeLlm(prompt, { modelIndex, attempt: attempt + 1 });
      }

      // ...but a sustained rate limit means this model's token budget is spent,
      // so move to the next model's bucket instead of waiting it out.
      if (hasNextModel) {
        console.warn(
          `${model} rate limited, switching to ${MODEL_CHAIN[modelIndex + 1]}`
        );
        return invokeLlm(prompt, { modelIndex: modelIndex + 1, attempt: 0 });
      }

      // Last model in the chain - fall back to backing off.
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** attempt, 15000) + Math.random() * 400;
        console.warn(
          `All models rate limited, retrying in ${Math.round(delay)}ms`
        );
        await sleep(delay);
        return invokeLlm(prompt, { modelIndex, attempt: attempt + 1 });
      }
    }

    throw error;
  }
}

/** Invokes the model and parses its response as JSON. */
export async function invokeLlmJson(prompt, options = {}) {
  const rawText = await invokeLlm(prompt, options);
  return parseJsonResponse(rawText, options);
}
