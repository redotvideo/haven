import {createEnv} from "@t3-oss/env-nextjs";
import {z} from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z
			.string()
			.url()
			.refine((str) => !str.includes("YOUR_MYSQL_URL_HERE"), "You forgot to change the default URL"),
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		NEXTAUTH_SECRET: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
		NEXTAUTH_URL: z.preprocess(
			// This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
			// Since NextAuth.js automatically uses the VERCEL_URL if present.
			(str) => process.env.VERCEL_URL ?? str,
			// VERCEL_URL doesn't include `https` so it cant be validated as a URL
			process.env.VERCEL ? z.string() : z.string().url(),
		),
		// Add ` on ID and SECRET if you want to make sure they're not empty
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),

		STRIPE_SECRET_KEY: z.string(),
		STRIPE_PUBLISHABLE_KEY: z.string(),

		WEBHOOK_SECRET: z.string(),
		MODAL_HOSTNAME: z.string(),
		MODAL_AUTH_TOKEN: z.string(),
		RESEND_KEY: z.string(),
		LOGTAIL_KEY: z.string(),
		LOGTAIL_ENV: z.string(),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
		STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
		WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
		MODAL_HOSTNAME: process.env.MODAL_HOSTNAME,
		MODAL_AUTH_TOKEN: process.env.MODAL_AUTH_TOKEN,
		RESEND_KEY: process.env.RESEND_KEY,
		LOGTAIL_KEY: process.env.LOGTAIL_KEY,
		LOGTAIL_ENV: process.env.LOGTAIL_ENV,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined.
	 * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
