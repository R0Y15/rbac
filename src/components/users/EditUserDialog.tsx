'use client';

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROLES, ROLE_LABELS } from "@/lib/constants/roles";
import { Loader2, Pencil } from "lucide-react";
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
import toast from "react-hot-toast";
import { Id } from "../../../convex/_generated/dataModel";
import ProfilePicture from "./ProfilePicture";
import { useRolePermissions } from "@/hooks/useRolePermissions";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    _id: Id<"users">;
    name: string;
    email: string;
    role: string;
    profilePicture?: string | null;
  };
}

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function EditUserDialog({ isOpen, onClose, user }: EditUserDialogProps) {
  const updateUser = useMutation(api.users.updateUser);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEmailValidation, setShowEmailValidation] = useState(false);
  const { getAssignableRoles, canAssignRole } = useRolePermissions();
  const assignableRoles = getAssignableRoles();

  // Check if email exists (excluding current user's email)
  const emailExists = useQuery(api.users.checkEmailExists, { 
    email: formData.email 
  }) && formData.email !== user.email;

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
    const toastId = toast.loading('Updating user...');

    try {
      if (emailExists) {
        toast.error("This email is already registered", { id: toastId });
        return;
      }

      await updateUser({
        userId: user._id,
        ...formData
      });
      toast.success("User updated successfully", { id: toastId });
      onClose();
    } catch (err) {
      toast.error("Failed to update user", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfilePictureUpdate = (storageId: string) => {
    setFormData(prev => ({
      ...prev,
      profilePicture: storageId
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center mb-4">
          <ProfilePicture
            userId={user._id}
            name={user.name}
            profilePicture={formData.profilePicture}
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
            {showEmailValidation && !validateEmail(formData.email) && formData.email && (
              <p className="text-sm text-red-500">Please enter a valid email address</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              disabled={!canAssignRole(user.role)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((role: string) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || emailExists}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 