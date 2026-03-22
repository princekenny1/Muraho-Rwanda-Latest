import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Bookmark, Sparkles } from "lucide-react";
import {
  WeatherChip,
  ChooseYourPath,
  ModeTemplate,
  LocationHero,
  type JourneyMood,
  type ExplorationStyle,
  type ExperienceMode,
} from "@/components/location";
import { WeatherProvider } from "@/components/ambient/WeatherTriggeredStories";
import coverImg from "@/assets/cover.jpg";
import kctPost from "@/assets/KCT-Post.jpg";
import kctPrecolonial from "@/assets/KCT-precolonial.jpg";

// Mock data - would come from database
const mockLocationData = {
  id: "kigali-genocide-memorial",
  title: "Kigali Genocide Memorial",
  subtitle: "A Place of Remembrance",
  coverImage: coverImg,
  hasThenAndNow: true,
  thenImage: kctPost,
  nowImage: kctPrecolonial,
  thenLabel: "1994",
  nowLabel: "2024",
  summary:
    "The Kigali Genocide Memorial is the final resting place for more than 250,000 victims of the 1994 Genocide against the Tutsi. It serves as a place of remembrance, learning, and a tribute to the strength of survivors.",
  kidFriendlySummary:
    "This is a very special place where people come to remember and honor those who lived here long ago. It helps us learn about being kind to one another.",
};

export default function LocationPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [journeyMood, setJourneyMood] = useState<JourneyMood>("curious");
  const [explorationStyle, setExplorationStyle] =
    useState<ExplorationStyle>("basic");
  const [experienceMode, setExperienceMode] =
    useState<ExperienceMode>("standard");
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleApplyPath = useCallback(
    (mood: JourneyMood, style: ExplorationStyle, mode: ExperienceMode) => {
      setJourneyMood(mood);
      setExplorationStyle(style);
      setExperienceMode(mode);
    },
    [],
  );

  const handleViewWeatherStories = () => {
    navigate("/stories?filter=weather");
  };

  const location = mockLocationData;

  // Get summary based on mode
  const getSummary = () => {
    if (experienceMode === "kid-friendly") {
      return location.kidFriendlySummary;
    }
    return location.summary;
  };

  return (
    <WeatherProvider>
      <div className="min-h-screen bg-background pb-8">
        {/* Hero Section */}
        <LocationHero
          title={location.title}
          subtitle={location.subtitle}
          coverImage={location.coverImage}
          hasThenAndNow={location.hasThenAndNow}
          thenImage={location.thenImage}
          nowImage={location.nowImage}
          thenLabel={location.thenLabel}
          nowLabel={location.nowLabel}
          mode={experienceMode}
          onBack={() => navigate(-1)}
          onSave={() => setIsSaved(!isSaved)}
          onShare={() => {
            navigator.share?.({
              title: location.title,
              url: window.location.href,
            });
          }}
          isSaved={isSaved}
        />

        {/* Content Area */}
        <div className="px-4 space-y-6 mt-6">
          {/* Choose Your Path - Primary CTA under hero */}
          <ChooseYourPath
            currentMood={journeyMood}
            currentStyle={explorationStyle}
            currentMode={experienceMode}
            onApplyPath={handleApplyPath}
          />

          {/* Weather Chip - Compact, subtle */}
          <WeatherChip onViewWeatherStories={handleViewWeatherStories} />

          {/* Mode-Specific Content Template */}
          <ModeTemplate
            mode={experienceMode}
            title={location.title}
            summary={getSummary()}
            onPlayAudio={() => setIsPlaying(!isPlaying)}
            isPlaying={isPlaying}
          >
            {/* Additional content blocks can go here */}
          </ModeTemplate>

          {/* Actions Footer */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setIsSaved(!isSaved)}
            >
              {isSaved ? (
                <Heart className="w-4 h-4 fill-terracotta text-terracotta" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              {isSaved ? "Saved" : "Save"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => {
                navigator.share?.({
                  title: location.title,
                  url: window.location.href,
                });
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>

          {/* Ask Rwanda Contextual Button */}
          <Button
            onClick={() =>
              navigate("/ask-rwanda", {
                state: {
                  context: {
                    type: "museum",
                    id: location.id,
                    title: location.title,
                  },
                },
              })
            }
            className="w-full bg-amber hover:bg-sunset-gold text-midnight gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Ask about this place
          </Button>
        </div>
      </div>
    </WeatherProvider>
  );
}
