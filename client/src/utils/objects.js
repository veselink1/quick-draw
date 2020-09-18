export function fromEntries(entries, prototype = null) {
    const obj = Object.create(prototype);
    for (let [key, value] of entries) {
        obj[key] = value;
    }
    return obj;
}
