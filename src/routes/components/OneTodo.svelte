<script>
  import { createEventDispatcher } from "svelte";

  import * as todos from "../todos.js";
  import Todos from "./Todos.svelte";

  export let name;
  export let expanded;
  export let children;

  const dispatch = createEventDispatcher();

  let hasExpandedItems;
  let hasCollapsedItems;

  function addChild() {
    todos.addNewItem(children);
    expanded = true;
    children = children;
  }

  function expand() {
    expanded = true;
    children = todos.expandAll(children);
  }

  function collapse() {
    expanded = false;
    children = todos.collapseAll(children);
  }

  $: hasExpandedChildren = todos.hasExpandedItems(children);
  $: hasCollapsedChildren = todos.hasCollapsedItems(children);

  $: {
    let oldHasExpandedItems = hasExpandedItems;
    let oldHasCollapsedItems = hasCollapsedItems;
    hasExpandedItems = expanded || hasExpandedChildren;
    hasCollapsedItems = !expanded || hasCollapsedChildren;
    if (hasExpandedItems && !oldHasExpandedItems) {
      dispatch("descendentDidExpand");
    }
    if (hasCollapsedItems && !oldHasCollapsedItems) {
      dispatch("descendentDidCollapse");
    }
  }

  function descendentDidExpand(event) {
    hasExpandedChildren = true;
  }

  function descendentDidCollapse(event) {
    hasCollapsedChildren = true;
  }
</script>

<details class="todo" bind:open={expanded}>
  <summary>
    <button class="plain">
      {name}
    </button>
    {#if hasCollapsedItems}
      <button on:click={() => expand()}> Expand All Children </button>
    {/if}
    {#if hasExpandedItems}
      <button on:click={() => collapse()}> Collapse All Children </button>
    {/if}
    <form on:submit|preventDefault={addChild}>
      <button type="submit" disabled="" class="btn btn__primary btn__lg">
        Add
      </button>
    </form>
  </summary>
  <input size="80" bind:value={name} />
  {#if children.length > 0}
    <div class="boxed">
      <Todos
        bind:data={children}
        on:descendentDidExpand={descendentDidExpand}
        on:descendentDidCollapse={descendentDidCollapse}
      />
    </div>
  {/if}
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

  button.plain {
    border: none;
    background-color: inherit;
  }
</style>
