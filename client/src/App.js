import React, { useContext, useEffect, useState } from "react";
import {
  Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { history } from './utils/navigation';
import Lobby from "./lobby/Lobby";
import Room from "./room/Room";
import OAuth2Callback from './auth/OAuth2Callback';
import { StateProvider as AuthStateProvider, store as authStore, tryReuseSavedTokenAsync } from './auth/AuthContext';

function App() {
  const [authState, dispatch] = useContext(authStore);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    tryReuseSavedTokenAsync(dispatch)
      .then(() => setFetching(false));
  }, []);

  if (fetching) {
    return null;
  }

  return (
    <Router history={history}>
      <div style={{ height: '100vh' }} className="d-flex flex-column">
        <ul>
          <li>
            <Link to="/">Lobby</Link>
          </li>
        </ul>

        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
        <Switch>
          <Route exact path="/">
            <Lobby />
          </Route>
          <Route path="/room/:id" component={Room} />
          <Route path="/oauth2callback" component={OAuth2Callback} />
        </Switch>
      </div>
    </Router>
  );
}

export default function () {
  return (
    <AuthStateProvider>
      <App />
    </AuthStateProvider>
  );
};
