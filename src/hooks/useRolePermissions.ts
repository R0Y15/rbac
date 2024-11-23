import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LEVELS, ASSIGNABLE_ROLES, ROLES } from "@/lib/constants/roles";

export function useRolePermissions() {
    const { user } = useAuth();
    const currentUserRole = user?.role || ROLES.USER;
    const currentUserLevel = ROLE_LEVELS[currentUserRole];

    const canAssignRole = (roleToAssign: string) => {
        // Admin cannot assign roles
        if (currentUserRole === ROLES.ADMIN) return false;
        if (currentUserRole === ROLES.USER) return false;
        return ASSIGNABLE_ROLES[currentUserRole]?.includes(roleToAssign) || false;
    };

    const canViewRole = () => {
        return true;
    };

    const canEditUser = (userRole: string) => {
        if (currentUserRole === ROLES.USER) return false;
        const targetUserLevel = ROLE_LEVELS[userRole];
        return currentUserLevel > targetUserLevel;
    };

    const canDeleteUser = (userRole: string) => {
        if (currentUserRole === ROLES.USER) return false;
        const targetUserLevel = ROLE_LEVELS[userRole];
        return currentUserLevel > targetUserLevel;
    };

    const canCreateUser = () => {
        return currentUserRole !== ROLES.USER;
    };

    const canUpdateStatus = (userRole: string) => {
        if (currentUserRole === ROLES.USER) return false;
        const targetUserLevel = ROLE_LEVELS[userRole];
        return currentUserLevel > targetUserLevel;
    };

    const getAssignableRoles = () => {
        // Admin cannot assign roles
        if (currentUserRole === ROLES.ADMIN) return [];
        return ASSIGNABLE_ROLES[currentUserRole] || [];
    };

    return {
        canAssignRole,
        canViewRole,
        canEditUser,
        canDeleteUser,
        canCreateUser,
        canUpdateStatus,
        getAssignableRoles,
        currentUserLevel,
        currentUserRole,
    };
} 