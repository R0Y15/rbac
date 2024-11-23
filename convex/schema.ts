// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        role: v.string(),
        status: v.union(v.literal("active"), v.literal("inactive")),
        createdAt: v.number(),
        updatedAt: v.number(),
    }),
    roles: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        permissions: v.array(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    }),
    permissions: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        category: v.string(),
        createdAt: v.number(),
    })
});
