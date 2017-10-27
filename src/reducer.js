
export const INIT_FORM = 'FORM_REDUCER@INIT_FORM';
export const SET_INITIAL_STATE = 'FORM_REDUCER@SET_INITIAL_STATE';
export const REMOVE_FORM = 'FORM_REDUCER@REMOVE_FORM';
export const ON_CHANGE = 'FORM_REDUCER@ON_CHANGE';
export const ON_FOCUS = 'FORM_REDUCER@ON_FOCUS';
export const ON_BLUR = 'FORM_REDUCER@ON_BLUR';
export const ON_ASSIGN = 'FORM_REDUCER@ON_ASSIGN';
export const ON_REMOVE = 'FORM_REDUCER@ON_REMOVE';
export const ON_SUBMIT = 'FORM_REDUCER@ON_SUBMIT ';
export const ON_INVALID_SUBMIT = 'FORM_REDUCER@ON_INVALID_SUBMIT';
export const ON_CHECK_CHANGE = 'FORM_REDUCER@ON_CHECK_CHANGE';
export const ON_MOUSE_OVER = 'FORM_REDUCER@ON_MOUSE_OVER';
export const ON_MOUSE_OUT = 'FORM_REDUCER@ON_MOUSE_OUT';
export const ON_SUBMIT_SUCCESS = 'FORM_REDUCER@ON_SUBMIT_SUCCESS';
export const CLEAR_FORM_STATE = 'FORM_REDUCER@CLEAR_FORM';

export default function form(state = {}, { type, payload, }) {
    switch (type) {
    case INIT_FORM: {
        const { form, value, } = payload;
        return { ...state, [form]: { initialized: false, ...value }, };
    }
    case SET_INITIAL_STATE: {
        const { form, value, } = payload;
        return { ...state, [form]: { initialized: true, ...value }, };
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
            invalid,
            input: { ...input, value, },
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
            invalid,
            input: { ...input, checked, },
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
        const { form, path, value, } = payload;
        const { copy, changeTarget, } = pathCopy(state[form], path.slice(0, path.length - 1));
        const target = path[path.length - 1];
        changeTarget[target] = { ...changeTarget[target], ...value };
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
    case ON_SUBMIT: {
        const { form, } = payload;
        return { ...state, [form]: { ...state[form], submitting: true, }, };
    }
    case ON_INVALID_SUBMIT: {
        const { form, } = payload;
        return { ...state, [form]: { ...state[form], invalidSubmit: true, submitting: false, }, };
    }
    case ON_SUBMIT_SUCCESS: {
        const { form, } = payload;
        return {
            ...state,
            [form]: { ...state[form], invalidSubmit: false, submitting: false, submitSuccess: true },
        };
    }
    case CLEAR_FORM_STATE: {
        const { form, } = payload;
        return {
            ...state,
            [form]: { ...state[form], invalidSubmit: false, submitting: false, submitSuccess: false },
        };
    }
    default:
        return state;
    }
}

function pathCopy(form, path) {
    const copy = { ...form, };
    let changeTarget = copy;
    for (const key of path) {
        const next = changeTarget[key];
        changeTarget = changeTarget[key] = { ...next, };
    }
    return { copy, changeTarget, };
}
