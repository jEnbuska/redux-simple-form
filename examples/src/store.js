import {combineReducers, createStore, } from 'redux';
import form from '../../src/reducer';

function user(state = null, { type }) {
    if (type === 'SET_USER') {
        return {
            firstname: 'John',
            lastname: 'Doe',
            address: { street: '', zip: '', city: 'Helsinki', },
            mood: 8,
            gender: '',
            password: 'pass',
            favoriteFood: 'Spaghetti',
            todos: {},
        };
    }
    return state;
}

const rootReducer = combineReducers({ form, user, });

const store = createStore(rootReducer, window.devToolsExtension && window.devToolsExtension());
export default store;

setTimeout(() => store.dispatch({type: 'SET_USER'}), 4000);
