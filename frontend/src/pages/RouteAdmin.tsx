import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Eye, Trash2, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useRouteAdmin } from "@/hooks/useRouteAdmin";
import { RouteForm } from "@/components/admin/routes/RouteForm";
import type { Route } from "@/types/routes";

export default function RouteAdmin() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { routes, loading, createRoute, deleteRoute, publishRoute, unpublishRoute } = useRouteAdmin();
  
  const [showForm, setShowForm] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You need admin permissions to access this page.</p>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateRoute = async (data: { title: string; slug: string; description?: string }) => {
    const route = await createRoute(data);
    if (route) {
      setShowForm(false);
      navigate(`/admin/routes/${route.id}`);
    }
  };

  const handleDeleteRoute = async () => {
    if (routeToDelete) {
      await deleteRoute(routeToDelete.id);
      setRouteToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-adventure-green text-midnight">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge variant="outline" className="text-adventure-green border-adventure-green">Easy</Badge>;
      case "moderate":
        return <Badge variant="outline" className="text-amber border-amber">Moderate</Badge>;
      case "challenging":
        return <Badge variant="outline" className="text-terracotta border-terracotta">Challenging</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Route Builder</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage routes with stops and content
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Route
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {routes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Routes Yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first route to start building journeys for visitors.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Route
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <Card key={route.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{route.title}</CardTitle>
                        {getStatusBadge(route.status)}
                        {getDifficultyBadge(route.difficulty)}
                      </div>
                      <CardDescription>
                        {route.description || "No description"}
                      </CardDescription>
                    </div>
                    {route.cover_image && (
                      <img 
                        src={route.cover_image} 
                        alt={route.title}
                        className="w-20 h-20 rounded-lg object-cover ml-4"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {route.duration_minutes && (
                        <span>{route.duration_minutes} min</span>
                      )}
                      {route.distance_km && (
                        <span>{route.distance_km} km</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/routes/${route.slug}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/routes/${route.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {route.status === "draft" ? (
                        <Button
                          size="sm"
                          onClick={() => publishRoute(route.id)}
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Publish
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => unpublishRoute(route.id)}
                        >
                          Unpublish
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setRouteToDelete(route)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Route Form */}
      <RouteForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateRoute}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!routeToDelete} onOpenChange={() => setRouteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{routeToDelete?.title}" and all its stops and content.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoute}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
