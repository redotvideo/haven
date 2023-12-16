import {authOptions} from "../auth";
import {getServerSession} from "next-auth";
import {redirect} from "next/navigation";

/**
 * Retrieves session and redirects to login if not found.
 */
export async function checkSession() {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect("/");
	}

	return session;
}

/**
 * Retrieves session and throws an error if not found.
 */
export async function checkSessionAction() {
	const session = await getServerSession(authOptions);
	if (!session) {
		throw new Error("Unauthorized");
	}
	return session;
}
