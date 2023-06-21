
let nextId = 1;

export function createNewList() {
    return [];
}

function createNewItemForId(newTodoId) {
    return {
        id: newTodoId,
        name: "",
        expanded: true,
        children: createNewList(),
    };
}

export function addItemToList(item, theList) {
    theList.push(item);
}

export function createNewItem() {
    let newId = nextId++;
    return createNewItemForId(newId);
}

export function addNewItem(theList) {
    let newItem = createNewItem()
    addItemToList(newItem, theList);
    return newItem.id;
}

export function addItemAsChild(child, parent) {
    addItemToList(child, parent.children);
}

export function hasChildren(item) {
    return (item.children.length > 0);
}

export function removeItemFromList(item, theList) {
    let index = theList.indexOf(item);
    if (index !== -1) {
        theList.splice(index, 1);
    }
}

export function removeChild(child, parent) {
    removeItemFromList(child, parent.children);
}

export function maxIdForList(theList) {
    let ids = theList.map(t => maxIdForItem(t));
    return Math.max(...ids, 0);
}

export function maxIdForItem(item) {
    let maxChildId = maxIdForList(item.children);
    if (item.id > maxChildId) {
        return item.id;
    }
    else {
        return maxChildId;
    }
}

export function expandAll(theList) {
    for (let i = 0; i < theList.length; ++i) {
        theList[i].expanded = true;
        expandAll(theList[i].children);
    }
    return theList;
}

export function collapseAll(theList) {
    for (let i = 0; i < theList.length; ++i) {
        theList[i].expanded = false;
        collapseAll(theList[i].children);
    }
    return theList;
}

function hasItemsWithExpandedState(theList, flag) {
    for (let i = 0; i < theList.length; ++i) {
        if (hasChildrenWithExpandedState(theList[i], flag)) {
            return true;
        }
    }
    return false;
}

function hasChildrenWithExpandedState(item, flag) {
    if (item.expanded == flag && item.children.length) {
        return true;
    }
    if (hasItemsWithExpandedState(item.children, flag)) {
        return true;
    }
    return false;
}

export function hasCollapsedItems(theList) {
    return hasItemsWithExpandedState(theList, false);
}

export function hasExpandedItems(theList) {
    return hasItemsWithExpandedState(theList, true);
}
