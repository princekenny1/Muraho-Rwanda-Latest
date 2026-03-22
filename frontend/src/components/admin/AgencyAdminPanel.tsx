import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAgencies, useAgencyMutations, Agency } from "@/hooks/useAgency";
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AgencyAdminPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: agencies, isLoading } = useAgencies();
  const { verifyAgency: verifyMutation, toggleActive: toggleActiveMutation } = useAgencyMutations();

  const pendingAgencies = agencies?.filter((a) => a.verification_status === "pending") || [];
  const verifiedAgencies = agencies?.filter((a) => a.verification_status === "verified") || [];
  const rejectedAgencies = agencies?.filter((a) => a.verification_status === "rejected") || [];

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === "pending") {
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
    if (status === "rejected") {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
    }
    if (!isActive) {
      return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" /> Inactive</Badge>;
    }
    return <Badge className="bg-primary/10 text-primary border-primary/30"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading agencies...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">{pendingAgencies.length}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{verifiedAgencies.length}</div>
            <p className="text-sm text-muted-foreground">Verified Agencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{rejectedAgencies.length}</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingAgencies.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({verifiedAgencies.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedAgencies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingAgencies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending agency registrations
              </CardContent>
            </Card>
          ) : (
            pendingAgencies.map((agency) => (
              <AgencyCard
                key={agency.id}
                agency={agency}
                getStatusBadge={getStatusBadge}
                onVerify={() => verifyMutation.mutate({ agencyId: agency.id, status: "verified" })}
                onReject={() => verifyMutation.mutate({ agencyId: agency.id, status: "rejected" })}
                isPending
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4 mt-4">
          {verifiedAgencies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No verified agencies yet
              </CardContent>
            </Card>
          ) : (
            verifiedAgencies.map((agency) => (
              <AgencyCard
                key={agency.id}
                agency={agency}
                getStatusBadge={getStatusBadge}
                onToggleActive={() => toggleActiveMutation.mutate({ agencyId: agency.id, isActive: !agency.is_active })}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {rejectedAgencies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No rejected agencies
              </CardContent>
            </Card>
          ) : (
            rejectedAgencies.map((agency) => (
              <AgencyCard
                key={agency.id}
                agency={agency}
                getStatusBadge={getStatusBadge}
                onVerify={() => verifyMutation.mutate({ agencyId: agency.id, status: "verified" })}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AgencyCardProps {
  agency: Agency;
  getStatusBadge: (status: string, isActive: boolean) => React.ReactNode;
  onVerify?: () => void;
  onReject?: () => void;
  onToggleActive?: () => void;
  isPending?: boolean;
}

function AgencyCard({ agency, getStatusBadge, onVerify, onReject, onToggleActive, isPending }: AgencyCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={agency.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Building2 className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{agency.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{agency.slug}</p>
            </div>
          </div>
          {getStatusBadge(agency.verification_status, agency.is_active)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{agency.contact_email}</span>
          </div>
          {agency.contact_phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{agency.contact_phone}</span>
            </div>
          )}
          {(agency.country || agency.region) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{[agency.region, agency.country].filter(Boolean).join(", ")}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Registered {new Date(agency.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {agency.license_verified && (
          <Badge variant="outline" className="bg-primary/10">
            <CheckCircle className="h-3 w-3 mr-1" /> Licensed Operator
          </Badge>
        )}

        <div className="flex gap-2 pt-2">
          {isPending && (
            <>
              <Button onClick={onVerify} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Agency
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Agency Registration?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reject the registration for "{agency.name}". They will not be able to access the agency portal.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onReject}>Reject</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {!isPending && agency.verification_status === "verified" && onToggleActive && (
            <Button
              variant={agency.is_active ? "outline" : "default"}
              onClick={onToggleActive}
              className="w-full"
            >
              {agency.is_active ? "Deactivate Agency" : "Activate Agency"}
            </Button>
          )}

          {agency.verification_status === "rejected" && onVerify && (
            <Button onClick={onVerify} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Agency
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
