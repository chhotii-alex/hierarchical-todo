<script context="module">
  const nameInputs = new Map();
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import { tick } from "svelte";
  import { onMount } from "svelte";

  import * as todos from "../todos.js";
  import { currentEditID, parentTop } from "../stores.js";

  export let todo;
  export let eve;
  export let deleteFunc = () => {};

  onMount(() => {
    nameInputs.set(todo.id, nameInput);
    return () => nameInputs.delete(todo.id);
  });

  const dispatch = createEventDispatcher();

  let hasExpandedItems;
  let hasCollapsedItems;

  let nameInput;

  $: {
    todo;
    dispatch("update");
  }

  function update() {
    dispatch("update");
  }

  function modify() {
    dispatch("modify");
  }

  async function addChild() {
    let newID = todos.addNewItem(todo.children);
    $currentEditID = newID;
    todo.expanded = true;
    todo.children = todo.children;
    await editableGrabFocus();
  }

  async function editableGrabFocus() {
    await tick();
    let input = nameInputs.get($currentEditID);
    if (input) {
      input.focus();
    }
  }

  function expand() {
    todo.expanded = true;
    todos.expandAll(todo.children);
  }

  function collapse() {
    todo.expanded = false;
    todos.collapseAll(todo.children);
  }

  $: hasExpandedChildren = todos.hasExpandedItems(todo.children);
  $: hasCollapsedChildren = todos.hasCollapsedItems(todo.children);
  $: expanded = todo.expanded;
  $: hasChildren = todo.children.length > 0;

  $: {
    hasExpandedItems = (expanded && hasChildren) || hasExpandedChildren;
    hasCollapsedItems = (!expanded && hasChildren) || hasCollapsedChildren;
    dispatch("descendentExpandDelta");
  }

  function descendentExpandDelta(event) {
    hasCollapsedChildren = todos.hasCollapsedItems(todo.children);
    hasExpandedChildren = todos.hasExpandedItems(todo.children);
  }

  async function startEditing() {
    $currentEditID = todo.id;
    await editableGrabFocus();
  }

  function checkForEnterKey(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.target.blur();
      endEditing();
    }
  }

  async function endEditing() {
    let input = nameInputs.get($currentEditID);
    if (input) {
      input.blur();
    }
    $currentEditID = -1;
  }

  function removeTodo(subtask) {
    todos.removeItemFromList(subtask, todo.children);
    todo.children = todo.children;
  }

  function removeTodoWithId(id) {
    let subtask = todo.children.find((el) => el.id == id);
    removeTodo(subtask);
  }

  function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
  }

  function allowDrop(event) {
      event.preventDefault();
  }

  function drop(event) {
    let draggedTag = event.dataTransfer.getData("text");
    let target = event.target;
    while (!target.id) {
      target = target.parentNode;
      if (!target) return;
    }
    let myTag = target.id;
    if (draggedTag != myTag) {
      let draggedId = draggedTag.substr(3);
      let targetId = myTag.substr(3);
      if (todos.directDescendentRelationship(eve, draggedId, targetId)) {
        console.log("Cannot replace direct ancestor or descendent");
        return;
      }
      let dragged = todos.itemWithId(eve, draggedId);
      let target = todos.itemWithId(eve, targetId);
      if (!(dragged && target)) {
        return;
      }
      event.preventDefault();
      let draggedParent = todos.parentOf(eve, dragged);
      let targetParent = todos.parentOf(eve, target);
      draggedParent.children = draggedParent.children.filter( e => e != dragged);
      targetParent.children.splice(targetParent.children.indexOf(target), 0, dragged);
      modify();
    }
  }

</script>

<div class="todo" class:parent-top={$parentTop} class:child-top={!$parentTop}>
  <div class="top" draggable="true" id={`tag${todo.id}`} on:dragstart={drag} 
    on:dragover={allowDrop}  on:drop={drop}
  >
    {#if hasChildren}
      <button on:click={() => (todo.expanded = !todo.expanded)}>
        {#if todo.expanded}
          V
        {:else}
          &gt;
        {/if}
      </button>
    {/if}
    <input
      class:nondisplay={$currentEditID != todo.id}
      size="80"
      bind:value={todo.name}
      bind:this={nameInput}
      on:keypress={checkForEnterKey}
    />
    <button
      class:nondisplay={$currentEditID == todo.id}
      class="plain"
      on:click={startEditing}
    >
      {#if todo.name.length}
        {todo.name}
      {:else}
        ---
      {/if}
    </button>
    <sup>{todo.id}</sup>
    <span class="right_edge">
      <button class:invisible={!hasCollapsedItems} on:click={() => expand()}>
        VVV
      </button>
      <button class:invisible={!hasExpandedItems} on:click={() => collapse()}>
        &gt;&gt;&gt;
      </button>
      <button on:click={() => addChild()}>+</button>
      <button
        class:invisible={todo.children.length > 0}
        type="button"
        on:click={() => deleteFunc(todo.id)}
      >
        X
      </button>
    </span>
  </div>
  <div class="boxed" class:nondisplay={!hasChildren || !expanded}>
    <div>
      {#each todo.children as subtask (subtask.id)}
        <div>
          <svelte:self
            todo={subtask}
            eve={eve}
            deleteFunc={removeTodoWithId}
            on:descendentExpandDelta={descendentExpandDelta}
            on:update={update}
            on:modify={modify}
          />
        </div>
      {/each}
    </div>
  </div>
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
