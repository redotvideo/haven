"use server";
import {getServerSession} from "next-auth";
import {revalidatePath} from "next/cache";
import {authOptions} from "~/server/auth";
import {updateHfToken, updateName} from "~/server/database/user";
import type {initialState} from "./form";
import {logger} from "~/server/utils/observability/logtail";

export async function submitForm(_: typeof initialState, formData: FormData) {
	const session = await getServerSession(authOptions);
	if (!session) {
		throw new Error("Not authenticated");
	}

	// TODO: validate
	const name = formData.get("name");
	const hfToken = formData.get("hf_token");

	if (hfToken && typeof hfToken === "string") {
		logger.info("Updating hfToken");
		await updateHfToken(session.user.id, hfToken.toString());
	}

	if (name && typeof name === "string") {
		logger.info("Updating name", {oldName: session.user.name, name: name.toString()});
		await updateName(session.user.id, name.toString());
	}

	revalidatePath("/settings");
	return {
		message: "Success!",
		color: "text-green-600",
	};
}
