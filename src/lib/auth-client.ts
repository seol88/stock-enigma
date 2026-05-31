import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
    // You can configure your client options here
    baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:5173",
});
