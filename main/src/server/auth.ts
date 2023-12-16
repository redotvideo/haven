import {PrismaAdapter} from "@next-auth/prisma-adapter";
import {type GetServerSidePropsContext} from "next";
import {getServerSession, type DefaultSession, type NextAuthOptions} from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

import {db} from "~/server/database";
import {addApiKeyToUser} from "./database/user";
import type {User} from "@prisma/client";
import {sendVerifyEmail} from "./utils/mail";
import {EventName, sendEvent} from "./utils/observability/posthog";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: DefaultSession["user"] & {
			id: string;
			centsBalance: number;
			stripeCustomerId?: string;
			stripePaymentMethodId?: string;
			apiKey: string;
			hfToken?: string;
			image?: string;
		};
	}

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		session: ({session, user}) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
				centsBalance: (user as User).centsBalance,
				stripeCustomerId: (user as User).stripeCustomerId,
				stripePaymentMethodId: (user as User).stripePaymentMethodId,
				apiKey: (user as User).apiKey,
				hfToken: (user as User).hfToken,
				image: (user as User).image,
			},
		}),
	},
	adapter: PrismaAdapter(db),
	providers: [
		EmailProvider({
			sendVerificationRequest: async ({identifier, url}) => {
				await sendVerifyEmail(identifier, url);
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		}),
		/**
		 * ...add more providers here.
		 *
		 * Most other providers require a bit more work than the Discord provider. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
	],
	session: {strategy: "database"},
	pages: {
		signIn: "/auth/login",
		verifyRequest: "/auth/verify-request",
		newUser: "/auth/new-user",
	},
	events: {
		createUser: async (message) => {
			sendEvent(message.user.id, EventName.NEW_USER, {email: message.user.email});

			// Add an API key to the user when they sign up.
			await addApiKeyToUser(message.user.id);
		},
	},
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext["req"];
	res: GetServerSidePropsContext["res"];
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions);
};
