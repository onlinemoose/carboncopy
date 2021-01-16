var appId;
var enableFrameAdd = false;
var selectedSticky = null;
var pinned = false;
var contextMenuOpen = false;
var activeFrame = -1;
var selectedListItem = null;
var timeout = null;

miro.onReady(async () => {
    appId = await miro.getClientId();
    miro.addListener(miro.enums.event.SELECTION_UPDATED, getWidget);
    getWidget();
});

const defaultText = document.getElementById('default-text');
const widgetTextContainer = document.getElementById('default-text-container');
const widgetText = document.getElementById('widget-text');
const pinIcon = document.getElementById('pin-icon');
const footer = document.getElementById('footer');
const btnSetFrame = document.getElementById('set-frame');
const contextMenu = document.getElementById('context-menu');
const btnMoveup = document.getElementById('btn-moveup');
const btnMovedown = document.getElementById('btn-movedown');
const btnRename = document.getElementById('btn-rename');
const btnDelete = document.getElementById('btn-delete');

btnSetFrame.addEventListener('click', () => { enableFrameAdd = true });

document.addEventListener('click', () => closeContextMenu(), false);


const setEndOfContenteditable = (contentEditableElement) => {
    var range, selection;
    if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if (document.selection)//IE 8 and lower
    {
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

const handleStickyTextChange = event => {
    let newWidgetData = { ...selectedSticky, plainText: event.target.innerText, text: event.target.innerText };
    miro.board.widgets.update(newWidgetData);
    miro.board.selection.selectWidgets([]);
}

widgetText.addEventListener("input", _.debounce(handleStickyTextChange, 1000));

widgetText.addEventListener("dblclick", () => {
    widgetText.contentEditable = "true";
    widgetText.focus();
    setEndOfContenteditable(widgetText);
});

widgetText.addEventListener("blur", () => {
    widgetText.contentEditable = "false";
});

widgetText.addEventListener("click", () => {
    handleStoryClick();
});

widgetText.addEventListener("keydown", (event) => {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        event.preventDefault();
        widgetText.blur();
    }
});

closeContextMenu = () => {
    if (contextMenuOpen) {
        contextMenu.classList.add('hide');
        contextMenuOpen = false;
        activeFrame = -1;
    }
}

const getListItem = (listName, listID, showDeletedIcon) => {

    let listHTML = '<li class="list-item" id="list-item" ';
    listHTML += 'onblur="handleListItemBlur(this)" ';
    listHTML += 'onkeydown="handleListItemEnterKey(event,this)" ';
    listHTML += 'oninput="handleListItemInput(event,' + "'" + listID + "'" + ')" ';
    listHTML += 'ondblclick="handleListItemEdit(this)" ';
    listHTML += 'onclick="handleListItemClick(' + "'" + listID + "'" + ')">';
    listHTML += listName;
    listHTML += '<svg xmlns="http://www.w3.org/2000/svg" height="24" ';
    listHTML += 'onclick="handleOverFlow(event)" ';
    listHTML += 'viewBox="0 0 24 24" width="24" class="overflow-icon">';
    listHTML += '<path d="M0 0h24v24H0z" fill="none" />';
    listHTML += '<path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />';
    listHTML += '</svg>'
    if (showDeletedIcon) {
        listHTML += '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" class="deleted-icon" > ';
        listHTML += '<path d="M0 0h24v24H0V0z" fill="none"/> ';
        listHTML += '<path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/> ';
        listHTML += '</svg>'
    }
    listHTML += '</li >'

    var template = document.createElement('template');
    listHTML = listHTML.trim();
    template.innerHTML = listHTML;
    return template.content.firstChild;
}

const processSynced = async (metadata, id) => {

    let widgets = await miro.board.widgets.get();
    let sticky = widgets.filter(widget => widget.id === id);

    if (sticky && sticky.length) {
        sticky = sticky[0];
        let syncID = (sticky.metadata[appId]?.syncID || 0);
        if (syncID) {
            let syncedWidgets = widgets.filter(widget => ((widget.metadata[appId]?.syncID || 0) === syncID) && widget.id !== id);
            let newMetadata = metadata;
            syncedWidgets.map(widget => {
                newMetadata[widget.id] = metadata[id];
            });
            return newMetadata;
        }
    }

    return metadata;
}

const updateListItemValue = async (event, listID) => {
    clearTimeout(timeout);
    let metadata = await readData();

    let newFrames = (metadata[selectedSticky.id]?.frames || []);
    var nodes = Array.from(list.children);
    let modifiedIndex = nodes.indexOf(event.target);
    let newAliases = (metadata[selectedSticky.id]?.aliases || []);
    newAliases[modifiedIndex] = event.target.innerText;

    metadata[selectedSticky.id] = {
        ...(metadata[selectedSticky.id] || {}),
        frames: newFrames,
        aliases: newAliases
    };

    if (getAppName() === "Lean Stories+") {
        metadata = await processSynced(metadata, selectedSticky.id);
    }
    await writeData(metadata);
}

const handleListItemInput = (event, listID) => {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => updateListItemValue(event, listID), 1000);
}

