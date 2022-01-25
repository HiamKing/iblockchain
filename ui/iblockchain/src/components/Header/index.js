import React from 'react';
import logo from './logo.png';
import { NavLink } from 'react-router-dom';
import './styles.css';
import { routingPaths } from '../../stores/routingStore';

class Header extends React.Component {
  render() {
    return (
      <div>
        <div className="header">
          <a className="header-link" href="/">
            <img src={logo} alt="homepage" />
            <p className="logo-text">iBlockchain</p>
          </a>
          <div className="header-btn">
            <NavLink className="header-btn-link" to={routingPaths.wallet}>
              Wallet
            </NavLink>
          </div>
          <div className="header-btn last-header-btn">
            <NavLink
              className="header-btn-link"
              to={routingPaths.blockExplorer}
            >
              Block Explorer
            </NavLink>
          </div>
        </div>
      </div>
    );
  }
}

export default Header;
