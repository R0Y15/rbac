import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LEVELS, ASSIGNABLE_ROLES, VISIBLE_ROLES, ROLES } from "@/lib/constants/roles";

export function useRolePermissions() {
    const { user } = useAuth();
    const currentUserRole = user?.role || ROLES.VIEWER;
    const currentUserLevel = ROLE_LEVELS[currentUserRole];

    const canAssignRole = (roleToAssign: string) => {
        if (!user) return false;
        if (currentUserRole === ROLES.VIEWER) return false;
        return ASSIGNABLE_ROLES[currentUserRole]?.includes(roleToAssign) || false;
    };

    const canViewRole = (roleToView: string) => {
        if (!user) return false;
        return VISIBLE_ROLES[currentUserRole]?.includes(roleToView) || false;
    };

    const canEditUser = (userRole: string) => {
        if (!user) return false;
        if (currentUserRole === ROLES.VIEWER) return false;
        const targetUserLevel = ROLE_LEVELS[userRole];
        return currentUserLevel > targetUserLevel;
    };

    const canDeleteUser = (userRole: string) => {
        if (!user) return false;
        if (currentUserRole === ROLES.VIEWER) return false;
        const targetUserLevel = ROLE_LEVELS[userRole];
        return currentUserLevel > targetUserLevel;
    };

    const canCreateUser = () => {
        return currentUserLevel >= ROLE_LEVELS[ROLES.ADMIN];
    };

    const canUpdateStatus = (userRole: string) => {
        if (!user) return false;
        if (currentUserRole === ROLES.VIEWER) return false;
        const targetUserLevel = ROLE_LEVELS[userRole];
        return currentUserLevel > targetUserLevel;
    };

    const getAssignableRoles = () => {
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