import murahoIcon from "@/assets/muraho-icon.png";
import { cn } from "@/lib/utils";

interface AppIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

export function AppIcon({ size = "md", className }: AppIconProps) {
  return (
    <img
      src={murahoIcon}
      alt="Muraho Rwanda"
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  );
}
