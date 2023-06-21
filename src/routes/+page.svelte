<script>
    import OneTodo from "./components/OneTodo.svelte";
    import { createNewList } from "./todos.js";

    let data = createNewList();
</script>

<OneTodo name="A List" expanded={true} id={0} bind:children={data} />
