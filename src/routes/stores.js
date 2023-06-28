import { writable } from 'svelte/store';

export const currentEditID = writable(null);
export const parentTop = writable(true);
export const showBlocked = writable(true);
