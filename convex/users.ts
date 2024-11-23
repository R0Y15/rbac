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
        password: v.string(),
        role: v.string(),
        status: v.union(v.literal("active"), v.literal("inactive")),
        profilePicture: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
        // Check if email already exists
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existingUser) {
            throw new Error("Email already registered");
        }

        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            password: args.password,
            role: args.role,
            status: args.status,
            profilePicture: args.profilePicture ?? undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return await ctx.db.get(userId);
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
        profilePicture: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
        const { userId, ...updates } = args;
        
        await ctx.db.patch(userId, {
            ...updates,
            profilePicture: updates.profilePicture ?? undefined,
            updatedAt: Date.now(),
        });

        return await ctx.db.get(userId);
    },
});

export const updateProfilePicture = mutation({
    args: {
        userId: v.id("users"),
        storageId: v.union(v.string(), v.null()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            profilePicture: args.storageId ?? undefined,
            updatedAt: Date.now(),
        });
    },
});

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const getProfilePictureUrl = query({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});