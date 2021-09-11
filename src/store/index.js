import React, { useReducer } from 'react';
import { rootReducer } from './reducers/rootReducer';
import { initialState } from './initialState';

export const AppContext = React.createContext();

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(rootReducer, initialState);

    return (
        <AppContext.Provider value={[state, dispatch]}>
            {children}
        </AppContext.Provider>
    );
};
