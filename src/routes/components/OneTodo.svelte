<script context="module">
  const nameInputs = new Map();
  export let isBlockedCache = new Map();
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import { tick } from "svelte";
  import { onMount } from "svelte";

  import * as todos from "../todos.js";
  import { currentEditID, parentTop, showBlocked } from "../stores.js";

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

  /* Rather than doing a bind:value on the input, update the
  value in response to the changed event. This is because:
  1) Otherwise the object attribute gets changed every time 
  you scroll through the calendar months in Google Chrome;
  this can cause things to disappear before you're done picking
  a date.
  2) I don't like how the logic in isBlocked is not memoized and thus
  branches are visited over and over. Maybe do something clever here with a 
  dirty flag?
  */
  async function updateBlock(event) {
    isBlockedCache.clear(); // throw away all the memoization
    todo.unblockDate = event.target.value;
    update();
  }

  function isBlocked(item, _ = 0) {
    if (!isBlockedCache.has(item.id)) {
      isBlockedCache.set(item.id, calcIsBlocked(item));
    }
    return isBlockedCache.get(item.id);
  }

  function punt() {
    let now = Date.now();
    let later = now + 1000 * 60 * 60 * 3; // three hours
    later = new Date(later);
    later = later.toISOString(); // N.B. that this will be in UTC
    isBlockedCache.clear(); // throw away all the memoization
    todo.puntUntilWhen = later;
    update();
  }

  /*
    Blocking decision is re-visited when timeout (at midnight,
    or sooner if things are temporarily punted).
  */
  function calcIsBlocked(item) {
    const now = new Date();
    let unblockDate = Date.parse(item.unblockDate + "T00:00:00");
    let puntDate = Date.parse(item.puntUntilWhen);
    let blockDates = [unblockDate, puntDate];
    for (let i = 0; i < blockDates.length; ++i) {
      if (blockDates[i] != null && blockDates[i] > now) {
        return true;
      }
    }
    /* If there are any children, and they are all blocked, we're blocked. */
    /* If there's no children, not blocked. */
    if (item.children.length == 0) {
      return false;
    }
    let anyUnblockedChildren = false;
    for (let i = 0; i < item.children.length; ++i) {
      if (!isBlocked(item.children[i])) {
        anyUnblockedChildren = true;
      }
    }
    return !anyUnblockedChildren;
  }

  let tickleBlockUpdate = 0;
  $: hidingBecauseBlocked = !$showBlocked && isBlocked(todo, tickleBlockUpdate);

  function update() {
    dispatch("update");
    tickleBlockUpdate += 1;
  }

  function modify() {
    dispatch("modify");
  }

  async function addChild() {
    let newID = todos.addNewItem(todo.children);
    $currentEditID = newID;
    todo.expanded = true;
    update();
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
    todos.removeChild(subtask, todo);
    todo.children = todo.children;
    update();
  }

  function removeTodoWithId(id) {
    let subtask = todo.children.find((el) => el.id == id);
    removeTodo(subtask);
  }

  function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.dataTransfer.setData("type", "todo");
  }

  function allowDrop(event) {
    event.preventDefault();
  }

  function drop(event) {
    let type = event.dataTransfer.getData("type");
    let target = event.target;
    while (!target.id) {
      target = target.parentNode;
      if (!target) return;
    }
    let myDomId = target.id;
    if (type == "tag") {
      dropTag(event);
    } else {
      dropTodo(event, myDomId);
    }
  }

  function dropTag(event) {
    let tag = event.dataTransfer.getData("text");
    if (!todo.tags) {
      todo.tags = [tag];
    } else {
      if (todo.tags.indexOf(tag) >= 0) {
        //already in list
        return;
      }
      todo.tags = [...todo.tags, tag];
    }
    update();
  }

  function dropTodo(event, myDomId) {
    let draggedDomId = event.dataTransfer.getData("text");
    if (draggedDomId != myDomId) {
      let draggedId = draggedDomId.substr(3);
      if (todos.directDescendentRelationship(eve, draggedId, todo.id)) {
        console.log("Cannot replace direct ancestor or descendent");
        return;
      }
      let dragged = todos.itemWithId(eve, draggedId);
      if (!dragged) {
        return;
      }
      event.preventDefault();
      let draggedParent = todos.parentOf(eve, dragged);
      let targetParent = todos.parentOf(eve, todo);
      draggedParent.children = draggedParent.children.filter(
        (e) => e != dragged
      );
      targetParent.children.splice(
        targetParent.children.indexOf(todo),
        0,
        dragged
      );
      modify();
    }
  }
</script>

{#if !hidingBecauseBlocked}
  <div class="todo" class:parent-top={$parentTop} class:child-top={!$parentTop}>
    <div
      class="top"
      draggable="true"
      id={`id_${todo.id}`}
      on:dragstart={drag}
      on:dragover={allowDrop}
      on:drop={drop}
    >
      {#if hasChildren}
        <button
          on:click={() => (todo.expanded = !todo.expanded)}
          class="noprint"
        >
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
        on:change={update}
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
      {#if todo.tags}
        {#each todo.tags as tag}
          <span class="tag">
            {tag}
          </span>
        {/each}
      {/if}
      <span class="right_edge noprint">
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
        Block until:
        <input
          type="date"
          value={todo.unblockDate || null}
          on:change={updateBlock}
        />
        <button on:click={() => punt()}> punt </button>
      </span>
    </div>
    <div class="boxed" class:nondisplay={!hasChildren || !expanded}>
      <div>
        {#each todo.children as subtask (subtask.id)}
          <div>
            <svelte:self
              todo={subtask}
              {eve}
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
  <hr />
{/if}

<style>
  @media only print {
    .noprint {
      display: none;
    }
  }

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

  span.tag {
        padding: 0px 0.5em;
        margin: 0px 0.25em;
        border-style: solid;
        border-width: 0.5px;
        border-radius: 4px;
    }
</style>
