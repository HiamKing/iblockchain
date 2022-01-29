import React from 'react';
import MaterialTable from 'material-table';
import './styles.css'

class Transaction extends React.Component {
  TxInsColumns = [

  ]

  TxOutsColumns = [

  ]

  render() {
    return (
      <div>
        <div className="transaction-group">
          <div className="transaction-action">Transaction</div>
          <table className="transaction-table">
            <tbody>
              <tr className="underline-row">
                <td className="p-2" colSpan="2">casasdasddasdjadasddddddddddddddddddddddddddddddddddddddshdasdgasjdashdgca</td>
                <br />
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Total amount</td>
                <td className="p-2">150.35</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="transaction-group">
          <div className="transaction-action">Transaction inputs</div>
          <MaterialTable title={null} data={[]} />
        </div>
        <div className="transaction-group">
          <div className="transaction-action">Transaction outputs</div>
          <MaterialTable title={null} data={[]} />
        </div>
      </div>
    );
  }
}

export default Transaction;