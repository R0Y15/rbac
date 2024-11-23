'use client';

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { ROLE_LABELS, VISIBLE_ROLES, VISIBLE_ROLE_LABELS } from "@/lib/constants/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { ROLES } from "@/lib/constants/roles";

interface CreateUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);

export default function CreateUserDialog({ isOpen, onClose }: CreateUserDialogProps) {
    const { currentUserRole, canAssignRole } = useRolePermissions();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    });
    const [profilePicture, setProfilePicture] = useState<{
        storageId: string | null;
        previewUrl: string | null;
    }>({ storageId: null, previewUrl: null });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const createUser = useMutation(api.users.createUser);
    const generateUploadUrl = useMutation(api.users.generateUploadUrl);
    const hashPassword = useMutation(api.auth.hashPassword);

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsUploading(true);
        try {
            const file = e.target.files[0];
            const uploadUrl = await generateUploadUrl();
            await fetch(uploadUrl, {
                method: "POST",
                body: file
            });

            setProfilePicture({
                storageId: uploadUrl,
                previewUrl: URL.createObjectURL(file)
            });
        } catch (error) {
            toast.error("Failed to upload image");
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

        if (!formData.password) {
            toast.error("Password is required");
            return;
        }

        // if (formData.password !== formData.confirmPassword) {
        //     toast.error("Passwords do not match");
        //     return;
        // }

        if (!PASSWORD_REGEX.test(formData.password)) {
            toast.error("Password must be at least 8 characters long and contain at least one letter and one number");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Creating user...');

        try {
            // Hash the password
            const hashedPassword = await hashPassword({ password: formData.password });

            await createUser({
                name: formData.name,
                email: formData.email,
                password: hashedPassword,
                role: currentUserRole === ROLES.ADMIN ? ROLES.USER : formData.role,
                status: "active",
                profilePicture: profilePicture.storageId,
            });

            toast.success('User created successfully', { id: toastId });
            onClose();
            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "",
            });
            setProfilePicture({ storageId: null, previewUrl: null });
        } catch (error: any) {
            toast.error('Failed to create user', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Profile Picture</Label>
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
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
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Create Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Must be at least 8 characters with letters and numbers
                        </p>
                    </div>

                    {currentUserRole !== ROLES.ADMIN && (
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(VISIBLE_ROLE_LABELS)
                                        .filter(([role]) => canAssignRole(role))
                                        .map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || isUploading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create User'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}