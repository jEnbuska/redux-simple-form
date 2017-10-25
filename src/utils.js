export const $any = '__any__';

const { entries, assign, } = Object;
export function isLeaf (value) {
    const type = typeof value;
    return !value || type === 'string' || type === 'boolean';
}

export function isPrimitive (value) {
    const type = typeof value;
    return !value|| type === 'string' || type === 'boolean' || type === 'number';
}

export function checkLeafInvalidity (validator, val) {
    if (validator) {
        if (validator.test) {
            return !validator.test(val);
        } else {
            return !validator(val);
        }
    }
    return false;
}
export function getEventValue (e) {
    if (e && e.target) {
        return e.target.value;
    }
    return e;
}

export function findProperties (path, properties) {
    let property = properties;
    for (const k of path) {
        property = property[k] || property[$any];
        if (!property) {
            return;
        }
    }
    return property;
}

export function formatRawValueRecursively (value, format) {
    if (!format) {
        return value;
    } else if (isPrimitive(value)) {
        return format.format ? format.format(value) : value;
    }
    return entries(value).reduce((acc, [ k, v, ]) =>
        assign(acc, { [k]: formatRawValueRecursively(v, format[k] || format[$any]), }), {});
}

export function createInvalidityRecursively (value, props) {
    if (!props) {
        return {};
    }
    if (isPrimitive(value)) {
        return checkLeafInvalidity(props, value);
    }
    return entries(value).reduce((acc, [ k, v, ]) =>
        assign(acc, { [k]: createInvalidityRecursively(v, props[k] || props[$any]), }), {});
}