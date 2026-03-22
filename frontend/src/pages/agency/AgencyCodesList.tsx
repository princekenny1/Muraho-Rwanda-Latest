import { useState } from "react";
import { Link } from "react-router-dom";
import { useAgencyPortal, AgencyCode } from "@/hooks/useAgency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  QrCode, 
  Copy, 
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Users
} from "lucide-react";

export default function AgencyCodesList() {
  const { codes, deactivateCode } = useAgencyPortal();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCode, setSelectedCode] = useState<AgencyCode | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const filteredCodes = codes.filter(
    (code) =>
      code.code.toLowerCase().includes(search.toLowerCase()) ||
      code.group_name?.toLowerCase().includes(search.toLowerCase()) ||
      code.name?.toLowerCase().includes(search.toLowerCase())
  );

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Code copied to clipboard" });
  };

  const downloadQR = (code: string, groupName: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
      `${window.location.origin}/redeem?code=${code}`
    )}`;
    
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `muraho-${groupName || code}.png`;
    link.click();
  };

  const handleDeactivate = async () => {
    if (!selectedCode) return;
    
    const result = await deactivateCode(selectedCode.id);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Code Deactivated",
        description: "The access code has been deactivated.",
      });
    }
    setShowDeactivateDialog(false);
    setSelectedCode(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/agency">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Access Codes</h1>
              <p className="text-muted-foreground">
                Manage all your generated access codes
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/agency/codes/new">
              <Plus className="h-4 w-4 mr-2" />
              Generate New
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or group name..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Codes List */}
        {filteredCodes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {search ? "No codes match your search" : "No access codes generated yet"}
              </p>
              <Button asChild className="mt-4">
                <Link to="/agency/codes/new">Generate Your First Code</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredCodes.map((code) => {
              const isActive =
                code.is_active &&
                (!code.expires_at || new Date(code.expires_at) > new Date());
              const usagePercent = Math.round(
                (code.uses_count / code.max_uses) * 100
              );
              const expiresDate = code.expires_at
                ? new Date(code.expires_at)
                : null;

              return (
                <Card key={code.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">
                            {code.group_name || code.name || "Unnamed Group"}
                          </h3>
                          {isActive ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-500/10 text-green-600"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Expired</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-mono font-medium">{code.code}</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {code.uses_count}/{code.max_uses} ({usagePercent}%)
                          </span>
                          {expiresDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {expiresDate > new Date()
                                ? `Expires ${expiresDate.toLocaleDateString()}`
                                : `Expired ${expiresDate.toLocaleDateString()}`}
                            </span>
                          )}
                        </div>

                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {code.access_level.replace("_", " ")} Access
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyCode(code.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            downloadQR(code.code, code.group_name || code.code)
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedCode(code);
                              setShowDeactivateDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Deactivate Dialog */}
        <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate Access Code?</DialogTitle>
              <DialogDescription>
                This will immediately revoke access for anyone using code{" "}
                <span className="font-mono font-medium">
                  {selectedCode?.code}
                </span>
                . This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeactivateDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeactivate}>
                Deactivate Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
