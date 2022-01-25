import React from 'react';
import {Switch, Route, withRouter } from 'react-router-dom';
import { routingPaths } from '../../stores/routingStore';
import BlockExplorer from '../BlockExplorer';
import Header from '../Header';
import Home from '../Home';
import Wallet from '../Wallet';

class App extends React.Component {
  render() {
    return (
      <div className="app">
        <Header />
        <Switch>
          <Route exact path={routingPaths.home} component={Home} />
          <Route path={routingPaths.wallet} component={Wallet} />
          <Route path={routingPaths.blockExplorer} component={BlockExplorer} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);