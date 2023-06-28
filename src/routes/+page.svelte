<script>
    import OneTodo from "./components/OneTodo.svelte";
    import { createNewItem, setNextIdFromData } from "./todos.js";
    import { parentTop, showBlocked } from "./stores.js";

    const isBrowser = typeof window !== "undefined";

    /* Look at all the data persisted to localStorage;
      start generating id's from the max of all id's used
      for all lists. */
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

    let key = "todo";

    function dataForKey(aKey) {
        let aList;
        if (isBrowser && localStorage.getItem(aKey)) {
            aList = JSON.parse(localStorage.getItem(aKey));
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
        data = dataForKey(key);
    }

    /*
      Event handler for the "update" event, which is dispatched when
      any task in the tree updates any attribute. 
      Causes the whole data structure to be saved.
     */
    function update() {
        if (isBrowser) {
            localStorage.setItem(key, JSON.stringify(data));
        }
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
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        return URL.createObjectURL(blob);
    }
</script>

<input bind:value={key} />
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
      <a href={url} download={`${key}.json`} class="noprint" > Download This List </a>
    {/if}
{/if}

<style>
    @media only print {
        .noprint {
            display: none;
        }
    }
</style>
