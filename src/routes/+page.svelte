<script>
    import OneTodo from "./components/OneTodo.svelte";
    import { createNewItem, setNextIdFromData } from "./todos.js";
    import { parentTop } from './stores.js';

    const isBrowser = typeof window !== 'undefined';
    let key = "todolist";

    function dataForKey(aKey) {
        let aList;
        if (isBrowser && localStorage.getItem(aKey)) {
            aList = JSON.parse(localStorage.getItem(aKey));
            setNextIdFromData(aList);
        }
        else {
            aList = createNewItem();
        }
        return aList;
    }

    $: data = dataForKey(key);

    function update() {
        if (isBrowser) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    }
</script>

<input bind:value={key} />
<hr/>

<input type="checkbox" bind:checked={$parentTop} id="parentTopCheck"/>
<label for="parentTopCheck">Subtasks list below task</label>
<OneTodo todo={data}
        on:update={update}

/>
