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
import { VISIBLE_ROLES, VISIBLE_ROLE_LABELS } from "@/lib/constants/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function CreateUserDialog({ isOpen, onClose }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [profilePicture, setProfilePicture] = useState<{
    storageId: string | null;
    previewUrl: string | null;
  }>({ storageId: null, previewUrl: null });
  const [isUploading, setIsUploading] = useState(false);
  const [showEmailValidation, setShowEmailValidation] = useState(false);

  const createUser = useMutation(api.users.createUser);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const validateEmail = (email: string) => EMAIL_REGEX.test(email);

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

    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!EMAIL_REGEX.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const toastId = toast.loading('Creating user...');

    try {
      await createUser({
        ...formData,
        profilePicture: profilePicture.storageId || undefined,
      });
      toast.success('User created successfully', { id: toastId });
      onClose();
      // Reset form
      setFormData({ name: "", email: "", role: "" });
      setProfilePicture({ storageId: null, previewUrl: null });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user', { id: toastId });
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profilePicture.previewUrl || undefined} />
                <AvatarFallback>{formData.name ? getInitials(formData.name) : 'U'}</AvatarFallback>
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
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Upload className="h-4 w-4 text-white" />
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
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
              onValueChange={(value) => setFormData({ ...formData, role: value as keyof typeof VISIBLE_ROLES })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VISIBLE_ROLE_LABELS).map(([value, label]) => (
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
            <Button type="submit">
              {isUploading ? (
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