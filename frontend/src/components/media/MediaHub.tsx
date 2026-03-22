import { useState } from "react";
import { Play, Download, Wifi, WifiOff, Clock, Eye, Subtitles, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaTab = "videos" | "audio" | "images";

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  hasCC: boolean;
  isDownloaded: boolean;
}

interface AudioItem {
  id: string;
  title: string;
  duration: string;
  hasTranscript: boolean;
  isDownloaded: boolean;
}

interface ImageItem {
  id: string;
  caption: string;
  thumbnail: string;
  year?: string;
  isThenNow?: boolean;
}

interface MediaHubProps {
  videos: VideoItem[];
  audio: AudioItem[];
  images: ImageItem[];
  onPlayVideo: (videoId: string) => void;
  onPlayAudio: (audioId: string) => void;
  onOpenImage: (imageId: string) => void;
  onDownload: (type: MediaTab, itemId: string) => void;
}

const mockVideos: VideoItem[] = [
  { id: "1", title: "Survivor Testimony: Jean Baptiste", duration: "8:24", thumbnail: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400", hasCC: true, isDownloaded: true },
  { id: "2", title: "Rebuilding Kigali: A City Transformed", duration: "12:05", thumbnail: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400", hasCC: true, isDownloaded: false },
  { id: "3", title: "The Memorial Gardens Today", duration: "5:32", thumbnail: "https://images.unsplash.com/photo-1597911929395-dc94e56f2e52?w=400", hasCC: false, isDownloaded: false },
];

const mockAudio: AudioItem[] = [
  { id: "1", title: "Walking Through History", duration: "15:00", hasTranscript: true, isDownloaded: true },
  { id: "2", title: "Voices of Reconciliation", duration: "22:30", hasTranscript: true, isDownloaded: false },
  { id: "3", title: "The Art of Memory", duration: "18:45", hasTranscript: false, isDownloaded: false },
  { id: "4", title: "Youth Perspectives", duration: "12:15", hasTranscript: true, isDownloaded: false },
];

const mockImages: ImageItem[] = [
  { id: "1", caption: "Kigali Genocide Memorial entrance", thumbnail: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400", year: "2023" },
  { id: "2", caption: "Memorial gardens overview", thumbnail: "https://images.unsplash.com/photo-1597911929395-dc94e56f2e52?w=400", year: "2022", isThenNow: true },
  { id: "3", caption: "Name wall at the memorial", thumbnail: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400", year: "2023" },
  { id: "4", caption: "Reflection pool", thumbnail: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400", year: "2021", isThenNow: true },
  { id: "5", caption: "Eternal flame", thumbnail: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400", year: "2023" },
  { id: "6", caption: "Memorial wall inscriptions", thumbnail: "https://images.unsplash.com/photo-1597911929395-dc94e56f2e52?w=400", year: "2022" },
];

export function MediaHub({
  videos = mockVideos,
  audio = mockAudio,
  images = mockImages,
  onPlayVideo,
  onPlayAudio,
  onOpenImage,
  onDownload,
}: MediaHubProps) {
  const [activeTab, setActiveTab] = useState<MediaTab>("videos");
  const [selectedForDownload, setSelectedForDownload] = useState<string[]>([]);
  const [isDownloadMode, setIsDownloadMode] = useState(false);

  const tabs: { id: MediaTab; label: string; count: number }[] = [
    { id: "videos", label: "Videos", count: videos.length },
    { id: "audio", label: "Audio", count: audio.length },
    { id: "images", label: "Images", count: images.length },
  ];

  const toggleDownloadSelection = (itemId: string) => {
    setSelectedForDownload(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header with tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                activeTab === tab.id 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <span className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded-full text-xs",
                activeTab === tab.id ? "bg-amber text-midnight" : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Download mode toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-sm text-muted-foreground">
          {isDownloadMode && selectedForDownload.length > 0 
            ? `${selectedForDownload.length} selected`
            : "Tap to play"
          }
        </span>
        <button
          onClick={() => {
            setIsDownloadMode(!isDownloadMode);
            if (isDownloadMode) setSelectedForDownload([]);
          }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            isDownloadMode 
              ? "bg-amber text-midnight" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          <Download className="w-3.5 h-3.5" />
          {isDownloadMode ? "Done" : "Download"}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Videos tab */}
        {activeTab === "videos" && (
          <div className="space-y-3">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => isDownloadMode ? toggleDownloadSelection(video.id) : onPlayVideo(video.id)}
                className={cn(
                  "w-full flex gap-3 p-2 rounded-xl transition-colors text-left",
                  isDownloadMode && selectedForDownload.includes(video.id)
                    ? "bg-amber/10 ring-2 ring-amber"
                    : "hover:bg-muted/50"
                )}
              >
                {/* Thumbnail */}
                <div className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${video.thumbnail})` }}
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-medium">
                    {video.duration}
                  </div>
                  {!isDownloadMode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-medium text-sm text-foreground line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {video.hasCC && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Subtitles className="w-3 h-3" />
                        CC
                      </span>
                    )}
                    {video.isDownloaded ? (
                      <span className="flex items-center gap-0.5 text-xs text-adventure-green">
                        <Wifi className="w-3 h-3" />
                        Offline
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <WifiOff className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Download indicator */}
                {isDownloadMode && (
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    selectedForDownload.includes(video.id)
                      ? "bg-amber border-amber text-midnight"
                      : "border-muted-foreground"
                  )}>
                    {selectedForDownload.includes(video.id) && (
                      <span className="text-xs font-bold">✓</span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Audio tab */}
        {activeTab === "audio" && (
          <div className="space-y-2">
            {audio.map((item, index) => (
              <button
                key={item.id}
                onClick={() => isDownloadMode ? toggleDownloadSelection(item.id) : onPlayAudio(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                  isDownloadMode && selectedForDownload.includes(item.id)
                    ? "bg-amber/10 ring-2 ring-amber"
                    : "hover:bg-muted/50"
                )}
              >
                {/* Track number */}
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {index + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-foreground truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.duration}
                    </span>
                    {item.hasTranscript && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        Transcript
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {item.isDownloaded ? (
                    <Wifi className="w-4 h-4 text-adventure-green" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  
                  {isDownloadMode ? (
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      selectedForDownload.includes(item.id)
                        ? "bg-amber border-amber text-midnight"
                        : "border-muted-foreground"
                    )}>
                      {selectedForDownload.includes(item.id) && (
                        <span className="text-xs font-bold">✓</span>
                      )}
                    </div>
                  ) : (
                    <Play className="w-5 h-5 text-foreground" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Images tab */}
        {activeTab === "images" && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => onOpenImage(image.id)}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                  style={{ backgroundImage: `url(${image.thumbnail})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Then & Now badge */}
                {image.isThenNow && (
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-amber text-midnight text-xs font-medium rounded">
                    T&N
                  </div>
                )}

                {/* Caption on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs line-clamp-2">{image.caption}</p>
                  {image.year && (
                    <p className="text-white/70 text-xs mt-0.5">{image.year}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Download action bar */}
      {isDownloadMode && selectedForDownload.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <button
            onClick={() => {
              selectedForDownload.forEach(id => onDownload(activeTab, id));
              setSelectedForDownload([]);
              setIsDownloadMode(false);
            }}
            className="w-full h-11 bg-amber text-midnight rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-sunset-gold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download {selectedForDownload.length} items (~{selectedForDownload.length * 12}MB)
          </button>
        </div>
      )}
    </div>
  );
}
