import { writable, get } from "svelte/store";

export function createData(defaultValue, key) {
    const store = writable(defaultValue);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    isBrowser &&
        localStorage[key] &&
        set(JSON.parse(localStorage[key]));

    function setNewValue(newValue) {
        if (isBrowser) {
            localStorage[key] = JSON.stringify(newValue);
        }
        set(newValue);
    }

    function updateValue(updater) {
        let currentValue = get(store);
        let updatedValue = updater(currentValue);
        setNewValue(updatedValue);
    }

    return {
        subscribe,
        set: newValue => setNewValue(newValue),
        clear: () => setNewValue(defaultValue),
        append: (item) => updateValue(
            currentList => [...currentList, item]),
        remove: (item) => updateValue(
            currentList => currentList.filter( t => t.id !== item.id) ),
    };
}




