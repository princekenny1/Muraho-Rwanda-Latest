import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Building2 } from "lucide-react";
import { useContentAccess } from "@/hooks/useContentAccess";

export function WelcomeCard() {
  const { tourGroupAccess } = useContentAccess();

  // If user has agency access, show agency-branded welcome
  if (tourGroupAccess) {
    return (
      <Card className="bg-gradient-to-br from-adventure-green/15 to-forest-teal/10 border-adventure-green/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-adventure-green/20 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-adventure-green" />
            </div>
            <div>
              <p className="text-xs text-adventure-green font-medium mb-1">
                {tourGroupAccess.agencyName} recommends
              </p>
              <h2 className="font-serif text-lg font-semibold text-foreground mb-1">
                Welcome to Muraho Rwanda
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your tour includes full access to stories, museums, and journeys. Start exploring!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default welcome card for individual tourists
  return (
    <Card className="bg-gradient-to-br from-muted-indigo/20 to-forest-teal/10 border-muted-indigo/30">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-muted-indigo/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-muted-indigo" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-1">
              Welcome to Muraho Rwanda
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore stories, museums, testimonies, and journeys through Rwanda's rich heritage.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
