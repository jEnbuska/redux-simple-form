import React from 'react';
import {object, func, } from 'prop-types';
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
    findProperties,
    parseDefinition,
    $any,
    mergeStateWithShape,
    createStateFromShape,
} from './utils';

const { entries, assign, defineProperties, } = Object;
let forms = 0;

const connector = (Component, { shape, initialState, formReducer = 'form', form = `form${forms++}`, actions = 'actions', }) => {
    const formInputShape = parseDefinition(shape, form);
    let dispatch;
    return class FormConnect extends React.Component {
        static contextTypes = {
            store: object,
        };

        formSubscription;
        initialStateSubscription;

        componentWillMount() {
            const { dispatch: d, getState, subscribe, } = this.context.store;
            dispatch = d;
            const formState = initialState && initialState(getState());
            if (formState) {
                console.log({ formState });
                const value = mergeStateWithShape(formState, formInputShape);

                dispatch({ type: SET_INITIAL_STATE, payload: { form, value, }, });
            } else {
                const value = createStateFromShape(formInputShape);
                dispatch({ type: INIT_FORM, payload: { form, value, }, });
                if (initialState) {
                    this.initialStateSubscription = subscribe(() => {
                        const formState = initialState(getState());
                        if (formState) {
                            this.initialStateSubscription();
                            delete this.initialStateSubscription;
                            const value = mergeStateWithShape(formState, formInputShape);
                            dispatch({ type: SET_INITIAL_STATE, payload: { form, value, }, });
                        }
                    });
                }
            }
            let prevForm = getState()[formReducer][form];
            let componentProps = this.mergeActionsWithFormState(prevForm, formInputShape);
            this.setState({ componentProps, });
            this.formSubscription = subscribe(() => {
                const formState = getState()[formReducer][form];
                if (formState !== prevForm) {
                    componentProps = this.mergeActionsWithFormState(formState, formInputShape, prevForm, componentProps);
                    prevForm = formState;
                    this.setState({ componentProps, });
                }
            });
        }

        mergeActionsWithFormState(subForm, subShape, preSubForm = {}, prevState = {}, path = []) {
            const { __meta__, input, ...rest } = subForm;
            if (__meta__) {
                if (input.onFocus) {
                    return { ...rest, input, };
                }
                return {
                    ...rest,
                    input: {
                        ...input,
                        onFocus: FormConnect.createOnFocus(path),
                        onBlur: FormConnect.createEvent(ON_BLUR, path),
                        onChange: FormConnect.createOnChange(path).bind(this),
                        onMouseOver: FormConnect.createEvent(ON_MOUSE_OVER, path),
                        onMouseOut: FormConnect.createEvent(ON_MOUSE_OUT, path),
                    },
                };
            }
            const result = entries(subForm)
                .filter(([k]) => subShape[k] || subShape[$any])
                .filter(([k,]) => subForm[k] || subForm[$any])
                .reduce((acc, [name, value,]) => {
                    if (preSubForm[name] === value) {
                        return assign(acc, { [name]: prevState[name], });
                    }
                    const mergeResult = {
                        [name]: this.mergeActionsWithFormState(
                            value,
                            subShape[name] || subShape[$any],
                            preSubForm[name],
                            prevState[name],
                            [...path, name,]
                        ),
                    };
                    return assign(acc, mergeResult);
                }, {});
            if (!result[actions]) {
                defineProperties(result, {
                    [actions]: {
                        enumerable: false,
                        value: {
                            writable: false,
                            onAssign: FormConnect.createOnAssign(path),
                            onRemove: FormConnect.createOnRemove(path),
                            getState() {
                                return FormConnect.getState(subForm);
                            },
                        },
                    },
                });
            }
            return result;
        }

        render() {
            const { componentProps } = this.state;
            return (<Component
              {...this.props}
              {...{ form: componentProps, }}/>);
        }

        static getState(componentProps, acc = {}) {
            const { __meta__, input, } = componentProps;
            if (__meta__) {
                const { type, value, checked, } = input;
                if (type === 'checkbox') {
                    return checked;
                }
                return value;
            }
            return entries(componentProps)
                .reduce((acc, [k, v, ]) => assign(acc, { [k]: FormConnect.getState(v), }), acc);
        }

        static createOnFocus(path) {
            return function onFocusProxy() {
                dispatch({ type: ON_FOCUS, payload: { form, path, }, });
            };
        }

        static createOnChange(path) {
            return function onChangeProxy(event) {
                const { format, validate, } = findProperties(path, formInputShape);
                const { input } = findProperties(path, this.state.componentProps);
                let invalid = false;
                let nextVal;
                if (input.type === 'checkbox') {
                    nextVal = !input.checked;
                } else {
                    nextVal = event.target ? event.target.value : event;
                }
                if (format) {
                    nextVal = format(nextVal);
                }
                if (validate) {
                    invalid = !(validate.test ? validate.test(nextVal) : validate(nextVal));
                }
                if (input.type === 'checkbox') {
                    dispatch({ type: ON_CHECK_CHANGE, payload: { form, path, checked: nextVal, invalid } });
                } else {
                    dispatch({ type: ON_CHANGE, payload: { form, path, value: nextVal, invalid } });
                }
            };
        }

        static createEvent(type, path) {
            return function eventProxy() {
                dispatch({ type, payload: { form, path, }, });
            };
        }

        static createOnRemove(path) {
            return function onRemoveProxy(key) {
                dispatch({ type: ON_REMOVE, payload: { form, path: [...path, key], } });
            };
        }

        static createOnAssign(path) {
            return function onAssignProxy(obj) {
                if (!obj || !(obj instanceof Object)) {
                    throw new Error('expect onAssign value to be instance of object');
                }
                const valueShape = findProperties(path, formInputShape);
                const value = mergeStateWithShape(obj, valueShape);
                dispatch({ type: ON_ASSIGN, payload: { form, path, value, }, });
            };
        }

        componentWillUnmount() {
            this.formSubscription();
            if (this.initialStateSubscription) {
                this.initialStateSubscription();
            }
            dispatch({ type: REMOVE_FORM, payload: { form, }, });
        }
    };
};

export default options => target => connector(target, options);