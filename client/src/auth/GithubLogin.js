import React, { useContext } from 'react';

import {
    GITHUB_OAUTH2_CLIENT_ID,
    GITHUB_OAUTH2_REDIRECT_URL,
    GITHUB_OAUTH2_SCOPE,
    GITHUB_OAUTH2_ALLOW_SIGNUP,
} from '../config/constants';
import { toQueryString } from '../utils/requests';

export default function GithubLogin(props) {
    const query = toQueryString({
        client_id: GITHUB_OAUTH2_CLIENT_ID,
        redirect_uri: GITHUB_OAUTH2_REDIRECT_URL,
        scope: GITHUB_OAUTH2_SCOPE,
        state: '' || void (0),
        allow_signup: !!GITHUB_OAUTH2_ALLOW_SIGNUP,
    });

    const url = `https://github.com/login/oauth/authorize?${query}`;

    return (
        <a target="_blank" href={url} {...props}>
            {props.children || "Login with GitHub"}
        </a>
    );
}
