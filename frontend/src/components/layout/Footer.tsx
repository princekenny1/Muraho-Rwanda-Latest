import { Home, Route, BookOpen, Building2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "routes", icon: Route, label: "Routes" },
  { id: "themes", icon: BookOpen, label: "Themes" },
  { id: "memorials", icon: Building2, label: "Memorials" },
  { id: "ask", icon: MessageCircle, label: "Ask Rwanda" },
];

export function Footer({ activeTab, onTabChange }: FooterProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Curved top wave SVG - 28px radius */}
      <div className="relative">
        <svg 
          className="absolute -top-5 left-0 right-0 w-full h-6" 
          viewBox="0 0 400 24" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,24 Q80,6 200,14 T400,24 L400,24 L0,24 Z" 
            fill="url(#footerGradient)"
          />
          <defs>
            <linearGradient id="footerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5F0E8" />
              <stop offset="100%" stopColor="#ECE7DF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Main footer background - Sand gradient */}
        <div 
          style={{ 
            background: 'linear-gradient(180deg, #F5F0E8 0%, #ECE7DF 100%)',
            boxShadow: '0px -4px 24px rgba(0, 0, 0, 0.10)',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
          }}
        >
          <div className="flex items-center justify-around min-h-[120px] max-w-lg sm:max-w-xl mx-auto px-2 pt-4 safe-area-bottom">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 py-2",
                    "transition-all duration-[175ms] ease-out",
                    isActive ? "text-midnight" : "text-muted-foreground"
                  )}
                >
                  <div className="relative">
                    {/* Amber glow ring for active state */}
                    {isActive && (
                      <div 
                        className="absolute inset-0 -m-3 rounded-full"
                        style={{ 
                          boxShadow: '0 0 12px 6px rgba(255, 184, 92, 0.45)',
                        }}
                      />
                    )}
                    
                    <item.icon
                      className={cn(
                        "w-7 h-7 transition-all duration-[175ms] ease-out",
                        isActive && "scale-[1.08]"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    {/* Amber dot underneath active icon */}
                    {isActive && (
                      <div 
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: '#FFB85C' }}
                      />
                    )}
                  </div>
                  
                  {/* Labels: Inter 12px, semi-bold */}
                  <span 
                    className={cn(
                      "text-xs mt-2.5 transition-all duration-[175ms]",
                      isActive ? "font-semibold" : "font-medium"
                    )}
                    style={{ 
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '12px',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
