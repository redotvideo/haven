import Padding from "~/components/padding";
import PageHeading from "~/components/page-heading";
import Sidebar from "~/components/sidebar";
import {checkSession} from "~/server/utils/session";
import SettingsForm from "./form";

export default async function Settings() {
	const session = await checkSession();

	const name = session.user.name ?? undefined;
	const hfToken = session.user.hfToken;

	return (
		<Sidebar current="Settings">
			<Padding>
				<PageHeading>Settings</PageHeading>
			</Padding>
			<div className="my-6 border-b border-gray-800" />

			<Padding>
				<SettingsForm name={name} hfToken={hfToken} />
			</Padding>
		</Sidebar>
	);
}
