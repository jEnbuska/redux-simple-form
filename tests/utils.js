
export function buildLeaf({ value, initial = value, checked = true, name, ...params }) {
    return { __meta__: true, initial, left: false, input: { checked, value, name, }, invalid: false, visited: false, active: false, changed: false, ...params, };
}

export function createFormLeaf(name, value, checked) {
    if (checked === undefined) {
        checked = !!value;
    }
    const bool = typeof value === 'boolean';
    return {
        [name]: {
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
        },
    };
}