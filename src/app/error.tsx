'use client';

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Something went wrong!
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => reset()}
            variant="outline"
            className="min-w-[140px]"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/admin/users'}
            className="min-w-[140px]"
          >
            Go to Dashboard
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Error Reference: {error.digest}
          </p>
        </div>
      </div>
    </div>
  );
} 