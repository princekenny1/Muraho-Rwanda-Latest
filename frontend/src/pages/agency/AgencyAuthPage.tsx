import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/client";
import { Building2, Mail, Phone, MapPin, Shield, Loader2, User } from "lucide-react";
import { BrandLogo } from "@/components/brand";
import { AgencyLogoUpload } from "@/components/agency/AgencyLogoUpload";

export default function AgencyAuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupData, setSignupData] = useState({
    agencyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
    region: "",
    logoUrl: "",
    isLicensed: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.login(loginEmail, loginPassword);

      // Check if user has an agency
      let agency: any = null;
      try {
        const agencyRes = await api.find("tour-agencies", {
          where: { adminUser: { equals: data.user.id } },
          limit: 1,
        });
        agency = agencyRes.docs[0] || null;
      } catch {}

      if (!agency) {
        await api.logout();
        toast({
          title: "Access Denied",
          description: "No agency account found for this email. Please sign up as a new agency.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (agency.verification_status === "pending") {
        toast({
          title: "Verification Pending",
          description: "Your agency account is awaiting verification. We'll notify you once approved.",
        });
      }

      navigate("/agency");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (!signupData.isLicensed) {
      toast({
        title: "License Required",
        description: "Please confirm you are a licensed tour operator.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create user account via Payload
      const authData = await api.register(signupData.email, signupData.password, signupData.contactName || signupData.agencyName);

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Create agency record
      const slug = signupData.agencyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await api.create("tour-agencies", {
        name: signupData.agencyName,
        slug: `${slug}-${Date.now().toString(36)}`,
        contactEmail: signupData.email,
        contactPhone: signupData.phone || null,
        adminUser: authData.user.id,
        country: signupData.country || null,
        region: signupData.region || null,
        logoUrl: signupData.logoUrl || null,
        verificationStatus: "pending",
      });

      // Role assignment handled via Payload user.roles field
      try {
        await api.update("users", authData.user.id, {
          roles: ["agency_admin"],
        });
      } catch (roleErr) {
        console.error("Role assignment error:", roleErr);
      }

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account. We'll review your agency registration shortly.",
      });

      setActiveTab("login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create agency account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <BrandLogo size="md" />
          </div>
          <CardTitle className="text-2xl">Agency Portal</CardTitle>
          <CardDescription>
            Manage tour group access for your travelers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Register Agency</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="agency@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Logo Upload */}
                <div className="flex items-start gap-4">
                  <AgencyLogoUpload
                    value={signupData.logoUrl}
                    onChange={(url) => setSignupData({ ...signupData, logoUrl: url })}
                    disabled={loading}
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="agency-name">Agency Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="agency-name"
                        placeholder="Safari Rwanda Tours"
                        className="pl-10"
                        value={signupData.agencyName}
                        onChange={(e) => setSignupData({ ...signupData, agencyName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-person">Contact Person *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact-person"
                      placeholder="John Doe"
                      className="pl-10"
                      value={signupData.contactPerson}
                      onChange={(e) => setSignupData({ ...signupData, contactPerson: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@agency.com"
                        className="pl-10"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+250 7XX XXX XXX"
                        className="pl-10"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="country"
                        placeholder="Rwanda"
                        className="pl-10"
                        value={signupData.country}
                        onChange={(e) => setSignupData({ ...signupData, country: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      placeholder="Kigali"
                      value={signupData.region}
                      onChange={(e) => setSignupData({ ...signupData, region: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="licensed"
                    checked={signupData.isLicensed}
                    onCheckedChange={(checked) => 
                      setSignupData({ ...signupData, isLicensed: checked as boolean })
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="licensed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4 text-primary" />
                      I am a licensed tour operator
                    </label>
                    <p className="text-xs text-muted-foreground">
                      We may request proof of license during verification
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Agency Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
