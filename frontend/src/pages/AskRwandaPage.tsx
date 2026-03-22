import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Loader2, 
  Mic, 
  Building2, 
  Route, 
  MapPin, 
  BookOpen,
  Users,
  Compass,
  MessageCircle,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/brand";
import { useContentAccess } from "@/hooks/useContentAccess";
import {
  AskRwandaTopicTile,
  AskRwandaFilterBar,
  AskRwandaFilter,
  AskRwandaContextChip,
  AskRwandaContext,
  AskRwandaEmptyState,
  AskRwandaMessage,
  AskRwandaSource,
  RelatedContent,
  AccessLevelBanner,
} from "@/components/askrwanda";
import { useAskRwanda } from "@/hooks/useAskRwanda";

// Topic definitions
const topics = [
  {
    id: "history",
    icon: BookOpen,
    title: "Rwanda History",
    description: "Learn about Rwanda's past, from ancient kingdoms to modern day",
    variant: "default" as const,
    prompt: "Tell me about Rwanda's history",
  },
  {
    id: "museums",
    icon: Building2,
    title: "Museums & Memorials",
    description: "Explore memorial sites and their significance",
    variant: "museum" as const,
    prompt: "What museums and memorials should I visit in Rwanda?",
  },
  {
    id: "themes",
    icon: Compass,
    title: "Themes",
    description: "Rebuilding, Culture, Nature, Memory",
    variant: "theme" as const,
    prompt: "Tell me about Rwanda's journey of rebuilding and reconciliation",
  },
  {
    id: "testimonies",
    icon: Users,
    title: "Testimonies",
    description: "Survivor stories and voices of resilience",
    variant: "testimony" as const,
    prompt: "Tell me about survivor testimonies and their importance",
  },
  {
    id: "routes",
    icon: Route,
    title: "Routes & Journeys",
    description: "Discover travel paths and experiences",
    variant: "route" as const,
    prompt: "What are the best routes to explore Rwanda?",
  },
  {
    id: "kigali",
    icon: MapPin,
    title: "Kigali Highlights",
    description: "Explore the capital city",
    variant: "default" as const,
    prompt: "What are the highlights of Kigali?",
  },
];

const popularQuestions = [
  "Why is Kigali Memorial important?",
  "Explain reconciliation in Rwanda",
  "Give me safe stories for kids",
  "What happened in 1994?",
];

