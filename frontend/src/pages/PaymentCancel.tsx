import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
          <XCircle className="w-10 h-10 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground">
            No worries — you weren't charged. You can try again anytime or
            explore free content.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/access")}
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/home")}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
