/**
 * SSE (Server-Sent Events) utilities.
 *
 * This file is intentionally framework-agnostic (no React/Next dependency) so it can be reused
 * in other features/projects by copying it as-is.
 *
 * Usage example (JSON SSE):
 *   const res = await fetch("/api/xxx", { method: "POST" });
 *   await consumeJsonSseStream(res, {
 *     parse: (raw) => (isMyEvent(raw) ? raw : null),
 *     onMessage: (event) => console.log(event),
 *     onError: (message) => console.error(message),
 *   });
 */

type ConsumeJsonSseStreamOptions<T> = {
  /**
   * Called when a JSON `data:` event is successfully parsed (and `parse` returned non-null).
   */
  onMessage: (message: T) => void;
  /**
   * Called when the stream cannot be consumed (no body, etc).
   */
  onError: (message: string) => void;
  /**
   * Optional runtime parser/validator.
   * - Return `null` to ignore unknown/malformed events.
   * - If omitted, every JSON payload is cast to `T`.
   */
  parse?: (raw: unknown) => T | null;
};

/**
 * Consume an SSE response whose payload is JSON in `data: ...` format.
 *
 * Notes:
 * - Supports multiple `data:` lines per SSE event (joins with `\n`).
 * - Ignores malformed chunks by default to keep the UI responsive.
 */
export async function consumeJsonSseStream<T>(
  response: Response,
  { onMessage, onError, parse }: ConsumeJsonSseStreamOptions<T>,
): Promise<void> {
  if (!response.body) {
    onError("ストリームが開始できませんでした");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split by blank-line delimiter: \n\n or \r\n\r\n
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() ?? "";

    for (const rawEvent of parts) {
      const lines = rawEvent.split(/\r?\n/);
      const dataLines = lines
        .map((l) => l.trim())
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.replace(/^data:\s*/, ""));

      if (dataLines.length === 0) continue;
      const payloadText = dataLines.join("\n").trim();
      if (!payloadText) continue;

      try {
        const raw: unknown = JSON.parse(payloadText);
        const message = parse ? parse(raw) : (raw as T);
        if (message !== null) {
          onMessage(message);
        }
      } catch {
        // ignore malformed chunk (e.g. partial JSON)
      }
    }
  }
}

