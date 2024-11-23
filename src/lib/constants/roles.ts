export const ROLES = {
  GHOST: "ghost",     // Level 5 (highest)
  SUPER_ADMIN: "super_admin", // Level 4
  ADMIN: "admin",     // Level 3
  USER: "user",       // Level 2
  VIEWER: "viewer",   // Level 1 (lowest)
} as const;

export const ROLE_LEVELS = {
  [ROLES.GHOST]: 5,
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.USER]: 2,
  [ROLES.VIEWER]: 1,
} as const;

// Roles that are visible to each role level
export const VISIBLE_ROLES = {
  [ROLES.GHOST]: [ROLES.GHOST, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER, ROLES.VIEWER],
  [ROLES.SUPER_ADMIN]: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER, ROLES.VIEWER],
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.USER, ROLES.VIEWER],
  [ROLES.USER]: [ROLES.ADMIN, ROLES.USER, ROLES.VIEWER],
  [ROLES.VIEWER]: [ROLES.ADMIN, ROLES.USER, ROLES.VIEWER],
} as const;

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'User',
  [ROLES.VIEWER]: 'Viewer',
  [ROLES.GHOST]: 'Ghost',
} as const;

// Roles that can be assigned by each role level
export const ASSIGNABLE_ROLES = {
  [ROLES.GHOST]: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER, ROLES.VIEWER],
  [ROLES.SUPER_ADMIN]: [ROLES.ADMIN, ROLES.USER, ROLES.VIEWER],
  [ROLES.ADMIN]: [ROLES.USER, ROLES.VIEWER],
  [ROLES.USER]: [],
  [ROLES.VIEWER]: [],
} as const;

export const VISIBLE_ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'User',
  [ROLES.VIEWER]: 'Viewer',
} as const;


export type Role = keyof typeof ROLE_LABELS; 
