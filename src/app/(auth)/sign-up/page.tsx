'use client';

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/constants/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SignUpPage() {
    const router = useRouter();
    const { login } = useAuth();
    const signUp = useMutation(api.auth.signUp);
    const generateUploadUrl = useMutation(api.users.generateUploadUrl);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });
    const [profilePicture, setProfilePicture] = useState<{
        storageId: string | null;
        previewUrl: string | null;
    }>({ storageId: null, previewUrl: null });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const validateEmail = (email: string): boolean => {
        return EMAIL_REGEX.test(email);
    };

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('File size should be less than 5MB');
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading('Uploading image...');

        try {
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);

            // Get upload URL from Convex
            const postUrl = await generateUploadUrl();

            // Upload file to storage
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error('Failed to upload image');
            }

            const { storageId } = await result.json();

            setProfilePicture({
                storageId,
                previewUrl,
            });

            toast.success('Profile picture uploaded', { id: toastId });
        } catch (error) {
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Creating account...');

        try {
            const user = await signUp({
                name: formData.name,
                email: formData.email,
                role: ROLES.VIEWER,
                status: "active",
            });
            toast.success('Account created successfully', { id: toastId });
            login(user);
            router.push('/admin/users');
        } catch (error: any) {
            const errorMessage = error.message || error.toString();
            const cleanError = errorMessage.includes(']')
                ? errorMessage.split('] ').pop()?.trim()
                : errorMessage;
            toast.error(cleanError || 'Failed to create account', { id: toastId });
            setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-8 px-4">
                <div className="space-y-4 text-center">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="mx-auto"
                    />
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Create an account
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Enter your details to create your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center mb-4">
                        <div className="relative group">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profilePicture.previewUrl || undefined} />
                                <AvatarFallback>{formData.name ? getInitials(formData.name) : '+'}</AvatarFallback>
                            </Avatar>

                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleProfilePictureUpload}
                                        disabled={isUploading}
                                    />
                                    {isUploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                    ) : (
                                        <Upload className="h-6 w-6 text-white" />
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || isUploading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            href="/sign-in"
                            className="text-primary hover:text-primary/90 font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}