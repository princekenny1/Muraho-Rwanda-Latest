import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { SourceChips } from "@/components/media/SourceChips";
import { cn } from "@/lib/utils";
import kctPost from "@/assets/KCT-Post.jpg";

interface AskRwandaProps {
  onBack: () => void;
  onStoryClick?: (storyId: string) => void;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  sources?: Array<{
    id: string;
    label: string;
    url?: string;
    type?: "museum" | "institution" | "archive";
  }>;
  relatedStories?: Array<{ id: string; title: string; imageUrl: string }>;
}

const suggestions = [
  "What happened in 1994?",
  "Tell me about reconciliation efforts",
  "What can I see at the Kigali Memorial?",
  "Best places to visit in Rwanda",
];

const mockResponses: Record<string, Omit<Message, "id" | "type">> = {
  "What happened in 1994?": {
    content:
      "In April 1994, Rwanda experienced a genocide against the Tutsi that lasted approximately 100 days. During this period, an estimated 800,000 to 1 million people were killed. The genocide was carried out by extremist Hutu militias and civilians against Tutsi and moderate Hutu populations.\n\nToday, Rwanda has made remarkable strides in reconciliation and development. The country has established memorials and education programs to ensure this history is never forgotten.",
    sources: [
      {
        id: "kgm",
        label: "Kigali Genocide Memorial",
        url: "https://kgm.rw",
        type: "museum",
      },
      {
        id: "aegis",
        label: "Aegis Trust",
        url: "https://aegistrust.org",
        type: "institution",
      },
    ],
    relatedStories: [
      { id: "story-1", title: "Kigali Genocide Memorial", imageUrl: kctPost },
    ],
  },
  default: {
    content:
      "I'm here to help you learn about Rwanda's history, culture, and places to visit. I draw from trusted sources including the Kigali Genocide Memorial, Aegis Trust, UNESCO, and official tourism resources.\n\nFeel free to ask me about memorials, cultural experiences, or travel recommendations.",
    sources: [
      { id: "kgm", label: "Kigali Genocide Memorial", type: "museum" },
      { id: "rdb", label: "Visit Rwanda", type: "institution" },
    ],
  },
};

export function AskRwanda({ onBack, onStoryClick }: AskRwandaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = mockResponses[text.trim()] || mockResponses.default;
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      ...response,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4 page-content-narrow">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber" />
            <h1 className="font-serif text-lg font-semibold text-foreground">
              Ask Rwanda
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 page-content-narrow w-full">
        {messages.length === 0 ? (
          <div className="text-center pt-8">
            <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-amber" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Ask me anything about Rwanda
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              I can help with history, memorials, culture, and travel tips. All
              answers are sourced from trusted institutions.
            </p>

            {/* Suggestions */}
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full p-3 bg-card rounded-xl text-left text-sm hover:bg-card/80 transition-colors flex items-center justify-between group"
                >
                  <span className="text-foreground">{suggestion}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "animate-fade-up",
                  message.type === "user" && "flex justify-end",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.type === "user"
                      ? "bg-amber text-midnight rounded-br-sm"
                      : "bg-card border border-border/50 rounded-bl-sm",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm leading-relaxed whitespace-pre-line",
                      message.type === "user"
                        ? "text-midnight"
                        : "text-foreground",
                    )}
                  >
                    {message.content}
                  </p>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-2">
                        Sources
                      </p>
                      <SourceChips sources={message.sources} />
                    </div>
                  )}

                  {/* Related stories */}
                  {message.relatedStories &&
                    message.relatedStories.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <p className="text-xs text-muted-foreground mb-2">
                          Related Stories
                        </p>
                        <div className="flex gap-2 overflow-x-auto">
                          {message.relatedStories.map((story) => (
                            <button
                              key={story.id}
                              onClick={() => onStoryClick?.(story.id)}
                              className="flex items-center gap-2 px-3 py-2 bg-midnight/5 rounded-lg hover:bg-midnight/10 transition-colors"
                            >
                              <img
                                src={story.imageUrl}
                                alt={story.title}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                                {story.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border/50 px-4 py-3 safe-area-bottom">
        <div className="page-content-narrow">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Rwanda..."
              className="flex-1 h-12 px-4 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                input.trim()
                  ? "bg-amber text-midnight hover:bg-sunset-gold"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
