import { useState, useCallback, useRef } from "react";
import {
  AskRwandaMessageData,
  AskRwandaSource,
  RelatedContent,
  AskRwandaContext,
  AskRwandaFilter,
} from "@/components/askrwanda";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

interface UseAskRwandaOptions {
  context?: AskRwandaContext | null;
  filter?: AskRwandaFilter;
}

export function useAskRwanda(options: UseAskRwandaOptions = {}) {
  const [messages, setMessages] = useState<AskRwandaMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim()) return;

      const userMessage: AskRwandaMessageData = {
        id: Date.now().toString(),
        role: "user",
        content: userInput.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Prepare context for the edge function
      const contextData = options.context
        ? {
            type: options.context.type,
            id: options.context.id,
            title: options.context.title,
          }
        : null;

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch(`${api.baseURL}/ask-rwanda`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: contextData,
            filter: options.filter || "all",
            mode: "standard",
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "Rate limit exceeded. Please try again in a moment.",
            );
          }
          if (response.status === 402) {
            throw new Error("AI credits exhausted. Please try again later.");
          }
          throw new Error("Failed to get response from Ask Rwanda");
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let sources: AskRwandaSource[] = [];
        let relatedContent: RelatedContent[] = [];
        let isSensitive = false;

        const assistantMessageId = (Date.now() + 1).toString();

        // Create initial assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          },
        ]);

        if (reader) {
          let textBuffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            textBuffer += decoder.decode(value, { stream: true });

            // Process line-by-line as data arrives
            let newlineIndex: number;
            while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
              let line = textBuffer.slice(0, newlineIndex);
              textBuffer = textBuffer.slice(newlineIndex + 1);

              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (line.startsWith(":") || line.trim() === "") continue;
              if (!line.startsWith("data: ")) continue;

              const dataPayload = line.startsWith("data:")
                ? line.slice(5).replace(/^\s/, "")
                : line;
              const trimmedPayload = dataPayload.trim();

              if (trimmedPayload === "[DONE]") break;
              if (trimmedPayload.startsWith("[ERROR]")) {
                const streamError = trimmedPayload
                  .replace("[ERROR]", "")
                  .trim();
                const fallbackMessage =
                  "I’m temporarily unable to fetch the full AI answer. Please try again in a moment, or explore Stories, Museums, and Routes while I reconnect.";
                assistantContent = fallbackMessage;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: assistantContent }
                      : m,
                  ),
                );
                if (streamError) {
                  console.warn("Ask Rwanda stream error:", streamError);
                }
                textBuffer = "";
                break;
              }

              try {
                const parsed = JSON.parse(trimmedPayload);

                // Handle metadata (sources, related content)
                if (parsed.metadata) {
                  sources = parsed.metadata.sources || [];
                  relatedContent = parsed.metadata.relatedContent || [];
                  isSensitive = parsed.metadata.isSensitive || false;
                  continue;
                }

                // Handle content delta
                const content = parsed.choices?.[0]?.delta?.content as
                  | string
                  | undefined;
                if (content) {
                  assistantContent += content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: assistantContent }
                        : m,
                    ),
                  );
                  continue;
                }

                // Handle non-streaming fallback payloads
                const fallbackContent =
                  parsed.response || parsed.answer || parsed.content;
                if (
                  typeof fallbackContent === "string" &&
                  fallbackContent.length > 0
                ) {
                  assistantContent += fallbackContent;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: assistantContent }
                        : m,
                    ),
                  );
                }
              } catch {
                // Plain token stream fallback (non-JSON SSE payload)
                assistantContent += dataPayload;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: assistantContent }
                      : m,
                  ),
                );
              }
            }
          }

          // Final update with sources and related content
          if (!assistantContent.trim()) {
            assistantContent =
              "I’m temporarily unable to fetch the full AI answer. Please try again in a moment, or explore Stories, Museums, and Routes while I reconnect.";
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: assistantContent,
                    sources,
                    relatedContent,
                    isSensitive,
                  }
                : m,
            ),
          );
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        toast.error(errorMessage);

        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((m) => m.content !== ""));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, options.context, options.filter],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    cancelRequest,
  };
}
