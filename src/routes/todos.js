
let nextId = 1;

export function setNextIdFromData(item) {
    nextId = biggestId(item) + 1;
}

function biggestId(item) {
    let biggest = nextId - 1;
    if ('id' in item) {
        if (item.id > biggest) {
            biggest = item.id;
        }
        if (('children' in item) && ('length' in item.children)) {
            for (let i = 0; i < item.children.length; ++i) {
                let anId = biggestId(item.children[i])
                if (anId > biggest) {
                    biggest = anId;
                }
            }
        }
    }
    return biggest;
}

export function createNewList() {
    return [];
}

function createNewItemForId(newTodoId) {
    return {
        id: newTodoId,
        name: "",
        expanded: true,
        children: createNewList(),
        unblockDate: null,
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

function hasDirectDescendent(node, id) {
    for (let i = 0; i < node.children.length; ++i) {
        let child = node.children[i];
        if (child.id == id) return true;
        if (hasDirectDescendent(child, id)) return true;
    }
    return false;
}

export function directDescendentRelationship(eve, a, b) {
    if (a == eve.id) return true;
    if (b == eve.id) return true;
    for (let i = 0; i < eve.children.length; ++i) {
        let node = eve.children[i];
        if (node.id == a ) {
            return hasDirectDescendent(node, b);
        }
        if (node.id == b) {
            return hasDirectDescendent(node, a);
        }
        if (directDescendentRelationship(node, a, b)) return true;
    }
    return false;
}

export function itemWithId(eve, id) {
    if (eve.id == id) {
        return eve;
    }
    for (let i = 0; i < eve.children.length; ++i) {
        let node = eve.children[i];
        node = itemWithId(node, id);
        if (node) {
            return node;
        }
    }
    return null;
}

export function parentOf(eve, item) {
    if (eve == item) return null;
    for (let i = 0; i < eve.children.length; ++i) {
        let child = eve.children[i];
        if (child == item) return eve;
        let node = parentOf(child, item);
        if (node) return node;
    }
    return null;
}
