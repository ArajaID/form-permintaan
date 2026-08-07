import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

const baseURL = process.env.BETTER_AUTH_URL
  ? process.env.BETTER_AUTH_URL.startsWith("http")
    ? process.env.BETTER_AUTH_URL.replace(/\/$/, "")
    : `https://${process.env.BETTER_AUTH_URL.replace(/\/$/, "")}`
  : undefined;

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseURL,
  trustedOrigins: [
    ...(baseURL ? [baseURL] : []),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
  ],
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "leader",
        input: true,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: true,
      },
    } as const,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
