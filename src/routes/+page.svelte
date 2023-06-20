<script>
    import OneTodo from "./components/OneTodo.svelte";
    import { createNewList, expandAll, collapseAll } from "./todos.js";

    let data = createNewList();
</script>

<OneTodo name="A List" completed={false} expanded={true} bind:children={data} />
