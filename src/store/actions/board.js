
export const UPDATE_BOARD_INFO = "UPDATE_BOARD_INFO";
export const UPDATE_BOARD_WIDGETS = "UPDATE_BOARD_WIDGETS";
export const UPDATE_FIREBASE_WIDGETS = "UPDATE_FIREBASE_WIDGETS";

export const updateBoardInfo = (data) => {
    return { type: UPDATE_BOARD_INFO, payload: data }
}

export const updateBoardWidgets = (data) => {
    return { type: UPDATE_BOARD_WIDGETS, payload: data }
}

export const updateFirebaseWidgets = (data) => {
    return { type: UPDATE_FIREBASE_WIDGETS, payload: data }
}


