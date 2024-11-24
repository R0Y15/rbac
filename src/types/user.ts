import { Id } from "../../convex/_generated/dataModel";
import { StorageId } from "convex/server";

export interface User {
    _id: Id<"users">;
    name: string;
    email: string;
    role: string;
    status: string;
    profilePicture?: StorageId | null;
} 