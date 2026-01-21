import { Loader2 } from "lucide-react";

export default function CallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  );
}
