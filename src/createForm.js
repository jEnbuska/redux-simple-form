import React from 'react';
import { object, func, } from 'prop-types';
import {
    ON_FOCUS,
    INIT_FORM,
    SET_INITIAL_STATE,
    REMOVE_FORM,
    ON_ASSIGN,
    ON_BLUR,
    ON_CHANGE,
    ON_REMOVE,
    ON_CHECK_CHANGE,
    ON_MOUSE_OVER,
    ON_MOUSE_OUT,
} from './reducer';
import {
    formatRawValueRecursively,
    createInvalidityRecursively,
    findProperties,
} from './utils';

const { entries, assign, } = Object;
let forms = 0;

const connector = (Component, { emptyState, validate = {}, format = {}, initialState, formReducer = 'form', form = 'form' + forms++, actions = 'actions', }) => {
    let dispatch;
    return class FormConnect extends React.Component {

        static contextTypes = {
            store: object,
        };

        formSubscription;
        initialStateSubscription;
        state = {};

        componentWillMount () {
            const { dispatch: d, getState, subscribe, } = this.context.store;
            dispatch = d;
            let formState = initialState && initialState(getState());
            const value = formatRawValueRecursively(formState || emptyState, format);
            const invalidity = createInvalidityRecursively(value, validate);
            dispatch({ type: INIT_FORM, payload: { form, invalidity, value, }, });
            if (!formState && initialState) {
                this.initialStateSubscription = subscribe(() => {
                    const formState = initialState(getState());
                    if (formState) {
                        this.initialStateSubscription();
                        delete this.initialStateSubscription;
                        const value = formatRawValueRecursively(formState, format);
                        const invalidity = createInvalidityRecursively(value, validate);
                        dispatch({ type: SET_INITIAL_STATE, payload: { form, invalidity, value, }, });
                    }
                });
            }
            let prevForm = getState()[formReducer][form];
            let componentProps = this.mergeActionsWithFormState(prevForm);
            this.setState({ componentProps, });
            this.formSubscription = subscribe(() => {
                const formState = getState()[formReducer][form];
                if (formState !== prevForm) {
                    componentProps = this.mergeActionsWithFormState(formState, prevForm, componentProps);
                    prevForm = formState;
                    this.setState({ componentProps, });
                }
            });
        }

        mergeActionsWithFormState (subForm, preSubForm = {}, prevState = {}, path = []) {
            const { __meta__, input, } = subForm;
            if (__meta__) {
                return {
                    ...subForm,
                    input: {
                        ...input,
                        onFocus: FormConnect.createOnFocus(path),
                        onBlur: FormConnect.createEvent(ON_BLUR, path),
                        onChange: FormConnect.createOnChange(path).bind(this),
                        onMouseOver: FormConnect.createEvent(ON_MOUSE_OVER, path),
                        onMouseOut: FormConnect.createEvent(ON_MOUSE_OUT, path),
                    },
                };
            } else {
                const result = entries(subForm)
                    .reduce((acc, [ k, v, ]) => {
                        if (preSubForm[k] === v) {
                            return assign(acc, { [k]: prevState[k], });
                        }
                        return assign(acc, { [k]: this.mergeActionsWithFormState(v, preSubForm[k], prevState[k], [ ...path, k, ]), });
                    }, {});
                Object.defineProperties(result, {
                    [actions]: {
                        enumerable: false,
                        value: {
                            onAssign: FormConnect.createOnAssign(path),
                            onRemove: FormConnect.createEvent(ON_REMOVE, path),
                            getState () {
                                return FormConnect.getState(subForm);
                            },
                        },

                    },
                });
                return result;
            }
        }

        render () {
            return (<Component
                {...this.props}
                {...{ form: this.state.componentProps, }}/>);
        }

        static getState (componentProps, acc = {}) {
            if (componentProps.__meta__) {
                return componentProps.input.value;
            }
            return entries(componentProps)
                .reduce((acc, [ k, v, ]) => assign(acc, { [k]: FormConnect.getState(v), }), acc);
        }

        static createOnFocus (path) {
            return function onFocusProxy () {
                dispatch({ type: ON_FOCUS, payload: { form, path, }, });
            };
        }

        static createOnChange (path) {
            return function onChangeProxy (event) {
                const formatter = findProperties(path, format);
                const validator = findProperties(path, validate);
                let invalid = false;
                let { value, } = event.target || { value: event, };
                if (formatter) {
                    value = formatter(value);
                }
                switch (event.target && event.target.type) {
                    case 'password':
                    case 'number':
                    case 'radio':
                    case 'text': {
                        if (validator) invalid = !(validator.test ? validator.test(value) : validator(value));
                        dispatch({ type: ON_CHANGE, payload: { value, path, form, invalid, }, });
                        break;
                    }
                    case 'checkbox': {
                        const { input: { checked, }, }= findProperties(path, this.state.componentProps);
                        if (validator) invalid = validator(!checked);
                        dispatch({ type: ON_CHECK_CHANGE, payload: { invalid, checked: !checked, form, path, }, });
                        break;
                    }
                    default:
                        if (validator) invalid = !(validator.test ? validator.test(value) : validator(value));
                        dispatch({ type: ON_CHANGE, payload: { value, path, form, invalid, }, });
                }
            };
        }

        static createEvent (type, path) {
            return function eventProxy () {
                dispatch({ type, payload: { form, path, }, });
            };
        }

        static createOnAssign (path) {
            return function onAssignProxy (value) {
                const formatter = findProperties(path, format);
                const validator = findProperties(path, validate);
                if (!value || !(value instanceof Object)) {
                    throw new Error('expect onAssign value to be instance of object');
                }
                value = formatRawValueRecursively(value, formatter);
                const invalidity = createInvalidityRecursively(value, validator);
                dispatch({ type: ON_ASSIGN, payload: { form, path, value, invalidity, }, });
            };
        }

        componentWillUnmount () {
            this.formSubscription();
            if (this.initialStateSubscription) {
                this.initialStateSubscription();
            }
            dispatch({ type: REMOVE_FORM, payload: { form, }, });
        }
    };
};

export default (options) => (target) => connector(target, options);