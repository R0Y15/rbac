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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLES } from "@/lib/constants/roles";

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [profilePicture, setProfilePicture] = useState<{
        storageId: string | null;
        previewUrl: string | null;
    }>({ storageId: null, previewUrl: null });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const signUp = useMutation(api.auth.signUp);
    const generateUploadUrl = useMutation(api.users.generateUploadUrl);
    const { login } = useAuth();
    const router = useRouter();

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading('Uploading profile picture...');

        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            setProfilePicture({
                storageId,
                previewUrl: URL.createObjectURL(file),
            });
            toast.success('Profile picture uploaded', { id: toastId });
        } catch (error) {
            toast.error('Failed to upload profile picture', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!EMAIL_REGEX.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (!PASSWORD_REGEX.test(formData.password)) {
            toast.error("Password must be at least 8 characters long and contain at least one letter and one number");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Creating account...');

        try {
            const user = await signUp({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                profilePicture: profilePicture.storageId,
                role: ROLES.USER,
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="mx-auto w-full max-w-[350px] space-y-6">
                <div className="space-y-2 text-center">
                    <Image
                        src="/hero.svg"
                        alt="Logo"
                        width={100}
                        height={100}
                        className="mx-auto"
                    />
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Create an account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your details to create your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Profile Picture Upload */}
                    <div className="space-y-2 flex flex-col items-center">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={profilePicture.previewUrl || undefined} />
                                <AvatarFallback>
                                    {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Label
                                htmlFor="picture"
                                className="cursor-pointer border rounded-md px-3 py-2 hover:bg-muted"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                            </Label>
                            <Input
                                id="picture"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePictureUpload}
                                disabled={isUploading}
                            />
                        </div>
                        <Label className="my-4">Profile Picture</Label>
                    </div>

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
                            placeholder="m@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Must be at least 8 characters with letters and numbers
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || isUploading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Sign Up'
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