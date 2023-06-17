<script>
  import Todos from "./components/Todos.svelte";
  import { createNewList, expandAll, collapseAll } from './todos.js';

  let data = createNewList();
</script>

<h1>
  A List
</h1>
<button on:click={ () => data = expandAll(data) } >
   Expand All
</button>
<button on:click={ () => data = collapseAll(data) } >
   Collapse All
</button>
<Todos {data}  />
