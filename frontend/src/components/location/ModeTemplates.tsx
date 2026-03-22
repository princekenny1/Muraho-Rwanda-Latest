import { ReactNode } from "react";
import { Heart, Users, Baby, Shield, Lightbulb, BookOpen, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ExperienceMode } from "./ChooseYourPath";

interface ModeTemplateProps {
  mode: ExperienceMode;
  title: string;
  summary: string;
  children?: ReactNode;
  onPlayAudio?: () => void;
  isPlaying?: boolean;
}

// Standard Mode - Neutral, factual, clean
function StandardTemplate({ title, summary, children, onPlayAudio, isPlaying }: Omit<ModeTemplateProps, "mode">) {
  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <section className="p-4 rounded-2xl bg-card border border-border/50">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-3">{title}</h2>
        <p className="text-muted-foreground leading-relaxed">{summary}</p>
      </section>

      {/* Soundscape Options */}
      <section className="p-4 rounded-2xl bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Audio Narration</h3>
        </div>
        <Button
          onClick={onPlayAudio}
          variant="outline"
          className="w-full justify-start gap-3"
        >
          <div className={cn("w-8 h-8 rounded-full bg-amber flex items-center justify-center", isPlaying && "animate-pulse")}>
            <Volume2 className="w-4 h-4 text-midnight" />
          </div>
          {isPlaying ? "Pause Narration" : "Listen to Narration"}
        </Button>
      </section>

      {/* Main Content */}
      {children}

      {/* Related Stories */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Stories</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-card border border-border/50">
              <div className="h-24 bg-muted" />
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2">Related Story {i}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Personal Voices Mode - Emotional, intimate, audio-forward
function PersonalVoicesTemplate({ title, summary, children, onPlayAudio, isPlaying }: Omit<ModeTemplateProps, "mode">) {
  return (
    <div className="space-y-6">
      {/* Human Intro Section */}
      <section className="p-5 rounded-2xl bg-gradient-to-br from-muted-indigo/10 to-soft-lavender/20 border border-muted-indigo/20">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-muted-indigo" />
          <span className="text-sm font-medium text-muted-indigo">Personal Voices</span>
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground leading-relaxed italic">
          "Hear personal accounts from those who lived through these moments..."
        </p>
      </section>

      {/* Featured Testimony Card */}
      <section className="p-4 rounded-2xl bg-midnight text-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="font-medium">Featured Testimony</p>
            <p className="text-sm text-white/70">Survivor Story</p>
          </div>
        </div>
        <Button
          onClick={onPlayAudio}
          className="w-full bg-amber hover:bg-sunset-gold text-midnight"
        >
          {isPlaying ? "Pause Audio" : "Listen to Testimony"}
        </Button>
      </section>

      {/* Story Narrative with Quotes */}
      <section className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">{summary}</p>
        <blockquote className="pl-4 border-l-4 border-muted-indigo italic text-foreground">
          "Every voice carries a story that must be heard and remembered..."
        </blockquote>
      </section>

      {/* Main Content */}
      {children}

      {/* Safety Notice */}
      <section className="p-4 rounded-xl bg-amber/10 border border-amber/30">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber">Content Advisory</p>
            <p className="text-xs text-amber-800 dark:text-amber/80 mt-1">
              Some testimonies contain sensitive content. Take breaks as needed.
            </p>
          </div>
        </div>
      </section>

      {/* Related Voices */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          More Personal Voices
        </h3>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-muted-indigo/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="text-left">
                <p className="text-sm font-medium">Survivor Voice {i}</p>
                <p className="text-xs text-muted-foreground">5 min listen</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// Kid-Friendly Mode - Simple, safe, friendly
function KidFriendlyTemplate({ title, summary, children }: Omit<ModeTemplateProps, "mode">) {
  return (
    <div className="space-y-6">
      {/* Kid-Friendly Intro */}
      <section className="p-5 rounded-2xl bg-gradient-to-br from-sky-100 to-emerald-50 dark:from-sky-900/30 dark:to-emerald-900/20 border-2 border-sky-200 dark:border-sky-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center">
            <Baby className="w-4 h-4 text-midnight" />
          </div>
          <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">Kid-Friendly Mode</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Let's learn about this special place together!
        </p>
      </section>

      {/* Info Cards */}
      <section className="grid grid-cols-1 gap-3">
        {[
          { icon: Lightbulb, title: "What Happened?", color: "bg-amber/20 text-amber-700" },
          { icon: Users, title: "Who Lived Here?", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
          { icon: Heart, title: "Why Is It Important?", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
        ].map((card, i) => (
          <button
            key={i}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent hover:border-muted-indigo/30 transition-all",
              card.color
            )}
          >
            <card.icon className="w-8 h-8" />
            <span className="text-lg font-semibold">{card.title}</span>
          </button>
        ))}
      </section>

      {/* Simple Story */}
      <section className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-muted-indigo" />
          <h3 className="font-semibold">The Story</h3>
        </div>
        <p className="text-lg leading-relaxed text-foreground">{summary}</p>
      </section>

      {/* Kid-Safe Audio Block */}
      <section className="p-4 rounded-2xl bg-gradient-to-r from-amber/20 to-sunset-gold/20 border border-amber/30">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-amber flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-midnight" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Listen to the Story</p>
            <p className="text-sm text-muted-foreground">A friendly voice will tell you about this place</p>
          </div>
        </div>
      </section>

      {/* Activity Box */}
      <section className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Try This!</h3>
        </div>
        <p className="text-emerald-700 dark:text-emerald-300">
          🎨 Draw a picture of what you learned today and share it with your family!
        </p>
      </section>

      {/* Main Content */}
      {children}

      {/* Parent Guidance Footer */}
      <section className="p-4 rounded-xl bg-muted/50 border border-border/50">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">For Parents & Guardians</p>
            <p className="text-xs text-muted-foreground mt-1">
              This content is designed to be age-appropriate. Consider discussing these topics together with your child.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Main export component
export function ModeTemplate(props: ModeTemplateProps) {
  switch (props.mode) {
    case "personal-voices":
      return <PersonalVoicesTemplate {...props} />;
    case "kid-friendly":
      return <KidFriendlyTemplate {...props} />;
    case "standard":
    default:
      return <StandardTemplate {...props} />;
  }
}