const handleListItemEnterKey = (event, element) => {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        event.preventDefault();
        element.blur();
    }
}

const handleListItemEdit = (el) => {
    el.contentEditable = "true";
    el.focus();
    setEndOfContenteditable(el);
}

const handleListItemBlur = (element) => {
    element.contentEditable = "false";
}

const handleStoryClick = () => {
    let sticky = selectedSticky;
    miro.board.viewport.set({
        x: sticky.x - sticky.bounds.width * 2,
        y: sticky.y - sticky.bounds.height * 2,
        width: sticky.bounds.width * 4,
        height: sticky.bounds.height * 4,
    }, { animationTimeInMS: 250 });
}

const handleListItemClick = async (listID) => {
    let widgets = await miro.board.widgets.get({ id: listID });
    if (widgets.length) {
        let frame = widgets[0];
        miro.board.viewport.set({
            x: frame.x - (frame.bounds.width * 1.5) / 2,
            y: frame.y - (frame.bounds.height * 1.2) / 2,
            width: frame.bounds.width * 1.5,
            height: frame.bounds.height * 1.2,
        }, { animationTimeInMS: 250 });
        miro.board.selection.selectWidgets({ id: listID });
    }
    else {
        miro.showErrorNotification('Selected frame doesn\'t exist in the board');
    }
}

const handlePositionChange = async ({ newIndex, oldIndex }) => {

    let metadata = await readData();
    let newFrames = (metadata[selectedSticky.id]?.frames || []);
    let newAliases = (metadata[selectedSticky.id]?.aliases || []);

    let oldValue = newFrames[oldIndex];
    newFrames.splice(oldIndex, 1);              //Remove item from old position
    newFrames.splice(newIndex, 0, oldValue);    //Add item to new position

    oldValue = newAliases[oldIndex];
    newAliases.splice(oldIndex, 1);              //Remove item from old position
    newAliases.splice(newIndex, 0, oldValue);    //Add item to new position

    metadata[selectedSticky.id] = {
        ...(metadata[selectedSticky.id] || {}),
        frames: newFrames,
        aliases: newAliases
    };

    if (getAppName() === "Lean Stories+") {
        metadata = await processSynced(metadata, selectedSticky.id);
    }
    await writeData(metadata);
}

const handleOverFlow = (event) => {
    event.stopPropagation();

    var nodes = Array.from(list.children)
    let index = nodes.indexOf(event.target.closest('li'));

    contextMenu.style.top = (event.clientY + 20) + "px";
    contextMenu.style.left = (event.clientX - 200) + "px";
    contextMenu.classList.remove("hide");
    if (index) {
        btnMoveup.classList.remove("hide");
    }
    else {
        btnMoveup.classList.add("hide");
    }
    if (nodes.length - 1 === index) {
        btnMovedown.classList.add('hide');
    }
    else {
        btnMovedown.classList.remove('hide');
    }
    contextMenuOpen = true;
    activeFrame = index;
}

Sortable.prototype.moveItem = function (index, toIndex) {
    var itemEl = this.el.children[index],
        toEl = this.el.children[toIndex];
    if (index > toIndex) {
        this.el.insertBefore(itemEl, toEl);
    }
    else {
        this.el.insertBefore(toEl, itemEl);
    }
};

