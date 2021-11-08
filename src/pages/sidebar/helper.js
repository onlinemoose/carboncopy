import { widgetTypes } from "../../services/miro/consts";

export const elementTypes = {
    syncButton: 1,
    deSyncButton: 2,
    selectButton: 3,
    duplicateButton: 4,
    deleteButton: 5,
    viewParentLink: 6,
    parentWidget: 7,
    textCheckBox: 8,
    widgetStylesCheckBox: 9,
    tagsCheckBox: 10,
    textStylesCheckBox: 11,
    dimensionsCheckBox: 12

}

export const isParent = (selection, firebaseWidgets) => {
    const selectedIds = selection.map(({ id }) => id);
    const syncedWidgets = (firebaseWidgets?.widgetData || []).filter(({ id }) => selectedIds.includes(id));
    const syncIDs = [...new Set(syncedWidgets.map(({ syncID }) => syncID))];
    const syncGroupWidgets = (firebaseWidgets?.widgetData || []).filter(({ syncID }) => syncID === syncIDs[0]);
    const syncGroupWidgetIds = syncGroupWidgets.map(({ id }) => id).sort((a, b) => a > b ? 1 : -1);
    return syncGroupWidgetIds[0] === selectedIds[0];
}

export const getParent = (selection, firebaseWidgets) => {
    const selectedIds = selection.map(({ id }) => id);
    const syncedWidgets = (firebaseWidgets?.widgetData || []).filter(({ id }) => selectedIds.includes(id));
    const syncIDs = [...new Set(syncedWidgets.map(({ syncID }) => syncID))];
    const syncGroupWidgets = (firebaseWidgets?.widgetData || [])
        .filter(({ syncID }) => syncID === syncIDs[0])
        .sort((a, b) => a.id > b.id ? 1 : -1);

    return syncGroupWidgets[0];
}

export const isDisabled = (selection, type, firebaseWidgets) => {

    // No widgets selected
    if (!selection.length) return true;

    // Non syncable widgets
    const [firstElement] = selection;
    if (!Object.keys(widgetTypes).includes(firstElement.type)) return true;

    // Mix of widget types
    if ([...new Set(selection.map(({ type }) => type))].length > 1) return true;

    const selectedIds = selection.map(({ id }) => id);
    const syncedWidgets = (firebaseWidgets?.widgetData || []).filter(({ id }) => selectedIds.includes(id));

    if (syncedWidgets.length === 0 && type === elementTypes.syncButton) return false;

    // Selection includes non synced widgets
    if (selectedIds.length !== syncedWidgets.length) return true;

    const syncIDs = [...new Set(syncedWidgets.map(({ syncID }) => syncID))];

    // Different sync groups
    if (syncIDs.length > 1) return true;

    const isParentWidget = isParent(selection, firebaseWidgets);

    const parentWidget = getParent(selection, firebaseWidgets);

    switch (type) {
        case elementTypes.tagsCheckBox:
            if (!isParentWidget && !parentWidget.syncAttributes.includes("TAG")) return true;
            if (![widgetTypes.STICKER, widgetTypes.CARD].includes(firstElement.type)) {
                return true;
            }
            break;
        case elementTypes.textCheckBox: if (!isParentWidget && !parentWidget.syncAttributes.includes("TEXT")) return true;
            break;
        case elementTypes.widgetStylesCheckBox: if (!isParentWidget && !parentWidget.syncAttributes.includes("STYLE")) return true;
            break;
        case elementTypes.dimensionsCheckBox: if (!isParentWidget && !parentWidget.syncAttributes.includes("DIM")) return true;
            break;
        case elementTypes.viewParentLink:
            if (selectedIds.length > 1) return true;
            return isParentWidget;
        case elementTypes.parentWidget:
            if (selectedIds.length > 1) return true;
            return !isParentWidget;
        default: return false;
    }
}

const syncableAttributes = {
    TEXT: ["TEXT", "DIM", "STYLE"],
    STICKER: ["TEXT", "TAG", "DIM", "STYLE"],
    SHAPE: ["TEXT", "DIM", "STYLE"],
    CARD: ["TEXT", "TAG", "DIM", "STYLE"],
    LINE: ["TEXT", "DIM", "STYLE"]
};

export const formatSyncData = (data, id, syncAttributes) => {
    return data.map(record => {
        delete record.groupId;
        return {
            syncID: (id || new Date().getTime()),
            syncAttributes: (syncAttributes || syncableAttributes[record.type]),
            ...record
        };
    });
}

export const isOverlapping = (x, y, allWidgets, width, height) => {
    return Boolean(allWidgets.find(widget => (Math.abs(Math.abs(widget.x) - Math.abs(x)) <= width
        && Math.abs(Math.abs(widget.y) - Math.abs(y)) <= height)));
}

export const getFirebaseWidgetForSelection = (selection, firebaseWidgets) => {
    const selectedIds = selection.map(({ id }) => id);
    return (firebaseWidgets?.widgetData || []).filter(({ id }) => selectedIds.includes(id));
}

export const getFirebaseWidgetForId = (id, firebaseWidgets) => {
    const widget = (firebaseWidgets?.widgetData || []).find(wid => wid.id === id);
    return (firebaseWidgets?.widgetData || []).filter(wid => wid.syncID === widget?.syncID);
}

export const isChecked = (selection, type, firebaseWidgets) => {

    const firebaseWids = getFirebaseWidgetForSelection(selection, firebaseWidgets);

    if (!firebaseWids.length) return false;

    // const isParentWid = isParent(selection, firebaseWidgets);

    switch (type) {
        case elementTypes.textCheckBox: return Boolean(firebaseWids.filter(wid => wid.syncAttributes.includes('TEXT')).length);
        case elementTypes.widgetStylesCheckBox: return Boolean(firebaseWids.filter(wid => wid.syncAttributes.includes('STYLE')).length);
        case elementTypes.tagsCheckBox: return Boolean(firebaseWids.filter(wid => wid.syncAttributes.includes('TAG')).length);
        case elementTypes.dimensionsCheckBox: return Boolean(firebaseWids.filter(wid => wid.syncAttributes.includes('DIM')).length);
        default: break;
    }
    return false;
}

export const isIndeterminate = (selection, type, firebaseWidgets) => {

    if (selection.length < 2) return false;

    const wids = getFirebaseWidgetForSelection(selection, firebaseWidgets);
    if (!wids.length) return false;

    const firebaseWids = getFirebaseWidgetForId(selection[0].id, firebaseWidgets);
    if (!firebaseWids.length) return false;

    let checked;
    switch (type) {
        case elementTypes.textCheckBox: checked = firebaseWids.filter(wid => wid.syncAttributes.includes('TEXT')).length;
            break;
        case elementTypes.widgetStylesCheckBox: checked = firebaseWids.filter(wid => wid.syncAttributes.includes('STYLE')).length;
            break;
        case elementTypes.tagsCheckBox: checked = firebaseWids.filter(wid => wid.syncAttributes.includes('TAG')).length;
            break;
        case elementTypes.dimensionsCheckBox: checked = firebaseWids.filter(wid => wid.syncAttributes.includes('DIM')).length;
            break;
        default: break;
    }

    return checked !== firebaseWids.length;
};