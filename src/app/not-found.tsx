'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8 px-4">
        {/* You can add your own 404 illustration here */}
        <div className="relative w-64 h-64 mx-auto">
          <Image
            src="/404.svg" // Make sure to add this image to your public folder
            alt="404 Illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            404 - Page Not Found
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="min-w-[140px]"
          >
            Go Back
          </Button>
          <Button
            onClick={() => router.push('/admin/users')}
            className="min-w-[140px]"
          >
            Go to Dashboard
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            If you believe this is a mistake, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
} 