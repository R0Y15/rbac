'use client';

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Id } from "../../../convex/_generated/dataModel";

interface ProfilePictureProps {
    userId: Id<"users">;
    name: string;
    profilePicture?: string | null;
    size?: "sm" | "md" | "lg";
    editable?: boolean;
    onUploadComplete?: (storageId: string) => void;
}

export default function ProfilePicture({
    userId,
    name,
    profilePicture,
    size = "md",
    editable = false,
    onUploadComplete
}: ProfilePictureProps) {
    const [isUploading, setIsUploading] = useState(false);
    const generateUploadUrl = useMutation(api.users.generateUploadUrl);
    const updateProfilePicture = useMutation(api.users.updateProfilePicture);
    const imageUrl = useQuery(api.users.getProfilePictureUrl,
        profilePicture ? { storageId: profilePicture } : "skip"
    );

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-16 w-16"
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading('Uploading image...');

        try {
            const postUrl = await generateUploadUrl();

            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error('Failed to upload image');
            }

            const { storageId } = await result.json();

            await updateProfilePicture({ userId, storageId });

            if (onUploadComplete) {
                onUploadComplete(storageId);
            }

            toast.success('Profile picture updated', { id: toastId });
        } catch (error) {
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setIsUploading(false);
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
        <div className="relative group">
            <Avatar className={sizeClasses[size]}>
                <AvatarImage src={imageUrl || undefined} alt={name} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>

            {editable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                            <Upload className="h-4 w-4 text-white" />
                        )}
                    </label>
                </div>
            )}
        </div>
    );
}