import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { parseQueryString } from '../utils/requests';
import { store as authStore, githubOauth2LoginAsync } from './AuthContext';

export default function OAuth2Callback() {
    const query = parseQueryString(window.location.search);

    const [state, dispatch] = useContext(authStore);
    const history = useHistory();

    useEffect(() => {
        if (query.code) {
            githubOauth2LoginAsync(dispatch, query.code);
            history.push('/');
        }
    }, [query.code]);

    return (
        <div>
            Authorizing... {query.code}
        </div>
    )
}
