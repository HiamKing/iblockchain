import React from 'react';
import MaterialTable from 'material-table';
import { Roller } from 'react-awesome-spinners';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import blockStore from './blockStore';
import './styles.css';

class Block extends React.Component {
  transactionRow = {
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
              <b>Address:</b>{' '}
              <Link
                className="text-decoration-none"
                to={`/address/${txOut.address}`}
              >
                {txOut.address}
              </Link>{' '}
              -{' '}
            </span>
            <b>Amount:</b> {txOut.amount}
          </div>
        </div>
      ));

      return (
        <React.Fragment>
          <div className="container pb-3">
            <b>Transaction Id:</b>
            <Link
              className="text-decoration-none"
              to={`/transaction/${props.data.id}`}
            >
              <span className="text-break"> {props.data.id}</span>
            </Link>
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

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.hash !== this.props.match.params.hash) {
      blockStore.setCurBlockHash(this.props.match.params.hash);
      blockStore.fetchBlockDetail();
    }
  }

  componentDidMount() {
    blockStore.setCurBlockHash(this.props.match.params.hash);
    blockStore.fetchBlockDetail();
  }

  render() {
    const store = blockStore;
    const block = blockStore.blockDetail;

    if (block === null) return <Roller />;
    if (!block.hash) return <div></div>;

    return (
      <div>
        <div className="bl-group">
          <div className="bl-action">Blocks #{block.index}</div>
          <table className="bl-table">
            <tbody>
              <tr className="underline-row">
                <td className="head-col p-2">Hash</td>
                <td className="p-2">{block.hash}</td>
                <br />
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Previous hash</td>
                <td className="p-2">{block.prevHash}</td>
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Timestamp</td>
                <td className="p-2">{block.timestamp}</td>
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Difficulty</td>
                <td className="p-2">{block.difficulty}</td>
              </tr>
              <tr className="underline-row">
                <td className="head-col p-2">Number of transactions</td>
                <td className="p-2">{block.data.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bl-group">
          <div className="bl-action">Transactions</div>
          <MaterialTable
            title={null}
            data={block.data}
            components={this.transactionRow}
          />
        </div>
      </div>
    );
  }
}

export default observer(Block);
