import { getSyncWidgets } from "../../services/miro/manipulate";
import { isEqual } from 'lodash';
import { getFirebaseWidgetForId } from "./helper";
const { miro } = window;

export const syncService = async (firebase, updateUI) => {

    // Get latest board widget data
    const boardWidgets = await getSyncWidgets();

    const firebaseWidgetsRef = await firebase.getBoard();
    let firebaseWidgets;
    if (firebaseWidgetsRef.exists) {
        firebaseWidgets = firebaseWidgetsRef.data();
    }

    if (!firebaseWidgetsRef.exists || !firebaseWidgets?.widgetData?.length) return;

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
                changeAttributes = getChanges(syncGroup[j].id, changedBoardWidget, changedWidget.syncAttributes);
            }
            let newWidget = getWidgetById(boardWidgets, syncGroup[j].id);

            for (let k = 0; k < changeAttributes.length; k++) {
                if (!getWidgetById(firebaseWidgets.widgetData, syncGroup[j].id).syncAttributes.includes(changeAttributes[k])) continue;
                switch (changeAttributes[k]) {
                    case "TEXT": newWidget['plainText'] = changedBoardWidget['plainText'];
                        newWidget['text'] = changedBoardWidget['text'];
                        newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "plainText", changedBoardWidget['plainText']);
                        newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "text", changedBoardWidget['text']);
                        break;
                    case "STYLE": newWidget['style'] = changedBoardWidget['style'];
                        newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "style", changedBoardWidget['style']);
                        break;
                    case "TAG": newWidget['tags'] = changedBoardWidget['tags'];
                        newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "tags", changedBoardWidget['tags']);
                        await syncTags(changedWidget.id, syncGroup[j].id);
                        break;
                    case "DIM": newWidget['scale'] = changedBoardWidget['scale'];
                        newFirebaseData = updateWidgetData(newFirebaseData, syncGroup[j].id, "scale", changedBoardWidget['scale']);
                        break;
                    default: break;
                }
            }
            if (changeAttributes.length) {
                await miro.board.widgets.update(newWidget);
            }
        }
    }

    await firebase.writeData({ widgetData: newFirebaseData });
    updateUI();
}

const syncTags = async (sourceWidgetId, destinationWidgetId) => {
    const boardTags = await miro.board.tags.get();
    const newBoardTags = boardTags.map(tag => {
        if (tag.widgetIds.includes(sourceWidgetId) && !tag.widgetIds.includes(destinationWidgetId)) {
            return {
                ...tag,
                widgetIds: [...tag.widgetIds, destinationWidgetId]
            }
        }
        return tag;
    });
    await miro.board.tags.update(newBoardTags);
}

const hasWidgetChanged = (widget, boardWidgets) => {

    const { syncAttributes } = widget;
    const boardWidget = getWidgetById(boardWidgets, widget.id);

    let changes = syncAttributes.find(attribute => {
        switch (attribute) {
            case "TEXT": return widget.plainText !== boardWidget.plainText || widget.text !== boardWidget.text;
            case "STYLE": return !isEqual(widget.style, boardWidget.style);
            case "TAG": return !isEqual(widget.tags, boardWidget.tags);
            case "DIM": return widget.scale !== boardWidget.scale;
            default: return false;
        }
    });

    return Boolean(changes);
}

const getChanges = (firebaseWidget, changedBoardWidget, syncAttributes) => {
    let changedAttributes = [];
    syncAttributes.forEach(attribute => {
        switch (attribute) {
            case "TEXT": if (changedBoardWidget.plainText !== firebaseWidget.plainText) changedAttributes.push(attribute);
                break;
            case "STYLE": if (!isEqual(changedBoardWidget.style, firebaseWidget.style)) changedAttributes.push(attribute);
                break;
            case "TAG": if (!isEqual(changedBoardWidget.tags, firebaseWidget.tags)) changedAttributes.push(attribute);
                break;
            case "DIM": if (changedBoardWidget.scale !== firebaseWidget.scale) changedAttributes.push(attribute);
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