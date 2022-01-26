import React from 'react';
import MaterialTable from 'material-table';
import './styles.css';

class BlockExplorer extends React.Component {
  blockColumns = [
    { title: '#', field: 'index' },
    { title: 'Hash', field: 'hash' },
    { title: 'Transactions', field: 'data.length' },
    { title: 'Time', field: 'timestamp' },
  ];

  render() {
    return (
      <div>
        <div className="bl-explorer-label">iBlockchain Block Explorer</div>
        <div className="bl-explorer-group">
          <div className="bl-explorer-action">Blocks in chain</div>
          <MaterialTable title={null} columns={this.blockColumns} data={[]} />
        </div>
      </div>
    );
  }
}

export default BlockExplorer;
