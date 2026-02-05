import { createParser } from "eventsource-parser";

export type AiSseEvent = {
  event: string;
  data: unknown;
};

type StreamArgs = {
  url: string;
  token: string;
  body: Record<string, unknown>;
  onEvent: (event: AiSseEvent) => void;
  signal?: AbortSignal;
};

export const streamAiSse = async ({
  url,
  token,
  body,
  onEvent,
  signal,
}: StreamArgs): Promise<void> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "Request failed");
    throw new Error(errorText || "Request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const parser = createParser((event) => {
    if (event.type !== "event") return;
    if (!event.data) return;
    try {
      const parsed = JSON.parse(event.data);
      onEvent({ event: event.event || "message", data: parsed });
    } catch {
      onEvent({ event: event.event || "message", data: event.data });
    }
  });

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    parser.feed(decoder.decode(value, { stream: true }));
  }
};
