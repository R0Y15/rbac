import { useState, useEffect } from "react";
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
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePicture from "./ProfilePicture";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface ManageAccountDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ManageAccountDialog({ isOpen, onClose }: ManageAccountDialogProps) {
    const { user, login, logout } = useAuth();
    const updateUser = useMutation(api.users.updateUser);
    const deleteUser = useMutation(api.users.deleteUser);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [showEmailValidation, setShowEmailValidation] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
            });
        }
    }, [user]);

    if (!user) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Loading...</DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    const validateEmail = (email: string): boolean => {
        return EMAIL_REGEX.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowEmailValidation(true);

        if (!validateEmail(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsUpdating(true);
        const toastId = toast.loading('Updating account...');

        try {
            const updatedUser = (await updateUser({
                userId: user._id as Id<"users">,
                name: formData.name,
                email: formData.email,
                role: user.role,
                profilePicture: (user as Doc<"users">)?.profilePicture ?? null
            }))!;

            login({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: user.status,
                profilePicture: (updatedUser as Doc<"users">)?.profilePicture ?? null
            });

            toast.success("Account updated successfully", { id: toastId });
            onClose();
        } catch (err) {
            toast.error("Failed to update account", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        const toastId = toast.loading('Deleting account...');
        try {
            await deleteUser({ userId: user._id as Id<"users"> });
            toast.success("Account deleted successfully", { id: toastId });
            logout();
        } catch (error) {
            toast.error("Failed to delete account", { id: toastId });
        }
    };

    const handleProfilePictureUpdate = (storageId: string) => {
        const cleanStorageId = storageId.includes('?') 
            ? storageId.split('?')[0].split('/').pop()
            : storageId;
        
        login({
            ...user,
            profilePicture: cleanStorageId
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Account</DialogTitle>
                    </DialogHeader>

                    <div className="flex justify-center mb-4">
                        <ProfilePicture
                            userId={user._id as Id<"users">}
                            name={user.name}
                            profilePicture={(user as Doc<"users">)?.profilePicture ?? null}
                            size="lg"
                            editable
                            onUploadComplete={handleProfilePictureUpdate}
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                className={showEmailValidation && !validateEmail(formData.email) ? 'border-red-500' : ''}
                                required
                            />
                            {showEmailValidation && !validateEmail(formData.email) && (
                                <p className="text-sm text-red-500">Please enter a valid email address</p>
                            )}
                        </div>

                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete Account
                            </Button>
                            <div className="space-x-2">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isUpdating}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your account and all associated data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 
