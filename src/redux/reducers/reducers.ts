import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { delegatorReducer } from './delegator';
import { guardiansReducer } from './guardians';
import { overviewReducer } from './overview';
import {mainReducer} from './global'

const rootReducer = (history: any) =>
    combineReducers({
        router: connectRouter(history),
        main: mainReducer,
        delegator: delegatorReducer,
        guardians: guardiansReducer,
        overview: overviewReducer
    });

export default rootReducer;
