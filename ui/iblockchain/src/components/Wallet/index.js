import React from 'react';
import { observer } from 'mobx-react';
import MaterialTable from 'material-table';
import { Roller } from 'react-awesome-spinners';
import walletStore from './walletStore';
import './styles.css';

class Wallet extends React.Component {
  transactionPoolColumns = [{ render: (rowData) => rowData }];

  componentDidMount() {
    walletStore.fetchWalletDetail();
  }

  render() {
    const store = walletStore;

    if(store.walletDetail === null) return <Roller />;

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
          <MaterialTable
            title={null}
            data={store.walletDetail.transactionPool}
            columns={this.transactionPoolColumns}
          />
        </div>
        <div className="wallet-group">
          <div className="wallet-action">Mint block</div>
          <button className="btn btn-primary">Click to mint block</button>
        </div>
      </div>
    );
  }
}

export default observer(Wallet);
