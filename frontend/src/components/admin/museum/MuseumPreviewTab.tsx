import { Building2, MapPin, Clock, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Museum } from "@/hooks/useMuseumAdmin";

interface MuseumPreviewTabProps {
  museum: Museum;
}

export function MuseumPreviewTab({ museum }: MuseumPreviewTabProps) {
  return (
    <div className="page-content-narrow space-y-4">
      {/* Simulated Mobile Preview */}
      <div className="border rounded-2xl overflow-hidden bg-card shadow-lg">
        {/* Hero */}
        <div className="aspect-video bg-muted relative">
          {museum.cover_image ? (
            <img
              src={museum.cover_image}
              alt={museum.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted-indigo/20 to-terracotta/20">
              <Building2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="font-serif text-xl font-semibold">{museum.name}</h1>
            {museum.address && (
              <p className="text-sm text-white/80 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {museum.address}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {museum.short_description && (
            <p className="text-sm text-muted-foreground">
              {museum.short_description}
            </p>
          )}

          {/* Quick Info */}
          <div className="flex flex-wrap gap-2">
            {museum.is_featured && (
              <Badge variant="secondary" className="bg-amber/20 text-amber-foreground">
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {museum.indoor_flow.replace("_", " ")}
            </Badge>
          </div>

          {/* Sections Preview */}
          <div className="space-y-3 pt-4 border-t">
            {museum.show_outdoor_map && (
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-lg bg-adventure-green/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-adventure-green" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Outdoor Stops</p>
                    <p className="text-xs text-muted-foreground">
                      Explore memorial gardens and outdoor spaces
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-lg bg-muted-indigo/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-indigo" />
                </div>
                <div>
                  <p className="font-medium text-sm">Indoor Exhibitions</p>
                  <p className="text-xs text-muted-foreground">
                    View exhibition rooms and panels
                  </p>
                </div>
              </CardContent>
            </Card>

            {museum.visitor_guidance && (
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-lg bg-terracotta/20 flex items-center justify-center">
                    <Info className="h-5 w-5 text-terracotta" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Visitor Information</p>
                    <p className="text-xs text-muted-foreground">
                      Hours, etiquette, and guidance
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Safety Notice */}
          {museum.safety_notice && (
            <div className="p-3 rounded-lg bg-muted-indigo/10 border border-muted-indigo/20">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Content Notice:</strong>{" "}
                {museum.safety_notice}
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Mobile preview simulation
      </p>
    </div>
  );
}
