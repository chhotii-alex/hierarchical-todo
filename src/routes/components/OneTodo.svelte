
<script context="module" >
</script>

<script>

   export let todo;
   export let key;
   import Todos from './Todos.svelte';

</script>

  <details class="todo" bind:open={todo.expanded}  >
       <summary>
           {todo.name}
           <details class="inline indented" >
                <summary> --- </summary>
                <input bind:value={todo.name} />
               <input type="checkbox"
                  id="todo-{key}-{todo.id}"
                  bind:checked={todo.completed}  />
               {#if todo.completed}
                   <button type="button" on:click={() => removeTodo(todo)} >
                     Delete
                   </button>
               {/if}
           </details>
        </summary>
        <div class="boxed" >
                     <Todos key={`${key}_${todo.id}`} />
        </div>
  </details>

<style>
.inline {
  display: inline-block;
}

.indented {
   margin-left: 5em;
}

div.boxed {
   border: 3px solid gray;
   margin: 0.5em;
   margin-left: 1em;
   padding: 1em;
}

</style>
