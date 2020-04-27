import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import api from './middleware/api';

import rootReducer from './reducers';

const initialState = {};
const middleware = [thunk, api];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware)),
);

export default store;