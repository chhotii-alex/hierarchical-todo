<script context="module">
  const nameInputs = new Map();
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import { tick } from "svelte";
  import { onMount } from "svelte";

  import * as todos from "../todos.js";
  import { currentEditID, parentTop } from "../stores.js";
  import Todos from "./Todos.svelte";

  export let id;
  export let name;
  export let expanded;
  export let children;
  export let deleteFunc = () => {};

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
    console.log(`${name} doing expand`);
    expanded = true;
    todos.expandAll(children);
  }

  function collapse() {
    expanded = false;
    todos.collapseAll(children);
  }

  $: hasExpandedChildren = todos.hasExpandedItems(children);
  $: hasCollapsedChildren = todos.hasCollapsedItems(children);

  $: {
    let oldHasExpandedItems = hasExpandedItems;
    let oldHasCollapsedItems = hasCollapsedItems;
    hasExpandedItems = (expanded && children.length) || hasExpandedChildren;
    hasCollapsedItems = (!expanded && children.length) || hasCollapsedChildren;
    console.log(`${name} reactive`);
    if (hasExpandedItems && !oldHasExpandedItems) {
      console.log(`${name} dispatching descendentDidExpand`);
      dispatch("descendentDidExpand");
    }
    if (hasCollapsedItems && !oldHasCollapsedItems) {
      console.log(`${name} dispatching descendentDidCollapse`);
      dispatch("descendentDidCollapse");
    }
  }

  function descendentDidExpand(event) {
    console.log(`${name} doing descendentDidExpand`)
    hasExpandedChildren = true;
  }

  function descendentDidCollapse(event) {
    console.log(`${name} doing descendentDidCollapse`)
    hasCollapsedChildren = true;
  }

  async function startEditing() {
    $currentEditID = id;
    await editableGrabFocus();
  }

  function update() {
    dispatch("update");
  }

  $: {
    name;
    expanded;
    dispatch("update");
  }
</script>

<div class="todo" class:parent-top={$parentTop} class:child-top={!$parentTop}>
  <div class="top">
    <button on:click={() => (expanded = !expanded)}>
      {#if expanded}
        V
      {:else}
        &gt;
      {/if}
    </button>
    <input
      class:nondisplay={$currentEditID != id}
      size="80"
      bind:value={name}
      bind:this={nameInput}
    />
    <button
      class:nondisplay={$currentEditID == id}
      class="plain"
      on:click={startEditing}
    >
      {#if name.length}
        {name}
      {:else}
        ---
      {/if}
    </button>
    <span class="right_edge">
      <button class:invisible={!hasCollapsedItems} on:click={() => expand()}>
        VVV
      </button>
      <button class:invisible={!hasExpandedItems} on:click={() => collapse()}>
        &gt;&gt;&gt;
      </button>
      <button on:click={() => addChild()}>+</button>
      <button
        class:invisible={children.length > 0}
        type="button"
        on:click={() => deleteFunc(id)}
      >
        X
      </button>
    </span>
  </div>
  {#if children.length > 0 && expanded}
    <div class="boxed">
      <Todos
        bind:data={children}
        on:descendentDidExpand={descendentDidExpand}
        on:descendentDidCollapse={descendentDidCollapse}
        on:update={update}
      />
    </div>
  {/if}
</div>

<style>
  .todo {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
  }
  .parent-top {
    grid-template-areas:
      "top"
      "boxed";
  }
  .child-top {
    grid-template-areas:
      "boxed"
      "top";
  }
  .top {
    grid-area: top;
  }
  .inline {
    display: inline-block;
  }

  .indented {
    margin-left: 5em;
  }

  div.boxed {
    border-left: 0.5px solid lightgray;
    border-top: 0.5px solid lightgray;
    margin: 0.5em;
    margin-left: 1em;
    margin-right: 0;
    padding: 1em;
    padding-right: 0;
    grid-area: boxed;
  }

  .parent-top > div.boxed {
    border-bottom: 0.5px solid lightgray;
    border-top: none;
  }

  button.plain {
    border: none;
    background-color: inherit;
  }

  .invisible {
    visibility: hidden;
  }
  .nondisplay {
    display: none;
  }

  .right_edge {
    float: right;
  }
</style>
