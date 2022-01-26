import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { routingPaths } from '../../stores/routingStore';
import Address from '../Address';
import Block from '../Block';
import BlockExplorer from '../BlockExplorer';
import Header from '../Header';
import Home from '../Home';
import Transaction from '../Transaction';
import Wallet from '../Wallet';
import './styles.css';

class App extends React.Component {
  render() {
    return (
      <div className="app">
        <Header />
        <div className="app-body">
          <Switch>
            <Route exact path={routingPaths.home} component={Home} />
            <Route path={routingPaths.wallet} component={Wallet} />
            <Route
              path={routingPaths.blockExplorer}
              component={BlockExplorer}
            />
            <Route path={routingPaths.block} component={Block} />
            <Route path={routingPaths.address} component={Address} />
            <Route path={routingPaths.transaction} component={Transaction} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
