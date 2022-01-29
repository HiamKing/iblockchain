import React from 'react';
import MaterialTable from 'material-table';
import { observer } from 'mobx-react';
import { Roller } from 'react-awesome-spinners';
import { Link } from 'react-router-dom';
import moment from 'moment';
import blockExplorerStore from './blockExplorerStore';
import './styles.css';

class BlockExplorer extends React.Component {
  blockTableStyles = {
    cellStyle: {
      'text-align': 'center',
    },
    headerStyle: {
      'text-align': 'center',
      'padding-left': '2.5rem'
    },
  };

  blockColumns = [
    { title: '#', field: 'index' },
    {
      title: 'Hash',
      field: 'hash',
      render: (props) => (
        <Link className="text-decoration-none" to={`block/${props.hash}`}>
          {props.hash}
        </Link>
      ),
    },
    { title: 'Transactions', field: 'data.length' },
    {
      title: 'Time',
      field: 'timestamp',
      render: (props) =>
        moment.unix(props.timestamp).format('MM/DD/YYYY, hh:mm:ss A'),
    },
  ];

  componentDidMount() {
    blockExplorerStore.fetchBlockchain();
  }

  render() {
    const store = blockExplorerStore;

    if (store.blockchain === null) return <Roller />;

    return (
      <div>
        <div className="bl-explorer-label">iBlockchain Block Explorer</div>
        <div className="bl-explorer-group">
          <div className="bl-explorer-action">Blocks in chain</div>
          <MaterialTable
            title={null}
            columns={this.blockColumns}
            data={store.blockchain}
            options={this.blockTableStyles}
          />
        </div>
      </div>
    );
  }
}

export default observer(BlockExplorer);
