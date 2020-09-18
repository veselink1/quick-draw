import { APIError } from '../utils/api';
import { API_ROOT_URL } from '../config/constants';

export async function verifyTokenAsync(token) {
    const res = await fetch(`${API_ROOT_URL}/verify_token`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
    });
    if (res.status !== 200) {
        throw new APIError('Failed to reuse token', res);
    }
}

export async function oauth2LoginAsync(provider, body) {
    const res = await fetch(`${API_ROOT_URL}/oauth2/${provider}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.status !== 200) {
        throw new APIError(data.message || 'Failed to authenticate with GitHub', res);
    }

    return {
        user: { id: data.id, name: data.name },
        token: data.token,
    };
}
