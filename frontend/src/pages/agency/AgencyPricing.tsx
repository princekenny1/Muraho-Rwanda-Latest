import { useState } from "react";
import { Link } from "react-router-dom";
import { useAgencyPricingPlans } from "@/hooks/useAgency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Check, 
  Users, 
  Infinity, 
  Calculator,
  CreditCard,
  Building2,
  Phone
} from "lucide-react";

export default function AgencyPricing() {
  const { plans, loading } = useAgencyPricingPlans();
  const [quantity, setQuantity] = useState(10);

  const perPersonPlan = plans.find((p) => p.plan_type === "per_person");
  const groupPlans = plans.filter((p) => p.plan_type === "group_package");
  const unlimitedPlans = plans.filter((p) => p.plan_type === "unlimited");

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/agency">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground">
              Flexible pricing options for tour agencies of all sizes
            </p>
          </div>
        </div>

        <Tabs defaultValue="pay-per-person" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pay-per-person">Pay-Per-Person</TabsTrigger>
            <TabsTrigger value="group-packages">Group Packages</TabsTrigger>
            <TabsTrigger value="unlimited">Unlimited Pro</TabsTrigger>
          </TabsList>

          {/* Pay-Per-Person */}
          <TabsContent value="pay-per-person" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calculator className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Pay-Per-Person</CardTitle>
                    <CardDescription>
                      Flexible pricing - pay only for what you use
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6">
                  <span className="text-5xl font-bold">
                    {perPersonPlan ? formatPrice(perPersonPlan.price_cents) : "$4"}
                  </span>
                  <span className="text-muted-foreground text-lg"> / tourist</span>
                </div>

                <div className="space-y-3">
                  <Label>Calculate Your Cost</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">tourists</span>
                    <span className="text-2xl font-bold ml-auto">
                      {formatPrice(quantity * (perPersonPlan?.price_cents || 400))}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {[
                    "Full premium content access",
                    "48-hour validity per code",
                    "No minimum purchase",
                    "Perfect for small groups",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase {quantity} Codes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Group Packages */}
          <TabsContent value="group-packages" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupPlans.map((plan) => {
                const perPerson = plan.included_codes
                  ? plan.price_cents / plan.included_codes
                  : 0;
                const savings = perPersonPlan
                  ? Math.round(
                      ((perPersonPlan.price_cents - perPerson) /
                        perPersonPlan.price_cents) *
                        100
                    )
                  : 0;

                return (
                  <Card key={plan.id} className="relative">
                    {savings >= 20 && (
                      <Badge className="absolute -top-2 -right-2 bg-green-600">
                        Save {savings}%
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {plan.included_codes} People
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="text-3xl font-bold">
                          {formatPrice(plan.price_cents)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formatPrice(perPerson)}/person)
                        </span>
                      </div>

                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Up to {plan.included_codes} tourists
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          {plan.validity_days} days validity
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Full content access
                        </li>
                      </ul>

                      <Button className="w-full">Purchase Package</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Custom Group */}
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Need a Custom Package?</p>
                    <p className="text-sm text-muted-foreground">
                      For groups larger than 200 or special requirements
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unlimited Pro */}
          <TabsContent value="unlimited" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {unlimitedPlans.map((plan) => {
                const isYearly = plan.slug.includes("yearly");

                return (
                  <Card
                    key={plan.id}
                    className={isYearly ? "border-primary shadow-lg" : ""}
                  >
                    {isYearly && (
                      <Badge className="absolute -top-2 left-4 bg-primary">
                        Best Value
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Infinity className="h-5 w-5 text-primary" />
                        {plan.name}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="text-4xl font-bold">
                          {formatPrice(plan.price_cents)}
                        </span>
                        <span className="text-muted-foreground">
                          /{isYearly ? "year" : "month"}
                        </span>
                        {isYearly && (
                          <p className="text-sm text-green-600 mt-1">
                            Save {formatPrice(49900 * 12 - plan.price_cents)} vs monthly
                          </p>
                        )}
                      </div>

                      <ul className="space-y-2 text-sm">
                        {[
                          "Unlimited access codes",
                          "All premium content",
                          "Agency branding in app",
                          "Priority support",
                          "Advanced analytics",
                          "White-label options",
                        ].map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={isYearly ? "default" : "outline"}
                      >
                        Subscribe {isYearly ? "Yearly" : "Monthly"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Note */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            <p>
              Secure payments powered by Stripe. We accept all major credit cards,
              bank transfers, and mobile money (Rwanda).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
