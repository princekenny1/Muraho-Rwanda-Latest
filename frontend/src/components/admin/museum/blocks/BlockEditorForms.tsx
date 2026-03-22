import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlockType } from "./BlockTypeMenu";

interface BlockContent {
  text?: string;
  heading?: string;
  url?: string;
  alt?: string;
  caption?: string;
  author?: string;
  source?: string;
  title?: string;
}

interface BlockEditorFormProps {
  type: BlockType;
  content: BlockContent;
  onChange: (content: BlockContent) => void;
}

export function BlockEditorForm({ type, content, onChange }: BlockEditorFormProps) {
  switch (type) {
    case "text":
      return <TextBlockForm content={content} onChange={onChange} />;
    case "image":
      return <ImageBlockForm content={content} onChange={onChange} />;
    case "video":
      return <VideoBlockForm content={content} onChange={onChange} />;
    case "audio":
      return <AudioBlockForm content={content} onChange={onChange} />;
    case "quote":
      return <QuoteBlockForm content={content} onChange={onChange} />;
    default:
      return <TextBlockForm content={content} onChange={onChange} />;
  }
}

function TextBlockForm({ content, onChange }: Omit<BlockEditorFormProps, "type">) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="heading">Heading (optional)</Label>
        <Input
          id="heading"
          value={content.heading || ""}
          onChange={(e) => onChange({ ...content, heading: e.target.value })}
          placeholder="Section heading..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="text">Content *</Label>
        <Textarea
          id="text"
          value={content.text || ""}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          placeholder="Enter text content..."
          rows={6}
        />
      </div>
    </div>
  );
}

function ImageBlockForm({ content, onChange }: Omit<BlockEditorFormProps, "type">) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Image URL *</Label>
        <Input
          id="url"
          value={content.url || ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      {content.url && (
        <div className="rounded-lg border overflow-hidden bg-muted">
          <img
            src={content.url}
            alt={content.alt || "Preview"}
            className="max-h-48 w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="alt">Alt Text</Label>
        <Input
          id="alt"
          value={content.alt || ""}
          onChange={(e) => onChange({ ...content, alt: e.target.value })}
          placeholder="Describe the image..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          value={content.caption || ""}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="Image caption..."
          rows={2}
        />
      </div>
    </div>
  );
}

function VideoBlockForm({ content, onChange }: Omit<BlockEditorFormProps, "type">) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Video URL *</Label>
        <Input
          id="url"
          value={content.url || ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://... (YouTube, Vimeo, or direct URL)"
        />
        <p className="text-xs text-muted-foreground">
          Supports YouTube, Vimeo, or direct video URLs
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={content.title || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Video title..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="caption">Description</Label>
        <Textarea
          id="caption"
          value={content.caption || ""}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="Video description..."
          rows={2}
        />
      </div>
    </div>
  );
}

function AudioBlockForm({ content, onChange }: Omit<BlockEditorFormProps, "type">) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Audio URL *</Label>
        <Input
          id="url"
          value={content.url || ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={content.title || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Audio clip title..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="caption">Description</Label>
        <Textarea
          id="caption"
          value={content.caption || ""}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="Audio description..."
          rows={2}
        />
      </div>
    </div>
  );
}

function QuoteBlockForm({ content, onChange }: Omit<BlockEditorFormProps, "type">) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text">Quote Text *</Label>
        <Textarea
          id="text"
          value={content.text || ""}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          placeholder="Enter the quote..."
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">Attribution / Speaker</Label>
        <Input
          id="author"
          value={content.author || ""}
          onChange={(e) => onChange({ ...content, author: e.target.value })}
          placeholder="Who said this..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          value={content.source || ""}
          onChange={(e) => onChange({ ...content, source: e.target.value })}
          placeholder="Where this quote is from..."
        />
      </div>
    </div>
  );
}

// Preview components for blocks in the list
export function BlockPreview({ type, content }: { type: string; content: BlockContent }) {
  switch (type) {
    case "text":
      return (
        <div className="text-sm">
          {content.heading && <p className="font-medium">{content.heading}</p>}
          <p className="text-muted-foreground line-clamp-2">{content.text || "No content"}</p>
        </div>
      );
    case "image":
      return (
        <div className="flex items-center gap-3">
          {content.url && (
            <img
              src={content.url}
              alt={content.alt || ""}
              className="w-12 h-12 object-cover rounded"
            />
          )}
          <div className="text-sm">
            <p className="text-muted-foreground line-clamp-1">
              {content.caption || content.alt || content.url || "No image"}
            </p>
          </div>
        </div>
      );
    case "video":
      return (
        <div className="text-sm">
          <p className="font-medium">{content.title || "Video"}</p>
          <p className="text-muted-foreground line-clamp-1">{content.url || "No URL"}</p>
        </div>
      );
    case "audio":
      return (
        <div className="text-sm">
          <p className="font-medium">{content.title || "Audio"}</p>
          <p className="text-muted-foreground line-clamp-1">{content.caption || "Audio clip"}</p>
        </div>
      );
    case "quote":
      return (
        <div className="text-sm">
          <p className="text-muted-foreground line-clamp-2 italic">"{content.text || "No quote"}"</p>
          {content.author && <p className="text-xs mt-1">— {content.author}</p>}
        </div>
      );
    default:
      return <p className="text-sm text-muted-foreground">Unknown block type</p>;
  }
}
