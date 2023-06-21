<script>
  import { createEventDispatcher } from "svelte";

  import * as todos from "../todos.js";
  import OneTodo from "./OneTodo.svelte";

  export let data;

  const dispatch = createEventDispatcher();

  function removeTodo(todo) {
    todos.removeItemFromList(todo, data);
    data = data;
  }

  function descendentDidExpand(event) {
    dispatch("descendentDidExpand");
  }

  function descendentDidCollapse(event) {
    dispatch("descendentDidCollapse");
  }
</script>

<div>
  {#each data as todo, index (todo.id)}
    <OneTodo
      id={todo.id}
      bind:name={todo.name}
      bind:expanded={todo.expanded}
      bind:children={todo.children}
      on:descendentDidExpand={descendentDidExpand}
      on:descendentDidCollapse={descendentDidCollapse}
    />
    {#if todo.children.length < 1}
      <button type="button" on:click={() => removeTodo(todo)}> Delete </button>
    {/if}
  {/each}
</div>

<style>
  ul {
    list-style: none;
  }
</style>
