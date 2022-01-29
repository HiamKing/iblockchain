import React from 'react';
import { observer } from 'mobx-react';
import MaterialTable from 'material-table';
import { Roller } from 'react-awesome-spinners';
import walletStore from './walletStore';
import './styles.css';

class Wallet extends React.Component {
  transactionPoolRow = {
    Row: (props) => {
      const txIns = props.data.txIns.map((txIn) => (
        <div>
          {txIn.signature === '' && 'coinbase'}
          {txIn.signature !== '' && (
            <div className="text-break">{`${txIn.txOutId} ${txIn.txOutIndex}`}</div>
          )}
        </div>
      ));

      const txOuts = props.data.txOuts.map((txOut) => (
        <div className="row">
          <div className="text-break">
            <span>
              <b>Address:</b> {txOut.address} -{' '}
            </span>
            <b>Amount:</b> {txOut.amount}
          </div>
        </div>
      ));

      return (
        <React.Fragment>
          <div className="container pb-3">
            <b>Transaction id:</b>
            <span className="text-break"> {props.data.id}</span>
            <div className="row">
              <div className="col-5">{txIns}</div>
              <div className="col-1">{`->`}</div>
              <div className="col-6">{txOuts}</div>
            </div>
          </div>
          <hr />
        </React.Fragment>
      );
    },
  };

  componentDidMount() {
    walletStore.fetchWalletDetail();
  }

  render() {
    const store = walletStore;

    if (store.walletDetail === null) return <Roller />;

    return (
      <div>
        <div className="wallet-label">iBlockchain Wallet</div>
        <div className="wallet-group">
          Your public address:
          <div className="wallet-value">{store.walletDetail.address}</div>
        </div>
        <div className="wallet-group">
          Your balance:
          <div className="wallet-value">{store.walletDetail.balance}</div>
        </div>
        <div className="wallet-group">
          <div className="wallet-action">Send coins</div>
          <div className="action-group">
            <div className="receiver-address-input">
              <div>Receiver address</div>
              <input
                className="action-input"
                name="address"
                type="text"
                placeholder="04f72a4541275aeb4344a8b04..."
                onChange={store.handleTmpTransactionChange.bind(store)}
              />
            </div>
            <div className="amount-input">
              <div>Amount</div>
              <input
                className="action-input"
                name="amount"
                type="number"
                placeholder="0"
                onChange={store.handleTmpTransactionChange.bind(store)}
              />
            </div>
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={store.sendTransaction.bind(store)}
          >
            Send
          </button>
        </div>
        <div className="wallet-group">
          <div className="wallet-action">Transaction pool</div>
          <MaterialTable
            title={null}
            data={store.walletDetail.transactionPool}
            components={this.transactionPoolRow}
          />
        </div>
        <div className="wallet-group">
          <div className="wallet-action">Mint block</div>
          <button
            className="btn btn-primary"
            onClick={store.mintBlock.bind(store)}
          >
            Click to mint block
          </button>
        </div>
      </div>
    );
  }
}

export default observer(Wallet);
