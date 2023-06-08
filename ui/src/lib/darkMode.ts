import {writable} from "svelte/store";

// Get system preference for dark mode.
const wantsDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
export const isDark = writable(wantsDarkMode);
