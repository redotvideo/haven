// This file wraps the navigate function of the svelte router to make window.location.pathname in a writable store.

import {writable} from "svelte/store";
import * as router from "svelte-routing";
import {checkSetup} from "./setup";

export const path = writable(window.location.pathname);

export function navigate(pathname: string) {
	router.navigate(pathname);
	path.set(pathname);

	return checkSetup();
}
