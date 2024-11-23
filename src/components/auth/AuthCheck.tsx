'use client';

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROLES } from "@/lib/constants/roles";

export default function AuthCheck({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            // Allow access to admin pages for viewers without login
            if (!user && pathname.startsWith('/admin')) {
                // Set viewer role in auth context
                localStorage.setItem('user', JSON.stringify({
                    _id: 'viewer',
                    name: 'Viewer',
                    email: 'viewer@example.com',
                    role: ROLES.USER,
                    status: 'active'
                }));
            }
        }
    }, [isLoading, user, pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return <>{children}</>;
} 