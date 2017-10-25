import { isPrimitive, } from './utils';

export const INIT_FORM = 'FORM_REDUCER@INIT_FORM';
export const SET_INITIAL_STATE = 'FORM_REDUCER@SET_INITIAL_STATE';
export const REMOVE_FORM = 'FORM_REDUCER@REMOVE_FORM';
export const ON_CHANGE = 'FORM_REDUCER@ON_CHANGE';
export const ON_FOCUS = 'FORM_REDUCER@ON_FOCUS';
export const ON_BLUR = 'FORM_REDUCER@ON_BLUR';
export const ON_ASSIGN = 'FORM_REDUCER@ON_ASSIGN';
export const ON_REMOVE = 'FORM_REDUCER@ON_REMOVE';
export const ON_INVALID_SUBMIT = 'FORM_REDUCER@ON_INVALID_SUBMIT';
export const ON_CHECK_CHANGE = 'FORM_REDUCER@ON_CHECK_CHANGE';
export const ON_MOUSE_OVER = 'FORM_REDUCER@ON_MOUSE_OVER';
export const ON_MOUSE_OUT = 'FORM_REDUCER@ON_MOUSE_OUT';

const { entries, } = Object;

export default function form (state = {}, { type, payload, }) {
    switch (type) {
        case SET_INITIAL_STATE:
        case INIT_FORM: {
            const { form, value, invalidity, } = payload;
            const formState = createMeta(value, form);
            insertInvalidity(formState, invalidity);
            return { ...state, [form]: formState, };
        }
        ON_INVALID_SUBMIT: {
            const { form, } = payload;
            return { ...state, [form]: { ...state[form], invalidSubmit: true, }, };
        }
        case ON_MOUSE_OVER: {
            const { form, path, } = payload;
            const { copy, changeTarget, } = pathCopy(state[form], path.slice(0, path.length - 1));
            const target = path[path.length - 1];
            changeTarget[target] = { ...changeTarget[target], mouseOver: true, };
            return { ...state, [form]: copy, };
        }
        case ON_MOUSE_OUT: {
            const { form, path, } = payload;
            const { copy, changeTarget, } = pathCopy(state[form], path.slice(0, path.length - 1));
            const target = path[path.length - 1];
            changeTarget[target] = { ...changeTarget[target], mouseOver: false, };
            return { ...state, [form]: copy, };
        }
        case ON_FOCUS: {
            const { form, path, } = payload;
            const { copy, changeTarget, } = pathCopy(state[form], path.slice(0, path.length - 1));
            const target = path[path.length - 1];
            changeTarget[target] = { ...changeTarget[target], active: true, visited: true, };
            return { ...state, [form]: copy, };
        }
        case ON_CHANGE: {
            const { form, path, value, invalid, } = payload;
            const { copy, changeTarget, } = pathCopy(state[form], path.slice(0, path.length - 1));
            const name = path[path.length - 1];
            const { input, } = changeTarget[name];
            changeTarget[name] = {
                ...changeTarget[name],
                changed: true,
                invalid: !!invalid,
                input: { ...input, value, checked: !!value, },
            };
            return { ...state, [form]: copy, };
        }
        case ON_CHECK_CHANGE: {
            const { form, path, checked, invalid, } = payload;
            const { copy, changeTarget, } = pathCopy(state[form], path.slice(0, path.length - 1));
            const name = path[path.length - 1];
            const { input, } = changeTarget[name];
            changeTarget[name] = {
                ...changeTarget[name],
                changed: true,
                invalid: !!invalid,
                input: { ...input, checked, value: checked, },
            };
            return { ...state, [form]: copy, };
        }
        case ON_BLUR: {
            const { form, path, } = payload;
            const { copy, changeTarget, } = pathCopy(state[form], path.slice(0, path.length - 1));
            const target = path[path.length - 1];
            changeTarget[target] = { ...changeTarget[target], active: false, left: true, };
            return { ...state, [form]: copy, };
        }
        case ON_ASSIGN: {
            const { form, path, value, invalidity, } = payload;
            const { copy, changeTarget, } = pathCopy(state[form], path.slice(0, path.length - 1));
            const child = createMeta(value, path[path.length - 1] || form);
            insertInvalidity(child, invalidity);
            const target = path[path.length - 1];
            changeTarget[target] = { ...changeTarget[target], ...child, };
            return { ...state, [form]: copy, };
        }
        case ON_REMOVE: {
            const { form, path, } = payload;
            const { copy, changeTarget, } = pathCopy(state[form], path.slice(0, path.length - 1));
            const target = path[path.length - 1];
            delete changeTarget[target];
            return { ...state, [form]: copy, };
        }
        case REMOVE_FORM: {
            const nextState = { ...state, };
            delete nextState[payload.form];
            return nextState;
        }
        default:
            return state;
    }
}

function createMeta (formValue, name) {
    if (isPrimitive(formValue)) {
        return createInitialLeafState(formValue, name);
    }
    return entries(formValue).reduce((acc, [ k, value, ]) => {
        acc[k] = createMeta(value, k);
        return acc;
    }, {});
}

function pathCopy (form, path) {
    let copy = { ...form, };
    let changeTarget = copy;
    for (const key of path) {
        const next = changeTarget[key];
        changeTarget = changeTarget[key] = { ...next, };
    }
    return { copy, changeTarget, };
}

function insertInvalidity (form, invalidity) {
    if (form.__meta__) {
        form.invalid = !!invalidity;
    } else if (invalidity) {
        for (const [ k, next, ] of entries(invalidity)) {
            insertInvalidity(form[k], next);
        }
    }
}

export function createInitialLeafState (value, name, checked = !!value) {
    const bool = typeof value === 'boolean';
    return {
        input: {
            value: bool ? '' : value || '',
            checked,
            name,
        },
        visited: false,
        active: false,
        changed: false,
        initial: bool ? value : value || '',
        left: false,
        invalid: false,
        __meta__: true,
    };
}