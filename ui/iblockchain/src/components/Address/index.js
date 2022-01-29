import React from 'react';
import MaterialTable from 'material-table';
import './styles.css';

class Address extends React.Component {
  unspentTxOutColumns = [

  ]

  render() {
    return (
      <div>
        <div className="address-group">
          <div className="address-action">Address</div>
          <table className="address-table">
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
        <div className="address-group">
          <div className="address-action">Unspent transaction outputs</div>
          <MaterialTable title={null} data={[]} />
        </div>
      </div>
    );
  }
}

export default Address;