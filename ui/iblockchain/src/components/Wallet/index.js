import React from 'react';
import './styles.css';

class Wallet extends React.Component {
  render() {
    return (
      <div>
        <div className="wallet-label">iBlockchain Wallet</div>
        <div className="wallet-group">
          Your public address:
          <div className="wallet-value">
            a89sd0as7udasjdas09das0d9asusdadasjdoasdj9asd0as9jd
          </div>
        </div>
        <div className="wallet-group">
          Your balance:
          <div className="wallet-value">
            a89sd0as7udasjdas09das0d9asusdadasjdoasdj9asd0as9jd
          </div>
        </div>
        <div className="wallet-group">
          <div className="wallet-action">Send coins</div>
          <div className="action-group">
            <div className="receiver-address-input">
              <div>Receiver address</div>
              <input
                className="action-input"
                type="text"
                placeholder="04f72a4541275aeb4344a8b04..."
              />
            </div>
            <div className="amount-input">
              <div>Amount</div>
              <input className="action-input" type="number" placeholder="0" />
            </div>
          </div>
          <button className="btn btn-primary mt-3">Send</button>
        </div>
        <div className="wallet-group">
          <div className="wallet-action">Transaction pool</div>
        </div>
        <div className="wallet-group">
          <div className="wallet-action">Mint block</div>
          <button className="btn btn-primary">Click to mint block</button>
        </div>
      </div>
    );
  }
}

export default Wallet;
