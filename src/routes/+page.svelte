<script>
    import OneTodo from "./components/OneTodo.svelte";
    import { createNewItem } from "./todos.js";
    import { parentTop } from './stores.js';

    let data = createNewItem();

    function update() {
        console.log(JSON.stringify(data));
    }
</script>

<input type="checkbox" bind:checked={$parentTop} id="parentTopCheck"/>
<label for="parentTopCheck">Subtasks list below task</label>
<OneTodo bind:name={data.name} bind:expanded={data.expanded} id={data.id} bind:children={data.children} 
        on:update={update}

/>
