import React from 'react';
import MaterialTable from 'material-table';
import './styles.css';

class Block extends React.Component {
  transactionColumns = [
    // {customize here}
  ]
  render() {
    return (
      <div>
        <div className="bl-group">
          <div className="bl-action">Blocks #1</div>
          <table className="bl-table">
            <tbody>
              <tr className="underline-row">
                <td className="head-col p-2">Hash</td>
                <td className="p-2">casasdasddasdjadasddddddddddddddddddddddddddddddddddddddshdasdgasjdashdgca</td>
                <br />
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Previous hash</td>
                <td className="p-2">vasv</td>
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Timestamp</td>
                <td className="p-2">asv</td>
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Difficulty</td>
                <td className="p-2">asv</td>
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Number of transactions</td>
                <td className="p-2">va</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bl-group">
          <div className="bl-action">Transactions</div>
          <MaterialTable title={null} data={[]} />
        </div>
      </div>
    );
  }
}

export default Block;
