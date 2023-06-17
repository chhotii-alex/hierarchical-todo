
<script>

   import * as todos from '../todos.js';
   import Todos from './Todos.svelte';

   export let name;
   export let completed;
   export let expanded;
   export let children;

   export let update = () => {};

   function expand() {
     expanded = true;
     children = todos.expandAll(children);
   }

   function collapse() {
      expanded = false;
      children = todos.collapseAll(children);
   }

   $: hasExpandedChildren = todos.hasExpandedItems(children);
   $: hasExpandedItems = (expanded || hasExpandedChildren );
   $: hasCollapsedChildren = todos.hasCollapsedItems(children);
   $: hasCollapsedItems = (!expanded || hasCollapsedChildren );

   $: update(hasExpandedItems, hasCollapsedItems);

</script>

  <details class="todo" bind:open={expanded}  >
       <summary>
           {name}
                    {#if hasCollapsedItems }
                        <button on:click={ () => expand() } >
                           Expand All Children   
                        </button>
                    {/if}
                    {#if hasExpandedItems }
                       <button on:click={ () => collapse() } >
                          Collapse All Children
                       </button>
                    {/if}
                    </summary>
                    <input bind:value={name} />
                    <input type=checkbox bind:checked={completed} />
        <div class="boxed" >
                     <Todos bind:data={children} />
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
