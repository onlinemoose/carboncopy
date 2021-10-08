import { getSyncWidgets } from "../../services/miro/manipulate";
import { isEqual } from 'lodash';
import { getFirebaseWidgetForId } from "./helper";
const { miro } = window;

export const syncService = async (firebase, updateUI) => {

    // Get latest board widget data
    const boardWidgets = await getSyncWidgets();
    const boardWidgetIds = boardWidgets.map(({ id }) => id);
    let syncTagData = await miro.board.tags.get();
    let syncTagFlag = false;

    const firebaseWidgetsRef = await firebase.getBoard();
    let firebaseWidgets;
    if (firebaseWidgetsRef.exists) {
        firebaseWidgets = firebaseWidgetsRef.data();
    }

    if (!firebaseWidgetsRef.exists || !firebaseWidgets?.widgetData?.length) return;

    firebaseWidgets.widgetData = firebaseWidgets.widgetData.filter(({ id }) => boardWidgetIds.includes(id));

    const modifiedWidgets = firebaseWidgets.widgetData.filter(widget => hasWidgetChanged(widget, boardWidgets));

    if (!modifiedWidgets.length) return;
    let newFirebaseData = Array.from(firebaseWidgets.widgetData);
    for (let i = 0; i < modifiedWidgets.length; i++) {
        const changedWidget = modifiedWidgets[i];
        const syncGroupIds = getFirebaseWidgetForId(changedWidget.id, firebaseWidgets).map(({ id }) => id);
        const syncGroup = boardWidgets.filter(({ id }) => syncGroupIds.includes(id));
        const changedBoardWidget = getWidgetById(boardWidgets, changedWidget.id);

        for (let j = 0; j < syncGroup.length; j++) {
            let changeAttributes;
            if (changedWidget.id === syncGroup[j].id) {
                changeAttributes = getChanges(changedWidget, changedBoardWidget, changedWidget.syncAttributes);
            } else {
                changeAttributes = getChanges(syncGroup[j], changedBoardWidget, changedWidget.syncAttributes);
            }
            let newWidget = getWidgetById(boardWidgets, syncGroup[j].id);
            for (let k = 0; k < changeAttributes.length; k++) {
                if (!getWidgetById(firebaseWidgets.widgetData, syncGroup[j].id).syncAttributes.includes(changeAttributes[k])) continue;
                switch (changeAttributes[k]) {
                    case "TEXT":
                        if (Object.keys(newWidget).includes('plainText')) {
                            newWidget['plainText'] = changedBoardWidget['plainText'];
                            newWidget['text'] = changedBoardWidget['text'];
                            newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "plainText", changedBoardWidget['plainText']);
                            newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "text", changedBoardWidget['text']);
                        } else if (Object.keys(newWidget).includes('title')) {
                            newWidget['title'] = changedBoardWidget['title'];
                            newWidget['description'] = changedBoardWidget['description'];
                            newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "title", changedBoardWidget['title']);
                            newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "description", changedBoardWidget['description']);
                        }
                        break;
                    case "STYLE": newWidget['style'] = changedBoardWidget['style'];
                        newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "style", changedBoardWidget['style']);
                        break;
                    case "TAG": newWidget['tags'] = changedBoardWidget['tags'];
                        newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "tags", changedBoardWidget['tags']);
                        syncTagData = syncTags(syncTagData, changedWidget.id, syncGroup[j].id);
                        syncTagFlag = true;
                        break;
                    case "DIM":
                        if (changedBoardWidget.scale) {
                            newWidget['scale'] = changedBoardWidget['scale'];
                            newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "scale", changedBoardWidget['scale']);
                        }
                        if (changedBoardWidget.width) {
                            newWidget['width'] = changedBoardWidget['width'];
                            newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "width", changedBoardWidget['width']);
                        }
                        if (changedBoardWidget.height) {
                            newWidget['height'] = changedBoardWidget['height'];
                            newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "height", changedBoardWidget['height']);
                        }
                        break;
                    default: break;
                }
            }
            if (changeAttributes.length) {
                await miro.board.widgets.update(newWidget);
            }
        }
    }
    if (syncTagFlag) {
        await miro.board.tags.update(syncTagData);
    }
    await firebase.writeData({ widgetData: newFirebaseData });
    updateUI();
}

const syncTags = (boardTags, sourceWidgetId, destinationWidgetId) => {
    const newBoardTags = boardTags.map(tag => {
        if (tag.widgetIds.includes(sourceWidgetId) && !tag.widgetIds.includes(destinationWidgetId)) {
            return {
                ...tag,
                widgetIds: [...tag.widgetIds, destinationWidgetId]
            }
        }
        else if (!tag.widgetIds.includes(sourceWidgetId) && tag.widgetIds.includes(destinationWidgetId)) {
            return {
                ...tag,
                widgetIds: tag.widgetIds.filter(widId => widId !== destinationWidgetId)
            }
        }
        return tag;
    });
    return newBoardTags;
}

const hasWidgetChanged = (widget, boardWidgets) => {
    const { syncAttributes } = widget;
    const boardWidget = getWidgetById(boardWidgets, widget.id);

    let changes = syncAttributes.find(attribute => {
        switch (attribute) {
            case "TEXT": return widget.plainText !== boardWidget.plainText || widget.text !== boardWidget.text
                || widget.title !== boardWidget.title || widget.description !== boardWidget.description;
            case "STYLE": return !isEqual(widget.style, boardWidget.style);
            case "TAG": return !isEqual(sortTagObject(widget.tags), sortTagObject(boardWidget.tags));
            case "DIM": return widget.scale !== boardWidget.scale || widget.width !== boardWidget.width || widget.height !== boardWidget.height;
            default: return false;
        }
    });
    return Boolean(changes);
}

const sortTagObject = (tags) => {
    tags.sort((a, b) => a.id > b.id ? 1 : -1);
    return tags.map(({ color, id, title }) => ({ color, id, title }));
}

const getChanges = (firebaseWidget, changedBoardWidget, syncAttributes) => {
    let changedAttributes = [];
    syncAttributes.forEach(attribute => {
        switch (attribute) {
            case "TEXT": if (changedBoardWidget.plainText !== firebaseWidget.plainText
                || changedBoardWidget.text !== firebaseWidget.text
                || changedBoardWidget.title !== firebaseWidget.title
                || changedBoardWidget.description !== firebaseWidget.description) changedAttributes.push(attribute);
                break;
            case "STYLE": if (!isEqual(changedBoardWidget.style, firebaseWidget.style)) changedAttributes.push(attribute);
                break;
            case "TAG": if (!isEqual(sortTagObject(changedBoardWidget.tags), sortTagObject(firebaseWidget.tags))) changedAttributes.push(attribute);
                break;
            case "DIM":
                if (changedBoardWidget.scale !== firebaseWidget.scale
                    || changedBoardWidget.width !== firebaseWidget.width
                    || changedBoardWidget.height !== firebaseWidget.height) {
                    changedAttributes.push(attribute);
                }
                break;
            default: break;
        }
    });
    return changedAttributes;
}

const getWidgetById = (widgets, id) => {
    return widgets.find(widget => widget.id === id);
}

const updateWidgetData = (firebaseWidgets, id, type, value) => {
    return firebaseWidgets.map(widget => {
        if (widget.id === id) {
            return {
                ...widget,
                [type]: value
            }
        }
        return widget;
    })
}