export default function AskRwandaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { hasSubscription, tourGroupAccess } = useContentAccess();
  
  // Parse context from URL or navigation state
  const contextFromState = location.state?.context as AskRwandaContext | undefined;
  const contextType = searchParams.get("contextType") as AskRwandaContext["type"];
  const contextId = searchParams.get("contextId");
  const contextTitle = searchParams.get("contextTitle");
  
  const initialContext: AskRwandaContext | null = contextFromState || (contextType && contextId && contextTitle
    ? { type: contextType, id: contextId, title: contextTitle }
    : null);
  
  const [context, setContext] = useState<AskRwandaContext | null>(initialContext);
  const [filter, setFilter] = useState<AskRwandaFilter>("all");
  const [input, setInput] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, error, sendMessage, clearMessages } = useAskRwanda({
    context,
    filter,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string = input) => {
    if (!text.trim() || isLoading) return;
    sendMessage(text);
    setInput("");
  };

  const handleTopicClick = (topic: typeof topics[0]) => {
    handleSend(topic.prompt);
  };

  const handleSourceClick = (source: AskRwandaSource) => {
    // Navigate to the source content
    if (source.url) {
      navigate(source.url);
    } else {
      // Navigate based on type
      switch (source.type) {
        case "testimony":
          navigate(`/testimonies/${source.id}`);
          break;
        case "documentary":
          navigate(`/documentaries/${source.id}`);
          break;
        case "museum_panel":
          navigate(`/exhibition/${source.id}`);
          break;
        case "location":
          navigate(`/locations/${source.id}`);
          break;
        default:
          toast.info(`Opening: ${source.title}`);
      }
    }
  };

  const handleRelatedClick = (content: RelatedContent) => {
    switch (content.type) {
      case "story":
        navigate(`/stories/${content.id}`);
        break;
      case "location":
        navigate(`/locations/${content.id}`);
        break;
      case "theme":
        navigate(`/themes/${content.id}`);
        break;
    }
  };

  const handleClearContext = () => {
    setContext(null);
    clearMessages();
  };

  const handleSaveConversation = () => {
    toast.success("Conversation saved to your collection");
  };

  const getContextualTitle = () => {
    if (!context) return "Ask Rwanda";
    switch (context.type) {
      case "museum":
        return "Ask about this Museum";
      case "location":
        return "Ask about this Place";
      case "route":
        return "Ask about this Journey";
      case "story":
        return "Ask about this Story";
      default:
        return "Ask Rwanda";
    }
  };

  const getContextualSubtitle = () => {
    if (!context) return "Explore Rwanda's stories, history & culture.";
    switch (context.type) {
      case "museum":
        return `Ask about ${context.title}, its history, exhibits, or testimonies.`;
      case "location":
        return `Ask about ${context.title}, its history, stories, or what to see.`;
      case "route":
        return `Ask about stops, stories, or what you'll see along the way.`;
      case "story":
        return `Ask for deeper context or related stories.`;
      default:
        return "Explore Rwanda's stories, history & culture.";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-midnight text-white safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4 page-content-narrow">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber" />
            <h1 className="font-serif text-lg font-semibold">
              {getContextualTitle()}
            </h1>
          </div>
          {messages.length > 0 ? (
            <button
              onClick={handleSaveConversation}
              className="w-10 h-10 flex items-center justify-center -mr-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Save className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
        
        {/* Context chip */}
        {context && (
          <div className="px-4 pb-3 page-content-narrow">
            <AskRwandaContextChip context={context} onClear={handleClearContext} />
          </div>
        )}
      </header>

      {/* Filter bar - only show in general mode without conversation */}
      {!context && messages.length === 0 && (
        <div className="bg-background border-b border-border/50 page-content-narrow w-full">
          <AskRwandaFilterBar activeFilter={filter} onFilterChange={setFilter} />
        </div>
      )}

      {/* Access Level Banner */}
      <div className="px-4 pt-4 page-content-narrow w-full">
        <AccessLevelBanner 
          hasSubscription={hasSubscription} 
          tourGroupAccess={tourGroupAccess} 
        />
      </div>

      {/* Messages / Empty State */}
      <div className="flex-1 overflow-y-auto px-4 py-6 page-content-narrow w-full">
        {messages.length === 0 ? (
          <div>
            {/* Intro */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-amber" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                {context ? `Ask about ${context.title}` : "Ask me anything about Rwanda"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {getContextualSubtitle()}
              </p>
            </div>

            {/* Topics Grid */}
            {!context && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Suggested Topics
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {topics.slice(0, 4).map((topic) => (
                    <AskRwandaTopicTile
                      key={topic.id}
                      icon={topic.icon}
                      title={topic.title}
                      description={topic.description}
                      variant={topic.variant}
                      onClick={() => handleTopicClick(topic)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Questions */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                {context ? "Suggested Questions" : "Popular Questions"}
              </h3>
              <div className="space-y-2">
                {(context ? [
                  `What is the history of ${context.title}?`,
                  `What can I see at ${context.title}?`,
                  `Tell me about testimonies from this place`,
                  `What should I know before visiting?`,
                ] : popularQuestions).map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSend(question)}
                    className="w-full p-3 bg-card rounded-xl text-left text-sm hover:bg-card/80 transition-colors flex items-center justify-between group border border-border/50"
                  >
                    <span className="text-foreground">{question}</span>
                    <MessageCircle className="w-4 h-4 text-muted-foreground group-hover:text-amber transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <AskRwandaMessage
                key={message.id}
                message={message}
                onSourceClick={handleSourceClick}
                onRelatedClick={handleRelatedClick}
                onRequestGentleSummary={() => {
                  handleSend("Please give me a gentler summary of this topic");
                }}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}

            {error && (
              <AskRwandaEmptyState
                variant="error"
                onSuggestionClick={handleSend}
              />
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
              placeholder={context ? `Ask about ${context.title}...` : "Ask about Rwanda..."}
              className="flex-1 h-12 px-4 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              disabled={isLoading}
            />
            <button
              type="button"
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
              onClick={() => toast.info("Voice input coming soon")}
            >
              <Mic className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                input.trim()
                  ? "bg-amber text-midnight hover:bg-sunset-gold"
                  : "bg-muted text-muted-foreground"
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
