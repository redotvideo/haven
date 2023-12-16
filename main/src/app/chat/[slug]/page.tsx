import {ChevronLeftIcon} from "@heroicons/react/20/solid";
import {redirect} from "next/navigation";
import Button from "~/components/form/button";
import Sidebar from "~/components/sidebar";
import {getModelFromId} from "~/server/database/model";
import {checkSession} from "~/server/utils/session";
import ChatComponent from "./chat";
import Link from "next/link";
import {defaultModelLoopup} from "~/constants/models";

export default async function Chat({params}: {params: {slug: string}}) {
	const {slug} = params;

	const [session, model] = await Promise.all([checkSession(), getModelFromId(slug)]);

	const isInternal = Object.keys(defaultModelLoopup).includes(slug);

	if (!isInternal && model?.userId !== session.user.id) {
		redirect("/models");
	}

	return (
		<Sidebar current="Models">
			<Link href="/models">
				<Button className="fixed top-5 left-5 ml-72">
					<ChevronLeftIcon className="h-4 w-4" />
					Close chat
				</Button>
			</Link>

			<div className="h-5" />

			<ChatComponent modelId={slug} email={session.user.email || undefined} />
		</Sidebar>
	);
}
