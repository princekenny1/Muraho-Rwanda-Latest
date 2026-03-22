import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  ExhibitionHeader,
  PanelNavigation,
  ExhibitionSwitcher,
  StickyToolbar,
  TextBlock,
  QuoteBlock,
  VideoBlock,
  AudioBlock,
  ContextBlock,
} from "@/components/exhibition";
import {
  useExhibitions,
  useExhibitionPanels,
  usePanelBlocks,
  type PanelBlock,
} from "@/hooks/useExhibitions";

const sources = [
  { title: "Genocide Archive Rwanda", institution: "Kigali Genocide Memorial" },
  { title: "Leave None to Tell the Story", institution: "Human Rights Watch" },
  { title: "UN Security Council Reports", institution: "United Nations" },
  { title: "Oral History Collection", institution: "Aegis Trust" },
];

export function ExhibitionPanel() {
  const { panelId } = useParams();
  const navigate = useNavigate();

  const { data: exhibitions, isLoading: loadingExhibitions } = useExhibitions();
  
  const [currentExhibitionId, setCurrentExhibitionId] = useState<string | null>(null);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [isSaved, setIsSaved] = useState(false);
  const [showSources, setShowSources] = useState(false);

  // Set first exhibition as default when data loads
  useEffect(() => {
    if (exhibitions && exhibitions.length > 0 && !currentExhibitionId) {
      setCurrentExhibitionId(exhibitions[0].id);
    }
  }, [exhibitions, currentExhibitionId]);

  const { data: panels, isLoading: loadingPanels } = useExhibitionPanels(currentExhibitionId || undefined);

  // Set panel index from URL param
  useEffect(() => {
    if (panelId && panels && panels.length > 0) {
      const idx = parseInt(panelId) - 1;
      if (idx >= 0 && idx < panels.length) {
        setCurrentPanelIndex(idx);
      }
    }
  }, [panelId, panels]);

  const currentPanel = panels?.[currentPanelIndex];
  const prevPanel = panels?.[currentPanelIndex - 1];
  const nextPanel = panels?.[currentPanelIndex + 1];

  const { data: blocks, isLoading: loadingBlocks } = usePanelBlocks(currentPanel?.id);

  const exhibitionOptions = useMemo(() => {
    return (exhibitions || []).map(ex => ({
      id: ex.id,
      name: ex.title,
    }));
  }, [exhibitions]);

  const handleExhibitionSwitch = (exhibitionId: string) => {
    setCurrentExhibitionId(exhibitionId);
    setCurrentPanelIndex(0);
    setActiveBlockId(null);
  };

  const handlePrevious = () => {
    if (currentPanelIndex > 0) {
      setCurrentPanelIndex(currentPanelIndex - 1);
      setActiveBlockId(null);
    }
  };

  const handleNext = () => {
    if (panels && currentPanelIndex < panels.length - 1) {
      setCurrentPanelIndex(currentPanelIndex + 1);
      setActiveBlockId(null);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Saved to your collection");
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: currentPanel?.title || "Exhibition",
        text: `Exhibition: ${currentPanel?.title}`,
        url: window.location.href,
      });
    } catch {
      toast.success("Link copied to clipboard");
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderBlock = (block: PanelBlock) => {
    const isActive = activeBlockId === block.id;
    const content = block.content as Record<string, unknown>;

    switch (block.block_type) {
      case "text":
        return (
          <TextBlock
            key={block.id}
            content={content.body as string || ""}
            isActive={isActive}
            onClick={() => setActiveBlockId(block.id)}
            fontSize={fontSize}
          />
        );
      case "quote":
        return (
          <QuoteBlock
            key={block.id}
            quote={content.text as string || ""}
            attribution={content.attribution as string}
            year={content.year as string}
            isActive={isActive}
            onClick={() => setActiveBlockId(block.id)}
            fontSize={fontSize}
          />
        );
      case "video":
        return (
          <VideoBlock
            key={block.id}
            title={content.title as string || "Video"}
            duration={formatDuration((content.duration as number) || 0)}
            thumbnailUrl={content.posterUrl as string}
            hasClosedCaptions={(content.hasClosedCaptions as boolean) || false}
            isActive={isActive}
            onClick={() => setActiveBlockId(block.id)}
          />
        );
      case "audio":
        return (
          <AudioBlock
            key={block.id}
            title={content.title as string || "Audio"}
            speaker={content.speaker as string}
            duration={formatDuration((content.duration as number) || 0)}
            isActive={isActive}
            onClick={() => setActiveBlockId(block.id)}
          />
        );
      case "context":
        return (
          <ContextBlock
            key={block.id}
            title={content.title as string || ""}
            content={content.body as string || ""}
            learnMoreUrl={content.linkUrl as string}
            isActive={isActive}
            onClick={() => setActiveBlockId(block.id)}
            fontSize={fontSize}
          />
        );
      default:
        return null;
    }
  };

  const isLoading = loadingExhibitions || loadingPanels;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading exhibition...</p>
        </div>
      </div>
    );
  }

  if (!exhibitions || exhibitions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No exhibitions available</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!currentPanel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No panels in this exhibition</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground truncate">Exhibition</h1>
        </div>

        {/* Exhibition Switcher */}
        <div className="px-4 pb-3">
          <ExhibitionSwitcher
            exhibitions={exhibitionOptions}
            currentExhibitionId={currentExhibitionId || ""}
            onSwitch={handleExhibitionSwitch}
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-screen">
        <div className="pt-32 pb-8 px-4 space-y-6">
          {/* Panel Header */}
          <ExhibitionHeader
            title={currentPanel.title}
            sectionLabel={currentPanel.section_label || undefined}
            duration={`${currentPanel.duration_minutes} min`}
            panelNumber={currentPanelIndex + 1}
            totalPanels={panels?.length || 0}
          />

          {/* Content Blocks */}
          <div className="space-y-4">
            {loadingBlocks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : blocks && blocks.length > 0 ? (
              blocks.map(renderBlock)
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No content available for this panel
              </p>
            )}
          </div>

          {/* Panel Navigation */}
          <div className="pt-4">
            <PanelNavigation
              currentPanel={currentPanelIndex + 1}
              totalPanels={panels?.length || 0}
              onPrevious={handlePrevious}
              onNext={handleNext}
              prevTitle={prevPanel?.title}
              nextTitle={nextPanel?.title}
            />
          </div>
        </div>
      </ScrollArea>

      {/* Sticky Toolbar */}
      <StickyToolbar
        onSourcesClick={() => setShowSources(true)}
        onSaveClick={handleSave}
        onShareClick={handleShare}
        onFontSizeChange={setFontSize}
        currentFontSize={fontSize}
        isSaved={isSaved}
      />

      {/* Sources Sheet */}
      <Sheet open={showSources} onOpenChange={setShowSources}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Sources & Citations</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full pb-8">
            <div className="space-y-4">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <p className="font-medium text-foreground">{source.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {source.institution}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ExhibitionPanel;
