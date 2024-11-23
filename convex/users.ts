import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users;
    },
});

export const createUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            role: args.role,
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        return userId;
    },
});

export const updateUserStatus = mutation({
    args: {
        userId: v.id("users"),
        status: v.union(v.literal("active"), v.literal("inactive")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            status: args.status,
            updatedAt: Date.now(),
        });
    },
});

export const checkEmailExists = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();
        return !!existingUser;
    },
});

export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            role: args.role,
            updatedAt: Date.now(),
        });
    },
});

export const deleteUser = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.userId);
    },
});

export const updateUser = mutation({
    args: {
        userId: v.id("users"),
        name: v.string(),
        email: v.string(),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            name: args.name,
            email: args.email,
            role: args.role,
            updatedAt: Date.now(),
        });
    },
});