'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const { logout } = useAuth();

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                                Admin Dashboard
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
                    <div className="flex items-center">
                        <Button
                            variant="outline"
                            onClick={logout}
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;