import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { AskRwandaSourceCard, AskRwandaSource } from "./AskRwandaSourceCard";
import { AskRwandaSafetyBanner } from "./AskRwandaSafetyBanner";
import ReactMarkdown from "react-markdown";

export interface RelatedContent {
  id: string;
  type: "story" | "location" | "theme";
  title: string;
  imageUrl?: string;
}

export interface AskRwandaMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AskRwandaSource[];
  relatedContent?: RelatedContent[];
  isSensitive?: boolean;
  timestamp?: Date;
}

interface AskRwandaMessageProps {
  message: AskRwandaMessageData;
  onSourceClick?: (source: AskRwandaSource) => void;
  onRelatedClick?: (content: RelatedContent) => void;
  onRequestGentleSummary?: () => void;
}

export function AskRwandaMessage({
  message,
  onSourceClick,
  onRelatedClick,
  onRequestGentleSummary,
}: AskRwandaMessageProps) {
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "animate-fade-up",
        isUser && "flex justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-amber text-midnight rounded-br-sm"
            : "bg-card border border-border/50 rounded-bl-sm"
        )}
      >
        {/* Safety banner for sensitive content */}
        {!isUser && message.isSensitive && (
          <div className="mb-3">
            <AskRwandaSafetyBanner
              variant="warning"
              onRequestGentleSummary={onRequestGentleSummary}
            />
          </div>
        )}

        {/* Message content with markdown support */}
        <div
          className={cn(
            "text-sm leading-relaxed prose prose-sm max-w-none",
            isUser ? "text-midnight prose-headings:text-midnight" : "text-foreground prose-headings:text-foreground"
          )}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Sources section - collapsible */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <button
              onClick={() => setSourcesExpanded(!sourcesExpanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {sourcesExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <span>Sources ({message.sources.length})</span>
            </button>
            
            {sourcesExpanded && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.sources.map((source) => (
                  <AskRwandaSourceCard
                    key={source.id}
                    source={source}
                    onClick={() => onSourceClick?.(source)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related content - Explore Further */}
        {!isUser && message.relatedContent && message.relatedContent.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Explore Further
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {message.relatedContent.map((content) => (
                <button
                  key={content.id}
                  onClick={() => onRelatedClick?.(content)}
                  className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors shrink-0"
                >
                  {content.imageUrl ? (
                    <img
                      src={content.imageUrl}
                      alt={content.title}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-amber/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-amber" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-foreground whitespace-nowrap max-w-[120px] truncate">
                    {content.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
