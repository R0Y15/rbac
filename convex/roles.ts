import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listRoles = query({
  args: {},
  handler: async (ctx) => {
    const roles = await ctx.db.query("roles").collect();
    return roles;
  },
});

export const createRole = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const roleId = await ctx.db.insert("roles", {
      name: args.name,
      description: args.description,
      permissions: args.permissions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return roleId;
  },
});
