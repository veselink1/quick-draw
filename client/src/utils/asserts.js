export function expects(name, value, type) {
    if (typeof type === 'string') {
        if (typeof value !== type) {
            throw new TypeError(`Expected ${name} to be a ${type} but is a ${typeof value}`);
        }
    } else if (type instanceof Function) {
        if (!(value instanceof type)) {
            throw new TypeError(`Expected ${name} to be a ${type} but is a ${Object.getPrototypeOf(value)}`);
        }
    }
    throw new Error('Incorrect usage!');
}
