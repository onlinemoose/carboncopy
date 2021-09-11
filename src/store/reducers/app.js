import { UPDATE_APP_ID } from '../actions/app';

export const app = (state, action) => {
    switch (action.type) {
        case UPDATE_APP_ID:
            return { ...state, appId: action.payload };
        default:
            return state;
    }
}
