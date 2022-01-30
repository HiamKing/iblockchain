import React from 'react';
import MaterialTable from 'material-table';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Roller } from 'react-awesome-spinners';
import addressStore from './addressStore';
import './styles.css';

class Address extends React.Component {
  txOutsRow = {
    Row: (props) => {
      return (
        <React.Fragment>
          <div className="container pb-3 text-break">
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
                <b>Amount:</b> {props.data.amount}
              </span>
            </div>
            <div className="row">
              <span>
                <b>Address:</b> {props.data.address}
              </span>
            </div>
          </div>
          <hr />
        </React.Fragment>
      );
    },
  };

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.address !== this.props.match.params.address) {
      addressStore.setCurAddress(this.props.match.params.address);
      addressStore.fetchAddressDetail();
    }
  }

  componentDidMount() {
    addressStore.setCurAddress(this.props.match.params.address);
    addressStore.fetchAddressDetail();
  }

  render() {
    const store = addressStore;
    const address = store.addressDetail;

    if(address === null) return <Roller/>

    return (
      <div>
        <div className="address-group">
          <div className="address-action">Address</div>
          <table className="address-table">
            <tbody>
              <tr className="underline-row text-break">
                <td className="p-2" colSpan="2">{this.props.match.params.address}</td>
                <br />
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Total amount</td>
                <td className="p-2">{store.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="address-group">
          <div className="address-action">Unspent transaction outputs</div>
          <MaterialTable
            title={null}
            data={address.unspentTxOuts}
            components={this.txOutsRow}
          />
        </div>
      </div>
    );
  }
}

export default observer(Address);