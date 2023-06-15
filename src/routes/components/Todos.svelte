<script>

   import { createData } from '../store.js';
   import OneTodo from './OneTodo.svelte';

   export let key;

  const todos = createData([], key);

  $: totalTodos = todos.length;

function removeTodo(todo) {
  todos.remove(todo);
}

let newTodoId
  $: {
    if (totalTodos === 0) {
      newTodoId = 1;
    } else {
      newTodoId = Math.max(...$todos.map((t) => t.id)) + 1;
    }
  }

function addTodo() {
  let newItem = {
      id: newTodoId,
      name: "",
      completed: false,
      expanded: false,
  };
  todos.append(newItem);
}

</script>

<div>
{#each $todos as todo, index (todo.id)}
   <OneTodo {todo} {key} />
{/each}
</div>

<form on:submit|preventDefault={addTodo}>
  <button type="submit" disabled="" class="btn btn__primary btn__lg">
      Add
  </button>   
</form>

<style>

ul {
  list-style: none;
}

/* CHECKBOX STYLES */
.c-cb {
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-weight: 400;
  font-size: 1.6rem;
  line-height: 1.00;
  display: block;
  position: relative;
  min-height: 44px;
  padding-left: 40px;
  clear: left;
}
.c-cb > label::before,
.c-cb > input[type="checkbox"] {
  box-sizing: border-box;
  top: 10px;
  left: -1px;
  width: 30px;
  height: 30px;
}
.c-cb > input[type="checkbox"] {
  -webkit-font-smoothing: antialiased;
  cursor: pointer;
  position: absolute;
  z-index: 1;
  margin: 0;
  opacity: 0;
}
.c-cb > label {
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
  display: inline-block;
  margin-bottom: 0;
  padding: 8px 15px 5px;
  cursor: pointer;
  touch-action: manipulation;
}
.c-cb > label::before {
  content: "";
  position: absolute;
  border: 2px solid currentcolor;
  border-radius: 25px;
  background: transparent;
}
.c-cb > label::after {
  box-sizing: content-box;
  content: "";
  position: absolute;
  top: 11px;
  left: 9px;
  width: 18px;
  height: 7px;
  transform: rotate(-45deg); 
  border: solid;
  border-width: 0 0 5px 3px;
  border-top-color: transparent;
  opacity: 0;
  background: transparent;
}
.c-cb > input[type="checkbox"]:checked + label::after {
  opacity: 1;
}

</style>
