import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAgencyPortal } from "@/hooks/useAgency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  QrCode, 
  Download, 
  Copy, 
  CheckCircle2,
  Clock,
  Users,
  Shield
} from "lucide-react";

export default function AgencyGenerateCodes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { agency, generateCode, stats } = useAgencyPortal();
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    groupName: "",
    accessLevel: "full",
    maxUses: "50",
    validHours: "48",
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agency || agency.verification_status !== "verified") {
      toast({
        title: "Not Available",
        description: "Code generation requires a verified agency account.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await generateCode({
        groupName: formData.groupName,
        accessLevel: formData.accessLevel,
        maxUses: parseInt(formData.maxUses),
        validHours: parseInt(formData.validHours),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setGeneratedCode(result.data?.code || null);
      toast({
        title: "Code Generated!",
        description: `Access code ${result.data?.code} is now ready to share.`,
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate access code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Code copied to clipboard" });
    }
  };

  const downloadQR = () => {
    // Generate QR code download
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
      `${window.location.origin}/redeem?code=${generatedCode}`
    )}`;
    
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `muraho-access-${generatedCode}.png`;
    link.click();
  };

  const generateAnother = () => {
    setGeneratedCode(null);
    setFormData({
      groupName: "",
      accessLevel: "full",
      maxUses: "50",
      validHours: "48",
    });
  };

  if (generatedCode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        <div className="max-w-lg mx-auto space-y-6">
          <Button variant="ghost" onClick={generateAnother}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Generate Another
          </Button>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-800 dark:text-green-200">
                Access Code Generated!
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                {formData.groupName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Code Display */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-4 rounded-lg bg-background border-2 border-dashed">
                  <span className="text-3xl font-mono font-bold tracking-wider">
                    {generatedCode}
                  </span>
                  <Button variant="ghost" size="icon" onClick={copyCode}>
                    {copied ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `${window.location.origin}/redeem?code=${generatedCode}`
                  )}`}
                  alt="QR Code"
                  className="mx-auto rounded-lg border"
                />
              </div>

              {/* Code Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Up to {formData.maxUses} people</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Valid for {formData.validHours} hours</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{formData.accessLevel.replace("_", " ")} Access</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button onClick={downloadQR} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
                <Button variant="outline" onClick={copyCode} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </div>

              {/* Share Instructions */}
              <div className="p-4 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-2">How to share with your group:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Print QR posters for easy group scanning</li>
                  <li>Share the code via messaging apps</li>
                  <li>Tourists enter at muraho.app/redeem</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/agency">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Create Access Group</CardTitle>
                <CardDescription>Generate codes for your tour group</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="e.g., January Gorilla Trek"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A descriptive name to identify this group
                </p>
              </div>

              {/* Access Level */}
              <div className="space-y-3">
                <Label>Access Level</Label>
                <RadioGroup
                  value={formData.accessLevel}
                  onValueChange={(v) => setFormData({ ...formData, accessLevel: v })}
                  className="grid gap-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="flex-1 cursor-pointer">
                      <span className="font-medium">Full Access</span>
                      <p className="text-xs text-muted-foreground">
                        Stories, museums, testimonies, routes, and all premium content
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="museums_only" id="museums" />
                    <Label htmlFor="museums" className="flex-1 cursor-pointer">
                      <span className="font-medium">Museums Only</span>
                      <p className="text-xs text-muted-foreground">
                        Museum guides, VR tours, and exhibitions
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="stories_only" id="stories" />
                    <Label htmlFor="stories" className="flex-1 cursor-pointer">
                      <span className="font-medium">Stories Only</span>
                      <p className="text-xs text-muted-foreground">
                        Documentaries, testimonies, and audio stories
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="max-uses">Number of People</Label>
                <Select
                  value={formData.maxUses}
                  onValueChange={(v) => setFormData({ ...formData, maxUses: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 people</SelectItem>
                    <SelectItem value="25">25 people</SelectItem>
                    <SelectItem value="50">50 people</SelectItem>
                    <SelectItem value="100">100 people</SelectItem>
                    <SelectItem value="200">200 people</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Validity */}
              <div className="space-y-2">
                <Label htmlFor="valid-hours">Access Duration</Label>
                <Select
                  value={formData.validHours}
                  onValueChange={(v) => setFormData({ ...formData, validHours: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours (3 days)</SelectItem>
                    <SelectItem value="168">168 hours (7 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || agency?.verification_status !== "verified"}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate Access Code
                  </>
                )}
              </Button>

              {agency?.verification_status !== "verified" && (
                <p className="text-center text-sm text-amber-600">
                  Code generation available after agency verification
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
