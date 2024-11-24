"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center mx-auto min-h-screen">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-4xl font-bold">HI</h1>
        <p className="text-lg">Welcome to the RBAC System</p>

        <div className="my-10">
          <Image
            src="/hero.svg"
            alt="Hero logo"
            width={400}
            height={400}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Please Continue to login to access our application
          </p>
        </div>

        <Button onClick={() => router.push('/sign-in')}>
          Continue to Login
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
