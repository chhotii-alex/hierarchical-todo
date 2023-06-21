<script>
    import OneTodo from "./components/OneTodo.svelte";
    import { createNewList } from "./todos.js";
    import { parentTop } from './stores.js';

    let data = createNewList();

    function update() {
        console.log(JSON.stringify(data));
    }
</script>

<input type="checkbox" bind:checked={$parentTop} id="parentTopCheck"/>
<label for="parentTopCheck">Subtasks list below task</label>
<OneTodo name="A List" expanded={true} id={0} bind:children={data} 
        on:update={update}

/>
