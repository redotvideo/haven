import {useRouter} from "next/router";
import {useEffect} from "react";

export default function Redirect() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to /models
		void router.push("/models");
	});

	return null;
}
