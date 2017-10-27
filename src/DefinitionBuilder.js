export class DefinitionBuilder {
    constructor(options) {
        this.options = options;
    }

    format(format) {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, format, });
    }

    validate(validate) {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, validate, });
    }

    value(value) {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, input: { ...options.input, value }, });
    }

    get checked() {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, input: { ...options.input, checked: true }, });
    }

    min(min) {
        const { options, } = this;
        const value = Math.max(min, options.input.value);
        return new DefinitionBuilder({ ...options, input: { ...options.input, min, value }, });
    }

    max(max) {
        const { options, } = this;
        const value = Math.max(max, options.input.value);
        return new DefinitionBuilder({ ...options, input: { ...options.input, max, value }, });
    }

    pattern(pattern) {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, input: { ...options.input, pattern }, });
    }

    size(size) {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, input: { ...options.input, size }, });
    }

    step(step) {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, input: { ...options.input, step }, });
    }

    get required() {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, input: { ...options.input, required: true }, });
    }

    // can also be automatically deduced from shape
    name(name) {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, input: { ...options.input, name }, });
    }

    get autoFocus() {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, input: { ...options.input, autoFocus: true }, });
    }

    placeholder(placeholder) {
        const { options, } = this;
        return new DefinitionBuilder({ ...options, input: { ...options.input, placeholder }, });
    }
}

export const email = new DefinitionBuilder({ input: { type: 'email', value: '', } });
export const text = new DefinitionBuilder({ input: { type: 'text', value: '', } });
export const number = new DefinitionBuilder({ input: { type: 'number', value: 0, } });
export const password = new DefinitionBuilder({ input: { type: 'password', value: '', } });
export const radio = new DefinitionBuilder({ input: { type: 'radio', value: '', } });
export const checkbox = new DefinitionBuilder({ input: { type: 'checkbox', checked: false, } });
export const tel = new DefinitionBuilder({ input: { type: 'tel', value: '', } });
export const select = new DefinitionBuilder({ input: { type: 'select', value: '', } });