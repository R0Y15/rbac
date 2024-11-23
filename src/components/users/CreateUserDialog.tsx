'use client';

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROLES, ROLE_LABELS } from "@/lib/constants/roles";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface CreateUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function CreateUserDialog({ isOpen, onClose }: CreateUserDialogProps) {
    const createUser = useMutation(api.users.createUser);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: ROLES.USER,
    });
    const [isChecking, setIsChecking] = useState(false);
    const [showEmailValidation, setShowEmailValidation] = useState(false);

    const emailExists = useQuery(api.users.checkEmailExists, {
        email: formData.email
    });

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

        setIsChecking(true);
        const toastId = toast.loading('Creating user...');

        try {
            if (emailExists) {
                toast.error("This email is already registered", { id: toastId });
                return;
            }

            await createUser(formData);
            toast.success("User created successfully", { id: toastId });
            onClose();
            setFormData({ name: "", email: "", role: ROLES.USER });
            setShowEmailValidation(false);
        } catch (err) {
            toast.error("Failed to create user", { id: toastId });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
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
                        {showEmailValidation && !validateEmail(formData.email) && formData.email && (
                            <p className="text-sm text-red-500">Please enter a valid email address</p>
                        )}
                    </div>
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
                                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isChecking || emailExists}>
                            {isChecking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding User...
                                </>
                            ) : (
                                'Add User'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 