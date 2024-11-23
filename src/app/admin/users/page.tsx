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
import { MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
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

export default function UsersPage() {
    const { user, logout } = useAuth();
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

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        
        console.log('Users and their roles:', users.map(u => ({ name: u.name, role: u.role })));
        
        // First filter out ghost users
        const nonGhostUsers = users.filter(user => user.role !== ROLES.GHOST);
        
        console.log('After ghost filter:', nonGhostUsers.map(u => ({ name: u.name, role: u.role })));
        
        // Then apply search filter if there's a query
        if (!searchQuery.trim()) return nonGhostUsers;

        const query = searchQuery.toLowerCase();
        return nonGhostUsers.filter(
            (user) =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    if (!users) return <div>Loading...</div>;

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

    return (
        <div className="space-y-6 p-6">
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
                <div className="flex gap-2">
                    <Button onClick={() => setIsModalOpen(true)}>
                        Add User
                    </Button>
                    <Button variant="outline" onClick={logout}>
                        Sign Out
                    </Button>
                </div>
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
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
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
                        filteredUsers.map((user: any) => (
                            <TableRow key={user._id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Select
                                        value={user.role}
                                        onValueChange={(value) => handleRoleChange(user._id, value)}
                                        disabled={updating.id === user._id && updating.field === 'role'}
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
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={user.status}
                                        onValueChange={(value: "active" | "inactive") =>
                                            handleStatusChange(user._id, value)
                                        }
                                        disabled={updating.id === user._id && updating.field === 'status'}
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
                                            <DropdownMenuItem
                                                onClick={() => setUserToEdit(user)}
                                                className="cursor-pointer"
                                            >
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setUserToDelete({ id: user._id, name: user.name })}
                                                className="cursor-pointer text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
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
