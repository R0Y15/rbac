'use client';

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import CreateUserDialog from "@/components/users/CreateUserDialog";
import { ROLE_LABELS, ROLES, VISIBLE_ROLE_LABELS, VISIBLE_ROLES } from "@/lib/constants/roles";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Filter, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import EditUserDialog from "@/components/users/EditUserDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import ProfilePicture from "@/components/users/ProfilePicture";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export default function UsersPage() {
    const { user } = useAuth();
    const {
        canEditUser,
        canDeleteUser,
        canCreateUser,
        canViewRole,
        canUpdateStatus,
        currentUserRole,
    } = useRolePermissions();
    const users = useQuery(api.users.listUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const updateUserRole = useMutation(api.users.updateUserRole);
    const updateUserStatus = useMutation(api.users.updateUserStatus);
    const deleteUser = useMutation(api.users.deleteUser);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: Id<"users">; name: string } | null>(null);
    const [updating, setUpdating] = useState<{
        id: Id<"users"> | null;
        field: 'role' | 'status' | null;
    }>({ id: null, field: null });
    const [userToEdit, setUserToEdit] = useState<{
        _id: Id<"users">;
        name: string;
        email: string;
        role: string;
    } | null>(null);
    const [roleFilters, setRoleFilters] = useState<string[]>([]);
    const [statusFilters, setStatusFilters] = useState<string[]>([]);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        let filtered = users.filter(() => canViewRole());

        // Apply role filters
        if (roleFilters.length > 0) {
            filtered = filtered.filter(user => roleFilters.includes(user.role));
        }

        // Apply status filters
        if (statusFilters.length > 0) {
            filtered = filtered.filter(user => statusFilters.includes(user.status));
        }

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [users, searchQuery, roleFilters, statusFilters, canViewRole]);

    const handleRoleFilterChange = (role: string) => {
        setRoleFilters(prev => {
            if (prev.includes(role)) {
                return prev.filter(r => r !== role);
            }
            return [...prev, role];
        });
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilters(prev => {
            if (prev.includes(status)) {
                return prev.filter(s => s !== status);
            }
            return [...prev, status];
        });
    };

    const handleRoleChange = async (userId: Id<"users">, newRole: string) => {
        setUpdating({ id: userId, field: 'role' });
        const toastId = toast.loading('Updating role...');

        try {
            await updateUserRole({ userId, role: newRole });
            toast.success('Role updated successfully', { id: toastId });
        } catch (error) {
            toast.error('Failed to update role', { id: toastId });
        } finally {
            setUpdating({ id: null, field: null });
        }
    };

    const handleStatusChange = async (userId: Id<"users">, newStatus: "active" | "inactive") => {
        setUpdating({ id: userId, field: 'status' });
        const toastId = toast.loading('Updating status...');

        try {
            await updateUserStatus({ userId, status: newStatus });
            toast.success('Status updated successfully', { id: toastId });
        } catch (error) {
            toast.error('Failed to update status', { id: toastId });
        } finally {
            setUpdating({ id: null, field: null });
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        const toastId = toast.loading('Deleting user...');
        try {
            await deleteUser({ userId: userToDelete.id });
            toast.success('User deleted successfully', { id: toastId });
        } catch (error) {
            toast.error('Failed to delete user', { id: toastId });
        } finally {
            setUserToDelete(null);
        }
    };

    if (!users) return <div>Loading...</div>;

    return (
        <div className="max-w-screen-xl mx-auto px-4 space-y-6 p-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Hi, {user?.name}! 👋
                </h1>
                <p className="text-muted-foreground">
                    You are logged in as {ROLE_LABELS[user?.role as keyof typeof ROLE_LABELS || ROLES.USER]}
                </p>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Manage Users</h2>
                {canCreateUser() && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        Add User
                    </Button>
                )}
            </div>

            <div className="flex items-center space-x-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                    >
                        Clear
                    </Button>
                )}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>
                            <div className="flex items-center gap-2">
                                Role
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48">
                                        <div className="space-y-2">
                                            {Object.entries(VISIBLE_ROLE_LABELS).map(([role, label]) => (
                                                <div key={role} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`role-${role}`}
                                                        checked={roleFilters.includes(role)}
                                                        onCheckedChange={() => handleRoleFilterChange(role)}
                                                    />
                                                    <label
                                                        htmlFor={`role-${role}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="flex items-center gap-2">
                                Status
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="status-active"
                                                    checked={statusFilters.includes("active")}
                                                    onCheckedChange={() => handleStatusFilterChange("active")}
                                                />
                                                <label
                                                    htmlFor="status-active"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Active
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="status-inactive"
                                                    checked={statusFilters.includes("inactive")}
                                                    onCheckedChange={() => handleStatusFilterChange("inactive")}
                                                />
                                                <label
                                                    htmlFor="status-inactive"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Inactive
                                                </label>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center"
                            >
                                {searchQuery ? (
                                    <div className="text-muted-foreground">
                                        No users found matching &quot;{searchQuery}&quot;
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground">
                                        No users available
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredUsers.map((user) => (
                            user.role !== ROLES.GHOST ? (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <ProfilePicture
                                                userId={user._id}
                                                name={user.name}
                                                profilePicture={user.profilePicture}
                                                size="sm"
                                            />
                                            <span>{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {currentUserRole === ROLES.ADMIN ? (
                                            <div className="w-[180px] px-3 py-2 border rounded-md bg-muted">
                                                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                                            </div>
                                        ) : (
                                            <Select
                                                value={user.role}
                                                onValueChange={(value) => handleRoleChange(user._id, value)}
                                                disabled={!canEditUser(user.role) || updating.id === user._id}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(VISIBLE_ROLE_LABELS).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.status}
                                            onValueChange={(value: "active" | "inactive") =>
                                                handleStatusChange(user._id, value)
                                            }
                                            disabled={!canUpdateStatus(user.role) || updating.id === user._id}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {canEditUser(user.role) && (
                                                    <DropdownMenuItem onClick={() => setUserToEdit(user)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}
                                                {canDeleteUser(user.role) && (
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => setUserToDelete({
                                                            id: user._id,
                                                            name: user.name
                                                        })}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ) : null))
                    )}
                </TableBody>
            </Table>

            <CreateUserDialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {userToDelete?.name}&apos;s account and all associated data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {userToEdit && (
                <EditUserDialog
                    isOpen={!!userToEdit}
                    onClose={() => setUserToEdit(null)}
                    user={userToEdit}
                />
            )}
        </div>
    );
}
