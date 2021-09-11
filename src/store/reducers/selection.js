import {
    SELECTION_CHANGED, DEFER_SELECTION, SET_DEFER_SELECTION,
    SET_CLIPBOARD_DATA, DELETE_CLIPBOARD_DATA, SET_WIDGET_TITLES,
    DELETE_WIDGETS
} from '../actions/selection';

export const selection = (state, action) => {
    switch (action.type) {
        case SELECTION_CHANGED:
            if (state.deferSelection) return { ...state, deferredSelection: action.payload };
            return { ...state, selection: action.payload };
        case DEFER_SELECTION:
            return { ...state, deferredSelection: action.payload };
        case SET_DEFER_SELECTION:
            if (!action.payload) {
                return { ...state, deferSelection: action.payload, deferredSelection: [] };
            }
            return { ...state, deferSelection: action.payload };
        case SET_CLIPBOARD_DATA:
            return {
                ...state,
                clipboardData: {
                    ...state.clipboardData,
                    createId: state.selection?.[0]?.id,
                    ...action.payload
                }
            };
        case DELETE_CLIPBOARD_DATA:
            return { ...state, clipboardData: {} };
        case SET_WIDGET_TITLES:
            return { ...state, widgetTitles: action.payload };
        case DELETE_WIDGETS:
            let selectionDeleted = action.payload.data.find(({ id }) =>
                id === state.selection?.[0]?.id);
            if (selectionDeleted) return { ...state, selection: [] };
            return state;
        default:
            return state;
    }
}
