'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.status === 'inactive') {
                toast.error('Your account has been disabled. Please contact an administrator.');
                localStorage.removeItem('user');
                document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                router.push('/sign-in');
                return;
            }
            setUser(userData);
            document.cookie = `auth-token=${userData._id}; path=/`;
        }
        setIsLoading(false);
    }, [router]);

    const login = (userData: User) => {
        if (userData.status === 'inactive') {
            toast.error('Your account has been disabled. Please contact an administrator.');
            return;
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        document.cookie = `auth-token=${userData._id}; path=/`;
        router.push('/admin/users');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        router.push('/sign-in');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 