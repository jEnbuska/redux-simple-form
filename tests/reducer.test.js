import form, { SET_INITIAL_STATE, ON_FOCUS, ON_CHANGE, ON_BLUR, ON_ASSIGN, ON_REMOVE, } from '../src/reducer';
import { buildLeaf, } from './utils';
import freeze from 'deep-freeze';
import { createFormLeaf, } from './utils';

const initialState = freeze({
    name: 'John',
    address: { street: 'Some road 1', city: 'Helsinki', zip: '00800', country: 'Finland', },
    todos: { 0: { description: 'Eat', done: false, }, 1: { description: 'Sleep', done: true, }, },
});

describe('reducer', () => {
    test('SET_INITIAL_STATE', () => {
        const nextState= form({}, { type: SET_INITIAL_STATE, payload: { form: 'test', value: initialState, }, });

        expect(nextState).toEqual({
            test: {
                ...createFormLeaf('name', 'John'),
                address: {
                    ...createFormLeaf('street', 'Some road 1'),
                    ...createFormLeaf('zip', '00800'),
                    ...createFormLeaf('city', 'Helsinki'),
                    ...createFormLeaf('country', 'Finland'),
                },
                todos: {
                    0: { ...createFormLeaf('description', 'Eat'), ...createFormLeaf('done', false), },
                    1: { ...createFormLeaf('description', 'Sleep'), ...createFormLeaf('done', true), },
                },
            },
        });
    });

    test('ON_FOCUS', () => {
        let nextState= form({}, { type: SET_INITIAL_STATE, payload: { form: 'test', value: initialState, }, });
        nextState = form(freeze(nextState), { type: ON_FOCUS, payload: { form: 'test', path: [ 'todos', '1', 'description', ], }, });
        expect(nextState).toEqual({
            test: {
                ...createFormLeaf('name', 'John', undefined, 'name'),
                address: {
                    ...createFormLeaf('street', 'Some road 1', undefined, 'street'),
                    ...createFormLeaf('zip', '00800', undefined, 'zip'),
                    ...createFormLeaf('city', 'Helsinki', undefined, 'city'),
                    ...createFormLeaf('country', 'Finland', undefined, 'country'),
                },
                todos: {
                    0: { ...createFormLeaf('description', 'Eat', undefined, 0), ...createFormLeaf('done', false), },
                    1: { description: buildLeaf({ name: 'description', value: 'Sleep', visited: true, active: true, }),
                        ...createFormLeaf('done', true), },
                },
            },
        });
    });

    test('ON_CHANGE', () => {
        let nextState= form({}, { type: SET_INITIAL_STATE, payload: { form: 'test', value: initialState, }, });
        nextState = form(freeze(nextState), { type: ON_CHANGE, payload: { form: 'test', path: [ 'address', 'street', ], value: 'Some other road 2', invalid: true, }, });
        expect(nextState).toEqual({
            test: {
                ...createFormLeaf('name', 'John'),
                address: {
                    street: buildLeaf({ name: 'street', initial: 'Some road 1', value: 'Some other road 2', changed: true, checked: true, invalid: true, }),
                    ...createFormLeaf('zip', '00800'),
                    ...createFormLeaf('city', 'Helsinki'),
                    ...createFormLeaf('country', 'Finland'),
                },
                todos: {
                    0: { ...createFormLeaf('description', 'Eat'), ...createFormLeaf('done', false), },
                    1: { ...createFormLeaf('description', 'Sleep'), ...createFormLeaf('done', true), },
                },
            },
        });
        nextState = form(freeze(nextState), { type: ON_CHANGE, payload: { form: 'test', path: [ 'address', 'zip', ], value: '00500', invalid: false, }, });
        expect(nextState).toEqual({
            test: {
                ...createFormLeaf('name', 'John'),
                address: {
                    street: buildLeaf({ name: 'street', initial: 'Some road 1', value: 'Some other road 2', changed: true, checked: true, invalid: true, }),
                    zip: buildLeaf({ name: 'zip', initial: '00800', value: '00500', checked: true, changed: true, }),
                    ...createFormLeaf('city', 'Helsinki'),
                    ...createFormLeaf('country', 'Finland'),
                },
                todos: {
                    0: { ...createFormLeaf('description', 'Eat'), ...createFormLeaf('done', false), },
                    1: { ...createFormLeaf('description', 'Sleep'), ...createFormLeaf('done', true), },
                },
            },
        });
    });

    test('ON_BLUR', () => {
        let nextState= form({}, { type: SET_INITIAL_STATE, payload: { form: 'test', value: initialState, }, });
        nextState = form(freeze(nextState), { type: ON_BLUR, payload: { form: 'test', path: [ 'todos', 1, 'description', ], }, });

        expect(nextState).toEqual({
            test: {
                ...createFormLeaf('name', 'John'),
                address: {
                    ...createFormLeaf('street', 'Some road 1'),
                    ...createFormLeaf('zip', '00800'),
                    ...createFormLeaf('city', 'Helsinki'),
                    ...createFormLeaf('country', 'Finland'),
                },
                todos: {
                    0: { ...createFormLeaf('description', 'Eat'), ...createFormLeaf('done', false), },
                    1: { description: buildLeaf({ name: 'description', value: 'Sleep', left: true, active: false, }), ...createFormLeaf('done', true), },
                },
            },
        });
    });

    test('ON_ASSIGN', () => {
        let nextState= form({}, { type: SET_INITIAL_STATE, payload: { form: 'test', value: initialState, }, });
        nextState = form(freeze(nextState), { type: ON_ASSIGN, payload: { form: 'test', path: [ 'address', ], value: { email: 'email@com', }, invalidity: { email: true, }, }, });
        expect(nextState).toEqual({
            test: {
                ...createFormLeaf('name', 'John'),
                address: {
                    ...createFormLeaf('street', 'Some road 1'),
                    ...createFormLeaf('zip', '00800'),
                    ...createFormLeaf('city', 'Helsinki'),
                    ...createFormLeaf('country', 'Finland'),
                    email: buildLeaf({ name: 'email', value: 'email@com', invalid: true, }),
                },
                todos: {
                    0: { ...createFormLeaf('description', 'Eat'), ...createFormLeaf('done', false), },
                    1: { ...createFormLeaf('description', 'Sleep'), ...createFormLeaf('done', true), },
                },
            },
        });
    });

    test('ON_REMOVE object from object', () => {
        let nextState= form({}, { type: SET_INITIAL_STATE, payload: { form: 'test', value: initialState, }, });
        nextState = form(freeze(nextState), { type: ON_REMOVE, payload: { form: 'test', path: [ 'address', ], }, });
        expect(nextState).toEqual({
            test: {
                ...createFormLeaf('name', 'John'),
                todos: {
                    0: { ...createFormLeaf('description', 'Eat'), ...createFormLeaf('done', false), },
                    1: { ...createFormLeaf('description', 'Sleep'), ...createFormLeaf('done', true), },
                },
            },
        });
    });

    test('ON_REMOVE leaf from object', () => {
        let nextState= form({}, { type: SET_INITIAL_STATE, payload: { form: 'test', value: initialState, }, });
        nextState = form(freeze(nextState), { type: ON_REMOVE, payload: { form: 'test', path: [ 'todos', 1, 'description', ], }, });
        expect(nextState).toEqual({
            test: {
                ...createFormLeaf('name', 'John'),
                address: {
                    ...createFormLeaf('street', 'Some road 1'),
                    ...createFormLeaf('zip', '00800'),
                    ...createFormLeaf('city', 'Helsinki'),
                    ...createFormLeaf('country', 'Finland'),
                },
                todos: {
                    0: { ...createFormLeaf('description', 'Eat'), ...createFormLeaf('done', false), },
                    1: {  ...createFormLeaf('done', true), },
                },
            },
        });
    });
});

