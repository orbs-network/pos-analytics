import { createStore, applyMiddleware, compose } from 'redux';

import { routerMiddleware } from 'connected-react-router';
import reduxThunk from 'redux-thunk';
import { createBrowserHistory } from 'history';

import reducers from '../reducers/reducers';
const history = createBrowserHistory();

const store = createStore(reducers(history), {}, compose(applyMiddleware(routerMiddleware(history), reduxThunk)));
export default store;
