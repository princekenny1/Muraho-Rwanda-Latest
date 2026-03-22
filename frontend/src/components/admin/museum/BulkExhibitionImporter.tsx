import { useState, useCallback } from "react";
import {
  Upload,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/client";

interface BulkExhibitionImporterProps {
  museumId: string;
  rooms: Array<{ id: string; name: string }>;
  onImportComplete: () => void;
}

interface ImportResults {
  rooms_created: number;
  panels_created: number;
  blocks_created: number;
  images_uploaded: number;
  errors: string[];
}

export function BulkExhibitionImporter({
  museumId,
  rooms,
  onImportComplete,
}: BulkExhibitionImporterProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [targetRoom, setTargetRoom] = useState<string>("new");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile.name.endsWith(".zip")) {
          setFile(droppedFile);
          setResults(null);
        } else {
          toast({
            title: "Invalid file",
            description: "Please upload a ZIP file",
            variant: "destructive",
          });
        }
      }
    },
    [toast],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.name.endsWith(".zip")) {
        setFile(selected);
        setResults(null);
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload a ZIP file",
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(10);
    setResults(null);

    try {
      setProgress(20);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("museum_id", museumId);
      if (targetRoom !== "new") {
        formData.append("room_id", targetRoom);
      }

      setProgress(30);

      // Call Payload custom endpoint for bulk import
      const res = await fetch(`${api.baseURL}/import-exhibition`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      setProgress(90);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Import failed");
      }

      const data = await res.json();

      setResults(data as ImportResults);
      setProgress(100);

      if (data.errors?.length === 0) {
        toast({
          title: "Import successful",
          description: `Created ${data.rooms_created} rooms, ${data.panels_created} panels, ${data.blocks_created} blocks`,
        });
        onImportComplete();
      } else {
        toast({
          title: "Import completed with warnings",
          description: `${data.errors.length} issues encountered`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
      setResults({
        rooms_created: 0,
        panels_created: 0,
        blocks_created: 0,
        images_uploaded: 0,
        errors: [error.message || "Unknown error"],
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = {
      version: "1.0",
      metadata: {
        description: "Exhibition import manifest template",
        supported_block_types: [
          "text",
          "image",
          "gallery",
          "quote",
          "video",
          "audio",
          "timeline",
        ],
      },
      rooms: [
        {
          name: "Room 1: Introduction",
          introduction: "Welcome to the exhibition...",
          cover_image: "images/room1-cover.jpg",
          room_type: "indoor",
          panels: [
            {
              title: "Panel 1.1: Overview",
              panel_number: "1.1",
              notes: "Optional internal notes for editors",
              blocks: [
                {
                  type: "text",
                  title: "Welcome",
                  content: "This exhibition explores...",
                },
                {
                  type: "image",
                  image: "images/panel1-image1.jpg",
                  caption: "Historical photograph from 1994",
                  alt_text: "Description for accessibility",
                },
                {
                  type: "quote",
                  content: "We must never forget...",
                  attribution: "Survivor Name",
                  source: "Optional source reference",
                },
              ],
            },
            {
              title: "Panel 1.2: Timeline",
              panel_number: "1.2",
              blocks: [
                {
                  type: "text",
                  content: "The events unfolded over 100 days...",
                },
                {
                  type: "gallery",
                  images: ["images/timeline1.jpg", "images/timeline2.jpg"],
                  caption: "Historical timeline images",
                },
                {
                  type: "video",
                  video_url: "https://example.com/video.mp4",
                  thumbnail: "images/video-thumb.jpg",
                  title: "Documentary excerpt",
                },
                {
                  type: "audio",
                  audio_url: "audio/testimony.mp3",
                  title: "Survivor testimony",
                  duration_seconds: 180,
                },
                {
                  type: "timeline",
                  events: [
                    {
                      year: "1990",
                      title: "Event 1",
                      description: "Description...",
                    },
                    {
                      year: "1994",
                      title: "Event 2",
                      description: "Description...",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "Room 2: Memorial",
          introduction: "This room honors...",
          panels: [],
        },
      ],
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manifest-template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setProgress(0);
    setTargetRoom("new");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Exhibition Import</DialogTitle>
          <DialogDescription>
            Upload a ZIP file containing images and a manifest.json mapping file
            to bulk import exhibition content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template download */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/50">
            <div className="text-sm">
              <p className="font-medium">Need a template?</p>
              <p className="text-muted-foreground">
                Download the manifest.json structure
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          {/* Target room selection */}
          <div className="space-y-2">
            <Label>Import destination</Label>
            <Select value={targetRoom} onValueChange={setTargetRoom}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  Create new rooms from manifest
                </SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Add to: {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drop zone */}
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : file
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={importing}
            />
            <div className="flex flex-col items-center text-center">
              {file ? (
                <>
                  <FileArchive className="h-10 w-10 text-primary mb-2" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {!importing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-medium">Drop ZIP file here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing import...</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {results && (
            <div
              className={`rounded-lg border p-4 ${
                results.errors.length > 0
                  ? "border-destructive bg-destructive/5"
                  : "border-primary bg-primary/5"
              }`}
            >
              <div className="flex items-start gap-3">
                {results.errors.length > 0 ? (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p className="font-medium">
                    {results.errors.length > 0
                      ? "Import completed with issues"
                      : "Import successful"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Rooms created: {results.rooms_created}</div>
                    <div>Panels created: {results.panels_created}</div>
                    <div>Blocks created: {results.blocks_created}</div>
                    <div>Images uploaded: {results.images_uploaded}</div>
                  </div>
                  {results.errors.length > 0 && (
                    <div className="mt-2 max-h-24 overflow-y-auto">
                      <p className="text-sm font-medium text-destructive">
                        Errors:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                        {results.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>• {err}</li>
                        ))}
                        {results.errors.length > 5 && (
                          <li>...and {results.errors.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={importing}
            >
              {results ? "Close" : "Cancel"}
            </Button>
            {!results && (
              <Button onClick={handleImport} disabled={!file || importing}>
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            )}
            {results && <Button onClick={reset}>Import Another</Button>}
          </div>

          {/* Help text */}
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-2">
            <p className="font-medium">ZIP file structure:</p>
            <pre className="bg-background rounded p-2 overflow-x-auto">
              {`my-exhibition.zip/
├── manifest.json
├── images/
│   ├── room1-cover.jpg
│   ├── panel1-image1.jpg
│   └── ...
└── audio/ (optional)
    └── testimony.mp3`}
            </pre>
            <div className="pt-2 border-t border-border">
              <p className="font-medium mb-1">Supported block types:</p>
              <div className="flex flex-wrap gap-1">
                {[
                  "text",
                  "image",
                  "gallery",
                  "quote",
                  "video",
                  "audio",
                  "timeline",
                ].map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 bg-background rounded text-xs"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
