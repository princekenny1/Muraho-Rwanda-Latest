import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ContentAccessProvider } from "@/hooks/useContentAccess";
import {
  ProtectedRoute,
  AdminRoute,
  EditorRoute,
  AgencyRoute,
} from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TestimonyViewer from "./pages/TestimonyViewer";
import TestimoniesHub from "./pages/TestimoniesHub";
import DocumentaryPage from "./pages/DocumentaryPage";
import DocumentariesHub from "./pages/DocumentariesHub";
import ExhibitionPanel from "./pages/ExhibitionPanel";
import LocationPage from "./pages/LocationPage";
import AdminDashboard from "./pages/AdminDashboard";
import VRAdmin from "./pages/VRAdmin";
import TestimonyAdmin from "./pages/TestimonyAdmin";
import DocumentaryAdmin from "./pages/DocumentaryAdmin";
import ExhibitionAdmin from "./pages/ExhibitionAdmin";
import AgencyAdmin from "./pages/AgencyAdmin";
import RouteAdmin from "./pages/RouteAdmin";
import RouteBuilder from "./pages/RouteBuilder";
import RouteViewer from "./pages/RouteViewer";
import MuseumAdmin from "./pages/MuseumAdmin";
import MuseumBuilder from "./pages/MuseumBuilder";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RedeemCodePage from "./pages/RedeemCodePage";
import AskRwandaPage from "./pages/AskRwandaPage";
import AccessOptionsPage from "./pages/AccessOptionsPage";
import AIAdmin from "./pages/AIAdmin";
import MonitoringDashboard from "./pages/admin/MonitoringDashboard";
import ContentCMS from "./pages/ContentCMS";
import MapControlPanel from "./pages/MapControlPanel";
import Home from "./pages/Home";
import { StoryDetail } from "./pages/StoryDetail";
import { StoryViewer } from "./pages/StoryViewer";
import { ThemeDetail } from "./pages/ThemeDetail";
import { ThemesHub } from "./pages/ThemesHub";
import { MemorialsHub } from "./pages/MemorialsHub";
import { MuseumGuide } from "./pages/MuseumGuide";
import { FullMap } from "./pages/FullMap";
import { Onboarding } from "./pages/Onboarding";
import { RoutePage } from "./pages/RoutePage";
import { RoutesHub } from "./pages/RoutesHub";
import { AskRwanda } from "./pages/AskRwanda";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import SearchResultsPage from "./pages/SearchResultsPage";
import {
  AgencyAuthPage,
  AgencyDashboard,
  AgencyGenerateCodes,
  AgencyPricing,
  AgencyAnalytics,
  AgencyCodesList,
} from "./pages/agency";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const resolvePayloadAdminOrigin = () => {
  const configured = (import.meta.env.VITE_PAYLOAD_ADMIN_ORIGIN || "")
    .trim()
    .replace(/\/+$/, "");
  if (configured) return configured;

  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return "http://localhost:3000";
  }

  return typeof window !== "undefined" ? window.location.origin : "";
};

