export function toQueryString(query) {
    return Object.entries(query)
        .map(([k, v]) => typeof v !== 'undefined' ? `${k}=${encodeURIComponent(v)}` : '')
        .filter(x => !!x)
        .join('&');
}

export function parseQueryString(query) {
    if (query.charAt(0) === '?') {
        query = query.substring(1);
    }
    const obj = Object.create(null);

    for (let kvp of query.split('&')) {
        const [k, v] = kvp.split('=');
        obj[k] = decodeURIComponent(v);
    }

    return obj;
}
