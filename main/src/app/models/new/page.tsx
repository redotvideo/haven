import Padding from "~/components/padding";
import PageHeading from "~/components/page-heading";
import Sidebar from "~/components/sidebar";
import NewModelForm from "./form";
import {checkSession} from "~/server/utils/session";

export default async function Page() {
	await checkSession();

	return (
		<Sidebar current="Models">
			<Padding>
				<PageHeading>Start model training</PageHeading>
			</Padding>
			<div className="mt-6 mb-6 border-b border-gray-800" />
			<Padding>
				<NewModelForm />
			</Padding>
		</Sidebar>
	);
}
