import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, AlertCircle } from "lucide-react";

interface QRCodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => void;
}

export function QRCodeScanner({ open, onOpenChange, onScan }: QRCodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    if (!containerRef.current || scannerRef.current) return;
    
    setIsStarting(true);
    setError(null);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Extract code from QR - could be a URL or just the code
          let code = decodedText;
          
          // If it's a URL, try to extract the code param
          try {
            const url = new URL(decodedText);
            const codeParam = url.searchParams.get("code");
            if (codeParam) {
              code = codeParam;
            }
          } catch {
            // Not a URL, use the raw text as the code
          }

          onScan(code.toUpperCase());
          stopScanner();
          onOpenChange(false);
        },
        () => {
          // QR code not found - ignore, keep scanning
        }
      );
      setIsStarting(false);
    } catch (err) {
      setIsStarting(false);
      console.error("QR Scanner error:", err);
      
      if (err instanceof Error) {
        if (err.message.includes("Permission")) {
          setError("Camera permission denied. Please allow camera access to scan QR codes.");
        } else if (err.message.includes("NotFoundError")) {
          setError("No camera found on this device.");
        } else {
          setError("Could not start camera. Please try entering the code manually.");
        }
      } else {
        setError("Could not start camera. Please try entering the code manually.");
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Ignore errors on cleanup
      }
      scannerRef.current = null;
    }
  };

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleClose}
              >
                Enter Code Manually
              </Button>
            </div>
          ) : (
            <>
              <div 
                id="qr-reader" 
                ref={containerRef}
                className="w-full aspect-square rounded-lg overflow-hidden bg-muted"
              />
              
              {isStarting && (
                <p className="text-sm text-center text-muted-foreground">
                  Starting camera...
                </p>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Point your camera at the QR code provided by your tour agency
              </p>
            </>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

