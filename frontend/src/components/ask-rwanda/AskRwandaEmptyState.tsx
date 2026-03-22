import { Sparkles, WifiOff, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AskRwandaEmptyStateProps {
  variant: "welcome" | "no-results" | "offline" | "error";
  onSuggestionClick?: (suggestion: string) => void;
  suggestions?: string[];
}

const defaultSuggestions = [
  "What happened in 1994?",
  "Tell me about reconciliation",
  "What can I see at the Kigali Memorial?",
  "Best places to visit in Rwanda",
];

const variantConfig = {
  welcome: {
    icon: Sparkles,
    title: "Ask me anything about Rwanda",
    description: "I can help with history, memorials, culture, and travel tips. All answers are sourced from trusted institutions.",
    iconClassName: "text-amber bg-amber/10",
    showSuggestions: true,
  },
  "no-results": {
    icon: Search,
    title: "I don't have an answer yet",
    description: "But here's what you can explore instead. Try rephrasing your question or browse these related topics.",
    iconClassName: "text-muted-foreground bg-muted",
    showSuggestions: true,
  },
  offline: {
    icon: WifiOff,
    title: "You're offline",
    description: "AI features require an internet connection. You can still browse downloaded content and offline summaries.",
    iconClassName: "text-muted-foreground bg-muted",
    showSuggestions: false,
  },
  error: {
    icon: HelpCircle,
    title: "Something went wrong",
    description: "I couldn't process your question. Please try again in a moment.",
    iconClassName: "text-destructive bg-destructive/10",
    showSuggestions: false,
  },
};

export function AskRwandaEmptyState({
  variant,
  onSuggestionClick,
  suggestions = defaultSuggestions,
}: AskRwandaEmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="text-center py-8 px-4">
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
          config.iconClassName
        )}
      >
        <Icon className="w-8 h-8" />
      </div>
      
      <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
        {config.title}
      </h2>
      
      <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
        {config.description}
      </p>

      {config.showSuggestions && onSuggestionClick && (
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="ghost"
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full justify-between text-left h-auto py-3 px-4 bg-card hover:bg-card/80 border border-border/50"
            >
              <span className="text-sm">{suggestion}</span>
              <span className="text-muted-foreground">→</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
