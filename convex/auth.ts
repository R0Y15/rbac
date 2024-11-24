import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { ROLES } from '../src/lib/constants/roles';
import { api } from './_generated/api';
import { ConvexError } from 'convex/values';

// Simple but secure hash function for Convex
function simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36); // Convert to base-36 string
}

export const hashPassword = mutation({
    args: { password: v.string() },
    handler: async (ctx, args): Promise<string> => {
        const salt = Math.random().toString(36).substring(2);
        const hashedPassword = simpleHash(args.password + salt);
        return `${salt}:${hashedPassword}`;
    },
});

export const verifyPassword = mutation({
    args: { 
        hashedPassword: v.string(),
        password: v.string()
    },
    handler: async (ctx, args): Promise<boolean> => {
        const [salt, hash] = args.hashedPassword.split(':');
        const testHash = simpleHash(args.password + salt);
        return hash === testHash;
    },
});

interface SignUpResult {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
    profilePicture: string | null;
}

export const signUp = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        profilePicture: v.optional(v.union(v.string(), v.null())),
        role: v.string(),
        status: v.union(v.literal("active"), v.literal("inactive")),
    },
    handler: async (ctx, args): Promise<SignUpResult> => {
        if (!args.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            throw new Error("Invalid email format");
        }

        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existingUser) {
            throw new Error("Email already registered");
        }

        if (!args.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)) {
            throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
        }

        const hashedPassword = await ctx.runMutation(api.auth.hashPassword, { password: args.password });

        try {
            const userId = await ctx.db.insert("users", {
                name: args.name,
                email: args.email,
                password: hashedPassword,
                role: ROLES.USER,
                status: "active",
                profilePicture: args.profilePicture ?? undefined,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });

            return {
                _id: userId,
                name: args.name,
                email: args.email,
                role: ROLES.USER,
                password: hashedPassword,
                status: "active",
                profilePicture: args.profilePicture ?? null,
            };
        } catch (error) {
            throw new Error("Failed to create account. Please try again.");
        }
    },
});

export const signIn = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (!user) {
            throw new Error("Invalid email or password");
        }

        if (user.status === "inactive") {
            throw new Error("Account is inactive. Please contact an administrator.");
        }

        const isValid = await ctx.runMutation(api.auth.verifyPassword, {
            hashedPassword: user.password,
            password: args.password,
        });

        if (!isValid) {
            throw new Error("Invalid email or password");
        }

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            profilePicture: user.profilePicture ?? null,
        };
    },
}); 