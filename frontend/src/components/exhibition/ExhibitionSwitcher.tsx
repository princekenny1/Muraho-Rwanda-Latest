import { cn } from "@/lib/utils";

interface Exhibition {
  id: string;
  name: string;
}

interface ExhibitionSwitcherProps {
  exhibitions: Exhibition[];
  currentExhibitionId: string;
  onSwitch: (id: string) => void;
}

export function ExhibitionSwitcher({
  exhibitions,
  currentExhibitionId,
  onSwitch,
}: ExhibitionSwitcherProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      {exhibitions.map((exhibition) => (
        <button
          key={exhibition.id}
          onClick={() => onSwitch(exhibition.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
            currentExhibitionId === exhibition.id
              ? "bg-midnight text-white shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {exhibition.name}
        </button>
      ))}
    </div>
  );
}
