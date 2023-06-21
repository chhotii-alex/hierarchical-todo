<script context="module">
  const nameInputs = new Map();
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import { tick } from 'svelte';
  import { onMount } from 'svelte';

  import * as todos from "../todos.js";
  import { currentEditID } from '../stores.js'; 
  import Todos from "./Todos.svelte";

  export let id;
  export let name;
  export let expanded;
  export let children;

  onMount(() => {
		nameInputs.set(id, nameInput);
		return () => nameInputs.delete(id);
	});

  const dispatch = createEventDispatcher();

  let hasExpandedItems;
  let hasCollapsedItems;

  let nameInput;

  async function addChild() {
    $currentEditID = todos.addNewItem(children);
    expanded = true;
    children = children;
    await editableGrabFocus();
  }

  async function editableGrabFocus() {
    await tick();
    nameInputs.get($currentEditID).focus();
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
    hasExpandedItems = (expanded && children.length) || hasExpandedChildren;
    hasCollapsedItems = (!expanded && children.length) || hasCollapsedChildren;
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

  async function startEditing() {
    $currentEditID = id;
    await editableGrabFocus();
  }

</script>

<details class="todo" bind:open={expanded}>
  <summary on:keyup={(e) => {e.preventDefault()}}>
      <input class:invisible="{$currentEditID != id}" size="80" bind:value={name} bind:this={nameInput} />
      <button class:invisible="{$currentEditID == id}" class="plain" on:click={startEditing}>
        {#if name.length}
          {name}
        {:else}
           ---
        {/if}
      </button>
    {#if hasCollapsedItems}
      <button on:click={() => expand()}> Expand All Subtasks </button>
    {/if}
    {#if hasExpandedItems}
      <button on:click={() => collapse()}> Collapse All Subtasks </button>
    {/if}
    <button on:click={() => addChild()}>Add Subtask</button>
  </summary>
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

  .invisible {
    display: none;
  }
</style>
