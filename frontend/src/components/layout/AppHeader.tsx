import {
  Search,
  Bell,
  Shield,
  Moon,
  Sun,
  User,
  Users,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AppIcon } from "@/components/brand";

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
}

const roleBadgeConfig: Record<
  AppRole,
  { icon: typeof Shield; label: string; className: string; link?: string }
> = {
  admin: {
    icon: Shield,
    label: "Admin",
    className: "bg-amber/20 text-amber border-amber/50 hover:bg-amber/30",
    link: "/admin",
  },
  moderator: {
    icon: Users,
    label: "Moderator",
    className:
      "bg-sky-500/20 text-sky-400 border-sky-500/50 hover:bg-sky-500/30",
    link: "/admin",
  },
  user: {
    icon: User,
    label: "Member",
    className:
      "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30",
  },
};

export function AppHeader({
  title = "Muraho Rwanda",
  showSearch = true,
}: AppHeaderProps) {
  const { user, roles, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Get the highest priority role to display
  const displayRole = roles.includes("admin")
    ? "admin"
    : roles.includes("moderator")
      ? "moderator"
      : roles.length > 0
        ? "user"
        : null;

  const badgeConfig = displayRole ? roleBadgeConfig[displayRole] : null;

  const handleSignOut = () => {
    signOut(); // Performs hard redirect to "/" and clears all state
  };

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-midnight text-white z-40 safe-area-pt">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 page-content-narrow">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <AppIcon size="sm" />
            <span className="font-serif text-lg font-semibold tracking-tight sr-only sm:not-sr-only">
              {title}
            </span>
          </Link>

          {/* Role Badge */}
          {!loading &&
            user &&
            badgeConfig &&
            (badgeConfig.link ? (
              <Link to={badgeConfig.link}>
                <Badge
                  variant="outline"
                  className={`${badgeConfig.className} transition-colors flex items-center gap-1 text-xs`}
                >
                  <badgeConfig.icon className="w-3 h-3" />
                  {badgeConfig.label}
                </Badge>
              </Link>
            ) : (
              <Badge
                variant="outline"
                className={`${badgeConfig.className} transition-colors flex items-center gap-1 text-xs`}
              >
                <badgeConfig.icon className="w-3 h-3" />
                {badgeConfig.label}
              </Badge>
            ))}
        </div>

        <div className="flex items-center gap-1">
          {showSearch && (
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber rounded-full" />
          </button>

          {/* User Menu */}
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-muted-indigo text-white text-xs">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-card border-border z-50"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center cursor-pointer"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                {roles.includes("admin") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="flex items-center cursor-pointer"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !loading ? (
            <Link
              to="/auth"
              className="text-sm font-medium hover:text-amber transition-colors px-2"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
