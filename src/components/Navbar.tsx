'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ProfilePicture from "./users/ProfilePicture";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import ManageAccountDialog from "./users/ManageAccountDialog";
import { Id, Doc } from "../../convex/_generated/dataModel";

const Navbar = () => {
    const { user, logout } = useAuth();
    const [showManageAccount, setShowManageAccount] = useState(false);

    return (
        <>
            <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                                    Dashboard
                                </h1>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a
                                    href="/admin/users"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-b-2 hover:border-indigo-500 transition-all duration-200"
                                >
                                    Users
                                </a>
                                <a
                                    href="/admin/roles"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-b-2 hover:border-indigo-500 transition-all duration-200"
                                >
                                    Roles
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <ProfilePicture
                                            userId={user?._id as Id<"users">}
                                            name={user?.name || ""}
                                            profilePicture={(user as Doc<"users">)?.profilePicture}
                                            size="sm"
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-1 leading-none">
                                            <p className="font-medium">{user?.name}</p>
                                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setShowManageAccount(true)}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Manage Account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            <ManageAccountDialog
                isOpen={showManageAccount}
                onClose={() => setShowManageAccount(false)}
            />
        </>
    );
};

export default Navbar;