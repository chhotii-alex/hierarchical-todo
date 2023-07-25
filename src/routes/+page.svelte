<script>
    import { onMount, onDestroy, tick } from "svelte";
    import OneTodo, { isBlockedCache } from "./components/OneTodo.svelte";
    import { createNewItem, setNextIdFromData } from "./todos.js";
    import { parentTop, showBlocked } from "./stores.js";

    const isBrowser = typeof window !== "undefined";

    /* Look at all the data persisted to localStorage;
      start generating id's from the max of all id's used
      for all lists. 
      TODO remove as unnecessary? */
    if (isBrowser) {
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            let s = localStorage.getItem(key);
            if (s) {
                let aList = JSON.parse(s);
                setNextIdFromData(aList);
            }
        }
    }

    function tagSetFromTodo(todo) {
        let s = new Set();
        if (todo.tags) {
            for (let i = 0; i < todo.tags.length; ++i) {
                s.add(todo.tags[i]);
            }
        }
        for (let i = 0; i < todo.children.length; ++i) {
            for (const tag of tagSetFromTodo(todo.children[i]).values()) {
                s.add(tag);
            }
        }
        return s;
    }

    function tagsFromData(todo) {
        return [...tagSetFromTodo(todo)];
    }

    let timeout;

    function blockReset() {
        blockResetImpl(data);
    }

    function blockResetImpl(maybeNewData) {
        tags = tagsFromData(maybeNewData);
        isBlockedCache.clear();
        data = maybeNewData;
        scheduleBlockReset();
    }

    function getMidnightTonight(now) {
        let tomorrow = now.getTime() + 24 * 60 * 60 * 1000;
        let midnight = new Date();
        midnight.setTime(tomorrow);
        midnight.setHours(0, 0, 0, 0);
        return midnight;
    }

    function findSoonestPuntExpiration(item) {
        let when = null;
        let now = new Date().getTime();
        if (item.puntUntilWhen) {
            let punt = Date.parse(item.puntUntilWhen);
            if (punt >= now) {
                when = punt;
            }
        }
        for (let i = 0; i < item.children.length; ++i) {
            let childWhen = findSoonestPuntExpiration(item.children[i]);
            if (childWhen && (!when || childWhen < when)) {
                when = childWhen;
            }
        }
        return when;
    }

    async function scheduleBlockReset() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        await tick();
        let now = new Date();
        let unblockCheckWhen = getMidnightTonight(now).getTime();
        let soonestPuntExpiration = findSoonestPuntExpiration(data);
        if (soonestPuntExpiration != null) {
            if (soonestPuntExpiration < unblockCheckWhen) {
                unblockCheckWhen = soonestPuntExpiration;
            }
        }
        let millis = unblockCheckWhen - now.getTime();
        if (millis < 1) {
            millis = 1;
        }
        timeout = setTimeout(blockReset, millis);
    }

    onMount(() => {
        scheduleBlockReset();
    });
    onDestroy(() => {
        clearTimeout(timeout);
    });

    let key = "todo";

    function dataForKey(aKey) {
        let aList;
        if (isBrowser && localStorage.getItem(aKey)) {
            aList = stringToData(localStorage.getItem(aKey));
            setNextIdFromData(aList);
        } else {
            aList = createNewItem();
        }
        return aList;
    }

    function isEmpty(d) {
        return d.name.length == 0 && d.children.length == 0;
    }

    let data;
    $: allowUpload = key.length < 1;
    $: {
        blockResetImpl(dataForKey(key));
    }

    let tags = [ ];
    let newTagName = "";

    function tagKeypress(event) {
        if (event.key === "Enter") {
            if (newTagName.length > 0) {
                tags.push(newTagName);
                tags = tags;
            }
            event.preventDefault();
            event.target.blur();
            newTagName = "";
        }
    }

    function dragTag(event) {
        event.dataTransfer.setData("text", event.target.innerText);
        event.dataTransfer.setData("type", "tag");
    }

    function dataToString(obj) {
        let keys = ["name", "id", "unblockDate", "children", "tags"];
        return JSON.stringify(obj, keys, 2);
    }

    function reviver(key, value) {
        this.expanded = true;
        return value;
    }

    function stringToData(s) {
        return JSON.parse(s, reviver);
    }

    /*
      Event handler for the "update" event, which is dispatched when
      any task in the tree updates any attribute. 
      Causes the whole data structure to be saved.
     */
    function update() {
        if (isBrowser) {
            dataToString(data);
            localStorage.setItem(key, dataToString(data));
        }
        scheduleBlockReset();
    }

    /*
       Event handler for "modify" event, which is dispatched on the
       completion of a drag-and-drop rearrangement. 
       Causes EVERYTHING to be re-rendered.
       TODO: this can be way more re-rendering that is needed;
       calculate the most recent common ancenstor of the drag
       source and drag sink, and just re-render from that point down? 
       See https://svelte.dev/repl/053c93e397ab4ccd8921d2beca238ffe?version=3.29.4
       for attaching parameters to events.
    */
    function modified() {
        data = data;
        update();
    }

    // File I/O
    let files;
    function upload() {
        const reader = new FileReader();
        const name = files[0].name.split(".")[0];
        reader.onload = (evt) => {
            let txt = evt.target.result;
            localStorage.setItem(name, txt);
            key = name;
        };
        reader.readAsText(files[0]);
    }

    $: url = makeDownloadURL(data);

    function makeDownloadURL(data) {
        const blob = new Blob([dataToString(data)], {
            type: "application/json",
        });
        return URL.createObjectURL(blob);
    }
</script>

<input bind:value={key} />
<hr />

{#each tags as tag}
    <span class="tag" draggable="true" on:dragstart={dragTag}>
        {tag}
    </span>
{/each}
<input bind:value={newTagName} on:keypress={tagKeypress} />

<hr />

{#if allowUpload}
    <div class="noprint">
        Upload List from File...
        <input id="myfiles" type="file" accept=".json" bind:files />
        {#if files}
            <h2>Selected file:</h2>
            {#each Array.from(files) as file}
                <p>{file.name} ({file.size} bytes)</p>
            {/each}
            <button on:click={upload}> Upload Selected File </button>
        {/if}
    </div>
{:else}
    <input type="checkbox" bind:checked={$parentTop} id="parentTopCheck" />
    <label for="parentTopCheck">Subtasks list below task</label>
    <input type="checkbox" bind:checked={$showBlocked} id="showBlockedCheck" />
    <label for="showBlockedCheck">Show blocked items</label>
    <OneTodo todo={data} eve={data} on:update={update} on:modify={modified} />
    {#if !isEmpty(data)}
        <a href={url} download={`${key}.json`} class="noprint">
            Download This List
        </a>
    {/if}
{/if}

<style>
    span.tag {
        padding: 0px 0.5em;
        margin: 0px 1em;
        border-style: solid;
        border-width: 0.5px;
        border-radius: 4px;
    }
    @media only print {
        .noprint {
            display: none;
        }
    }
</style>
