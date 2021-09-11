
export const SELECTION_CHANGED = "SELECTION_CHANGED";
export const DEFER_SELECTION = "DEFER_SELECTION";
export const SET_DEFER_SELECTION = "SET_DEFER_SELECTION";
export const SET_CLIPBOARD_DATA = "SET_CLIPBOARD_DATA";
export const DELETE_CLIPBOARD_DATA = "DELETE_CLIPBOARD_DATA";
export const SET_WIDGET_TITLES = "SET_WIDGET_TITLES";
export const DELETE_WIDGETS = "DELETE_WIDGETS";

export const selectionChanged = (data) => {
    return { type: SELECTION_CHANGED, payload: data };
}

export const deferSelection = (data) => {
    return { type: DEFER_SELECTION, payload: data };
}

export const setDeferSelection = (data) => {
    return { type: SET_DEFER_SELECTION, payload: data };
}

export const setClipboardData = (data) => {
    return { type: SET_CLIPBOARD_DATA, payload: data };
}

export const deleteClipboardData = (data) => {
    return { type: DELETE_CLIPBOARD_DATA, payload: data };
}

export const setWidgetTitles = (data) => {
    return { type: SET_WIDGET_TITLES, payload: data };
}

export const handleWidgetsDelete = (data) => {
    return { type: DELETE_WIDGETS, payload: data };
}