import React from 'react';
import MaterialTable from 'material-table';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Roller } from 'react-awesome-spinners';
import transactionStore from './transactionStore';
import './styles.css';

class Transaction extends React.Component {
  txInsRow = {
    Row: (props) => {
      return (
        <React.Fragment>
          <div className="container pb-3 text-break">
            <div className="row">
              {props.data.signature === '' && (
                <b>
                  Coinbase Transaction <span className="text-danger">*</span>
                </b>
              )}
            </div>
            <div className="row">
              <span>
                <b>Transaction Output Id:</b>{' '}
                <Link
                  className="text-decoration-none"
                  to={`/transaction/${props.data.txOutId}`}
                >
                  {props.data.txOutId}
                </Link>
              </span>
            </div>
            <div className="row">
              <span>
                <b>Transaction Output Index:</b> {props.data.txOutIndex}
              </span>
            </div>
            <div className="row">
              <span>
                <b>Signature:</b> {props.data.signature}
              </span>
            </div>
          </div>
          <hr />
        </React.Fragment>
      );
    },
  };

  txOutsRow = {
    Row: (props) => {
      return (
        <React.Fragment>
          <div className="container pb-3 text-break">
            <div className="row">
              <span>
                <b>Address:</b>{' '}
                <Link
                  className="text-decoration-none"
                  to={`/address/${props.data.address}`}
                >
                  {props.data.address}
                </Link>
              </span>
            </div>
            <div className="row">
              <span>
                <b>Amount:</b> {props.data.amount}
              </span>
            </div>
          </div>
          <hr />
        </React.Fragment>
      );
    },
  };

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      transactionStore.setCurTransactionId(this.props.match.params.id);
      transactionStore.fetchTransactionDetail();
    }
  }

  componentDidMount() {
    transactionStore.setCurTransactionId(this.props.match.params.id);
    transactionStore.fetchTransactionDetail();
  }

  render() {
    const store = transactionStore;
    const transaction = store.transactionDetail;

    if (transaction === null) return <Roller />;
    if (!transaction.id) return <div></div>;

    return (
      <div>
        <div className="transaction-group">
          <div className="transaction-action">Transaction</div>
          <table className="transaction-table">
            <tbody>
              <tr className="underline-row">
                <td className="head-col p-2">Id</td>
                <td className="p-2">{transaction.id}</td>
                <br />
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Total amount</td>
                <td className="p-2">{store.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="transaction-group">
          <div className="transaction-action">Transaction inputs</div>
          <MaterialTable
            title={null}
            data={transaction.txIns}
            components={this.txInsRow}
          />
        </div>
        <div className="transaction-group">
          <div className="transaction-action">Transaction outputs</div>
          <MaterialTable
            title={null}
            data={transaction.txOuts}
            components={this.txOutsRow}
          />
        </div>
      </div>
    );
  }
}

export default observer(Transaction);
