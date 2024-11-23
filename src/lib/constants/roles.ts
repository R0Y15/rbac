export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
  GHOST: 'ghost'
} as const;

export const VISIBLE_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'User',
  [ROLES.VIEWER]: 'Viewer',
  [ROLES.GHOST]: 'Ghost',
} as const;

export const VISIBLE_ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'User',
  [ROLES.VIEWER]: 'Viewer',
} as const;


export type Role = keyof typeof ROLE_LABELS; 
