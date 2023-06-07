import { writable } from "svelte/store";

// Get system preference for dark mode.
const wantsDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
export const isDark = writable(wantsDarkMode.matches);
