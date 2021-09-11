import { UPDATE_BOARD_INFO, UPDATE_BOARD_WIDGETS, UPDATE_FIREBASE_WIDGETS } from '../actions/board';

export const board = (state, action) => {
    switch (action.type) {
        case UPDATE_BOARD_INFO:
            return { ...state, boardInfo: action.payload };
        case UPDATE_BOARD_WIDGETS:
            return { ...state, boardWidgets: action.payload };
        case UPDATE_FIREBASE_WIDGETS:
            return { ...state, firebaseWidgets: action.payload };
        default:
            return state;
    }
}
