import {
  Type,
  Image,
  Video,
  Volume2,
  Quote,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type BlockType = "text" | "image" | "video" | "audio" | "quote";

interface BlockTypeMenuProps {
  onAddBlock: (type: BlockType) => void;
  disabled?: boolean;
}

const blockTypes: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Text Block", icon: <Type className="h-4 w-4" /> },
  { type: "image", label: "Image Block", icon: <Image className="h-4 w-4" /> },
  { type: "video", label: "Video Block", icon: <Video className="h-4 w-4" /> },
  { type: "audio", label: "Audio Block", icon: <Volume2 className="h-4 w-4" /> },
  { type: "quote", label: "Quote Block", icon: <Quote className="h-4 w-4" /> },
];

export function BlockTypeMenu({ onAddBlock, disabled }: BlockTypeMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Add Block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {blockTypes.map((block) => (
          <DropdownMenuItem
            key={block.type}
            onClick={() => onAddBlock(block.type)}
            className="gap-2"
          >
            {block.icon}
            {block.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getBlockIcon(type: string) {
  switch (type) {
    case "text":
      return <Type className="h-4 w-4" />;
    case "image":
      return <Image className="h-4 w-4" />;
    case "video":
      return <Video className="h-4 w-4" />;
    case "audio":
      return <Volume2 className="h-4 w-4" />;
    case "quote":
      return <Quote className="h-4 w-4" />;
    default:
      return <Type className="h-4 w-4" />;
  }
}

export function getBlockLabel(type: string) {
  switch (type) {
    case "text":
      return "Text";
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    case "quote":
      return "Quote";
    default:
      return type;
  }
}
