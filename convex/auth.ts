import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { ROLES } from '../src/lib/constants/roles';

export const signUp = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate email format
        if (!args.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            throw new Error("Invalid email format");
        }

        // Check if email already exists
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existingUser) {
            throw new Error("Email already registered");
        }

        // Force role to be viewer for self-registration
        const role = ROLES.VIEWER;

        try {
            // Create the user
            const userId = await ctx.db.insert("users", {
                name: args.name,
                email: args.email,
                role,
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });

            // Return the created user
            return {
                _id: userId,
                name: args.name,
                email: args.email,
                role,
                status: "active",
            };
        } catch (error) {
            throw new Error("Failed to create account. Please try again.");
        }
    },
});

export const signIn = mutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (!user) {
            throw new Error("Email not found");
        }

        // Check if user account is inactive
        if (user.status === "inactive") {
            throw new Error("Your account has been disabled. Please contact an administrator.");
        }

        return user;
    },
}); 