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

  function removeTodoWithId(id) {
    let todo = data.find(el => el.id == id);
    removeTodo(todo);
  }

  function descendentDidExpand(event) {
    dispatch("descendentDidExpand");
  }

  function descendentDidCollapse(event) {
    dispatch("descendentDidCollapse");
  }
</script>

<div>
  {#each data as todo (todo.id)}
    <div>
      <OneTodo
        id={todo.id}
        bind:name={todo.name}
        bind:expanded={todo.expanded}
        bind:children={todo.children}
        deleteFunc={removeTodoWithId}
        on:descendentDidExpand={descendentDidExpand}
        on:descendentDidCollapse={descendentDidCollapse}
      />
    </div>
  {/each}
</div>

<style>
  ul {
    list-style: none;
  }
</style>
