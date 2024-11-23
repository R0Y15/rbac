'use client';

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SignInPage() {
    const { login, user } = useAuth();
    const router = useRouter();
    const signIn = useMutation(api.auth.signIn);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If user is already logged in, redirect to admin/users
        if (user) {
            router.push('/admin/users');
        }
    }, [user, router]);

    const validateEmail = (email: string): boolean => {
        return EMAIL_REGEX.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Signing in...');

        try {
            const user = await signIn({ email });
            toast.success('Signed in successfully', { id: toastId });
            login(user);
            router.push('/admin/users');
        } catch (error: any) {
            // Extract the clean error message from the Convex error
            const errorMessage = error.message || error.toString();
            const cleanError = errorMessage.includes(']') 
                ? errorMessage.split('] ').pop()?.trim() 
                : errorMessage;
            toast.error(cleanError || 'Failed to sign in', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-8 px-4">
                <div className="space-y-4 text-center">
                    <Image
                        src="/auth.svg"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="mx-auto"
                    />
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Welcome back
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/sign-up"
                            className="text-primary hover:text-primary/90 font-medium"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
