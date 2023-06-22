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
    let todo = data.find((el) => el.id == id);
    removeTodo(todo);
  }

  function descendentExpandDelta(event) {
    dispatch("descendentExpandDelta");
  }

  function update() {
    dispatch("update");
  }

</script>

<div>
  {#each data as todo (todo.id)}
    <div>
      <OneTodo
        todo={todo}
        deleteFunc={removeTodoWithId}
        on:descendentExpandDelta={descendentExpandDelta}
        on:update={update}
      />
    </div>
  {/each}
</div>
