import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { history } from './utils/navigation';
import Lobby from "./lobby/Lobby";
import Room from "./room/Room";
import { StateProvider as AuthStateProvider } from './auth/AuthContext';

// This site has 3 pages, all of which are rendered
// dynamically in the browser (not server rendered).
//
// Although the page does not ever refresh, notice how
// React Router keeps the URL up to date as you navigate
// through the site. This preserves the browser history,
// making sure things like the back button and bookmarks
// work properly.

export default function App() {
  return (
    <AuthStateProvider>
      <Router history={history}>
        <div style={{height: '100vh'}} className="d-flex flex-column">
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
          </Switch>
        </div>
        </Router>
      </AuthStateProvider>
  );
}
