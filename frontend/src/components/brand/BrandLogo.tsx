import murahoLogoFull from "@/assets/muraho-logo-full.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-12",
  md: "h-16",
  lg: "h-24",
  xl: "h-32",
};

export function BrandLogo({ size = "md", className }: BrandLogoProps) {
  return (
    <img
      src={murahoLogoFull}
      alt="Muraho Rwanda"
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  );
}
