import { app } from './app';
import { board } from './board';
import { selection } from './selection';

const combineReducers = (...reducers) =>
    (state, action) => {
        for (let i = 0; i < reducers.length; i++)
            state = reducers[i](state, action)
        return state;
    }

export const rootReducer = combineReducers(app, board, selection);