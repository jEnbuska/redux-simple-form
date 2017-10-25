import React from 'react';
import ReactDOM from 'react-dom';
import MiscForm from './containers/MiscForm';
import { Provider, } from 'react-redux';
import { combineReducers, createStore, } from 'redux';
import form from '../../src/reducer';

const rootReducer = combineReducers({ form, });
const store = createStore(rootReducer, window.devToolsExtension && window.devToolsExtension());
const Root = () => (
    <Provider store={store}>
        <MiscForm />
    </Provider>
);

ReactDOM.render(<Root />, document.getElementById('root'));

