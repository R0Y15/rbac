import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

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
            throw new Error("User not found");
        }

        if (user.status === "inactive") {
            throw new Error("Account is inactive");
        }

        return user;
    },
}); 