function PayloadAdminRedirect() {
  const location = useLocation();

  useEffect(() => {
    const targetOrigin = resolvePayloadAdminOrigin();
    if (!targetOrigin) return;

    const targetUrl = `${targetOrigin}${location.pathname}${location.search}${location.hash}`;
    if (typeof window !== "undefined" && window.location.href !== targetUrl) {
      window.location.replace(targetUrl);
    }
  }, [location]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ContentAccessProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/stories/:slug" element={<StoryDetail />} />
                <Route path="/stories/:slug/view" element={<StoryViewer />} />
                <Route path="/themes" element={<ThemesHub />} />
                <Route path="/themes/:slug" element={<ThemeDetail />} />
                <Route path="/memorials" element={<MemorialsHub />} />
                <Route path="/routes" element={<RoutesHub />} />
                <Route path="/map" element={<FullMap />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/routes/:slug/view" element={<RoutePage />} />
                <Route path="/museum-guide/:slug" element={<MuseumGuide />} />
                <Route path="/ask" element={<AskRwanda />} />
                <Route path="/testimonies" element={<TestimoniesHub />} />
                <Route
                  path="/testimonies/:slug"
                  element={<TestimonyViewer />}
                />
                <Route path="/documentaries" element={<DocumentariesHub />} />
                <Route
                  path="/documentaries/:slug"
                  element={<DocumentaryPage />}
                />
                <Route path="/exhibition" element={<ExhibitionPanel />} />
                <Route
                  path="/exhibition/:panelId"
                  element={<ExhibitionPanel />}
                />
                <Route path="/locations/:slug" element={<LocationPage />} />
                <Route path="/museums/:slug" element={<LocationPage />} />
                <Route path="/routes/:slug" element={<RouteViewer />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signin" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/redeem" element={<RedeemCodePage />} />
                <Route path="/access" element={<AccessOptionsPage />} />
                <Route path="/ask-rwanda" element={<AskRwandaPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />

                {/* Payload admin reserved paths */}
                <Route
                  path="/admin/collections/*"
                  element={<PayloadAdminRedirect />}
                />
                <Route
                  path="/admin/globals/*"
                  element={<PayloadAdminRedirect />}
                />
                <Route
                  path="/admin/versions/*"
                  element={<PayloadAdminRedirect />}
                />
                <Route
                  path="/admin/account/*"
                  element={<PayloadAdminRedirect />}
                />
                <Route
                  path="/admin/login/*"
                  element={<PayloadAdminRedirect />}
                />
                <Route
                  path="/admin/create-first-user/*"
                  element={<PayloadAdminRedirect />}
                />

                {/* Authenticated routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/vr"
                  element={
                    <AdminRoute>
                      <VRAdmin />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/testimonies"
                  element={
                    <EditorRoute>
                      <TestimonyAdmin />
                    </EditorRoute>
                  }
                />
                <Route
                  path="/admin/documentaries"
                  element={
                    <EditorRoute>
                      <DocumentaryAdmin />
                    </EditorRoute>
                  }
                />
                <Route
                  path="/admin/exhibitions"
                  element={
                    <EditorRoute>
                      <ExhibitionAdmin />
                    </EditorRoute>
                  }
                />
                <Route
                  path="/admin/agencies"
                  element={
                    <AdminRoute>
                      <AgencyAdmin />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/ai"
                  element={
                    <AdminRoute>
                      <AIAdmin />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/content"
                  element={
                    <EditorRoute>
                      <ContentCMS />
                    </EditorRoute>
                  }
                />
                <Route
                  path="/admin/map"
                  element={
                    <EditorRoute>
                      <MapControlPanel />
                    </EditorRoute>
                  }
                />
                <Route
                  path="/admin/monitoring"
                  element={
                    <AdminRoute>
                      <MonitoringDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/museums"
                  element={
                    <EditorRoute>
                      <MuseumAdmin />
                    </EditorRoute>
                  }
                />
                <Route
                  path="/admin/museums/:museumId"
                  element={
                    <EditorRoute>
                      <MuseumBuilder />
                    </EditorRoute>
                  }
                />
                <Route
                  path="/admin/routes"
                  element={
                    <EditorRoute>
                      <RouteAdmin />
                    </EditorRoute>
                  }
                />
                <Route
                  path="/admin/routes/:routeId"
                  element={
                    <EditorRoute>
                      <RouteBuilder />
                    </EditorRoute>
                  }
                />

                {/* Agency portal */}
                <Route path="/agency/auth" element={<AgencyAuthPage />} />
                <Route
                  path="/agency"
                  element={
                    <AgencyRoute>
                      <AgencyDashboard />
                    </AgencyRoute>
                  }
                />
                <Route
                  path="/agency/codes"
                  element={
                    <AgencyRoute>
                      <AgencyCodesList />
                    </AgencyRoute>
                  }
                />
                <Route
                  path="/agency/codes/new"
                  element={
                    <AgencyRoute>
                      <AgencyGenerateCodes />
                    </AgencyRoute>
                  }
                />
                <Route
                  path="/agency/pricing"
                  element={
                    <AgencyRoute>
                      <AgencyPricing />
                    </AgencyRoute>
                  }
                />
                <Route
                  path="/agency/analytics"
                  element={
                    <AgencyRoute>
                      <AgencyAnalytics />
                    </AgencyRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </ContentAccessProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
