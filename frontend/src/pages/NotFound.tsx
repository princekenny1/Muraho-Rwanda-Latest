import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Determine the most relevant listing page based on the attempted path
  const getBrowseAction = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes("testimon")) {
      return { label: "Browse Testimonies", path: "/testimonies" };
    }
    if (path.includes("documentar")) {
      return { label: "Browse Documentaries", path: "/documentaries" };
    }
    if (path.includes("exhibition")) {
      return { label: "View Exhibition", path: "/exhibition" };
    }
    return { label: "Explore Content", path: "/" };
  };

  const browseAction = getBrowseAction();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-3xl font-semibold text-foreground">Page Not Found</h1>
        
        {/* Description */}
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button
            onClick={() => navigate(browseAction.path)}
            className="gap-2"
          >
            {browseAction.label}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