Sortable.prototype.removeItem = function (index) {
    var itemEl = this.el.children[index];
    itemEl.remove();
};

Sortable.prototype.editItem = function (index) {
    var itemEl = this.el.children[index];
    var event = new MouseEvent('dblclick', {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });
    itemEl.dispatchEvent(event);
};

const list = document.getElementById('list');
var sortable = Sortable.create(list, {
    animation: 250,
    onChange: _.debounce(handlePositionChange, 400),
    ghostClass: 'list-drag'
});

pinIcon.addEventListener('click', async () => {
    if (pinned) {
        cleanUp();
    }
    else {
        pinIcon.classList.add("color-primary");
        footer.classList.remove("hide");
        pinned = true;
    }
});

btnMoveup.addEventListener('click', async () => {
    sortable.moveItem(activeFrame, activeFrame - 1);
    handlePositionChange({ newIndex: activeFrame - 1, oldIndex: activeFrame });
});

btnMovedown.addEventListener('click', async () => {
    sortable.moveItem(activeFrame, activeFrame + 1);
    handlePositionChange({ newIndex: activeFrame + 1, oldIndex: activeFrame });
});

btnRename.addEventListener('click', async () => {
    sortable.editItem(activeFrame);
});

btnDelete.addEventListener('click', async () => {

    //sortable.removeItem overwrites var, so pass it a const
    const deleteFrame = activeFrame;
    sortable.removeItem(deleteFrame);

    let metadata = await readData();
    let newFrames = metadata[selectedSticky.id].frames.filter((_, index) => index !== deleteFrame);
    let newAliases = metadata[selectedSticky.id].aliases.filter((_, index) => index !== deleteFrame);

    metadata[selectedSticky.id] = {
        ...(metadata[selectedSticky.id] || {}),
        frames: newFrames,
        aliases: newAliases
    };

    if (getAppName() === "Lean Stories+") {
        metadata = await processSynced(metadata, selectedSticky.id);
    }
    await writeData(metadata);
});

const cleanUp = () => {
    pinIcon.classList.remove("color-primary");
    footer.classList.add("hide");
    pinned = false;
    enableFrameAdd = false;
}

const renderList = async (frames, aliases) => { //Frame ID's to render
    const widgets = await miro.board.widgets.get();
    const listWidgets = frames.map(frameId => widgets.find(widget => widget.id === frameId));
    list.innerHTML = '';
    listWidgets.map((listItem, index) => {
        let element = getListItem(aliases[index], frames[index], !Boolean(listItem));
        list.appendChild(element);
    });
    contextMenu.classList.add("hide");
}

const addFrame = async (selectedFrame) => {

    let metadata = await readData();

    let newFrames = (metadata[selectedSticky.id]?.frames || []);
    newFrames.push(selectedFrame.id);
    let newAliases = (metadata[selectedSticky.id]?.aliases || []);
    newAliases.push(selectedFrame.title);

    metadata[selectedSticky.id] = {
        ...(metadata[selectedSticky.id] || {}),
        frames: newFrames,
        aliases: newAliases
    };

    await renderList(newFrames, newAliases);

    if (getAppName() === "Lean Stories+") {
        metadata = await processSynced(metadata, selectedSticky.id);
    }
    await writeData(metadata);
}

async function getWidget() {

    const widgets = await miro.board.selection.get();
    const selectedWidget = widgets[0];

    if (enableFrameAdd) {
        handleSetFrame(selectedWidget);
    }
    else if (selectedWidget && selectedWidget.type === "STICKER" && !pinned) {
        showFrameData(selectedWidget);
    }

}

const handleSetFrame = (selectedWidget) => {

    if (!selectedWidget || selectedWidget.type !== "FRAME") {
        miro.showErrorNotification('Select a frame to set');
    }
    else {
        addFrame(selectedWidget);
        enableFrameAdd = false;
    }
    return;

}

const showFrameData = async (selectedWidget) => {

    let metadata = await readData();
    widgetText.innerText = selectedWidget.plainText;
    selectedSticky = selectedWidget;
    defaultText.classList.add("hide");
    widgetTextContainer.classList.remove("hide");
    renderList(metadata[selectedWidget.id]?.frames || [], metadata[selectedWidget.id]?.aliases || []);

}