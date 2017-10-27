import {DefinitionBuilder, } from './DefinitionBuilder';

export const $any = '__any__';

const { entries, assign, keys, } = Object;

export function parseDefinition(shape, name) {
    if (shape && shape instanceof DefinitionBuilder) {
        const { input } = shape.options;
        if (input.name) {
            return { ...shape.options, __meta__: true, };
        }
        return { ...shape.options, __meta__: true, input: { ...input, name } };
    }
    if (name === $any) {
        return { [$any]: parseDefinition(shape[0]) };
    }
    return entries(shape).reduce((acc, [k, v, ]) => {
        if (v instanceof Array) {
            if (v.length !== 1) {
                throw new Error(`Invalid array shape ${k}, under ${name}. Expected to have 1 child`);
            }
            return assign(acc, { [k]: { [$any]: parseDefinition(v[0]) }, });
        } else if (k === $any) {
            return assign(acc, { [k]: { [$any]: parseDefinition(v) }, });
        }
        return assign(acc, { [k]: parseDefinition(v, k), });
    }, {});
}

export function findProperties(path, properties) {
    let property = properties;
    for (const k of path) {
        property = property[k] || property[$any];
        if (!property) {
            return;
        }
    }
    return property;
}

export function mergeStateWithShape(state = '', shape = {}) {
    if (shape.__meta__) {
        const { __meta__, input } = shape;
        const { value, checked, invalid, } = formatAndValidateRawState(state, shape);
        return createInputMetas({ __meta__, invalid, input: { ...input, checked, value, }, });
    }
    return keys({ ...state, ...shape })
        .filter(k => k !== $any && (shape[k] || shape[$any]))
        .reduce(
            (acc, k) =>
                assign(acc, { [k]: mergeStateWithShape(state[k], shape[k] || shape[$any]), }),
            shape instanceof Array ? [] : {}
        );
}

export function createStateFromShape(shape) {
    if (shape.__meta__) {
        const { __meta__, input, } = shape;
        const { checked, invalid, value, } = formatAndValidateRawState(input.value, shape);
        return createInputMetas({ __meta__, invalid, input: { ...input, checked, value, }, });
    }
    return entries(shape)
        .filter(([k]) => k !== $any)
        .reduce(
            (acc, [k, v, ]) =>
                assign(acc, { [k]: createStateFromShape(v), }),
            shape instanceof Array ? [] : {}
        );
}

export function formatAndValidateRawState(primitive, { format, validate, input: { type }, }) {
    let invalid = false;
    if (format) {
        primitive = format(primitive);
    }
    if (validate) {
        invalid = !validate(primitive);
    }
    primitive = primitive || (type === 'number' ? 0 : type === 'checkbox' ? false : '');
    return { [type === 'checkbox' ? 'checked' : 'value']: primitive, invalid, };
}

export function createInputMetas(override = {}) {
    const { type, checked, value } = override.input;
    return {
        __meta__: true,
        visited: false,
        active: false,
        changed: false,
        left: false,
        invalid: false,
        initial: type === 'checkbox' ? checked : value,
        ...override,
    };
}