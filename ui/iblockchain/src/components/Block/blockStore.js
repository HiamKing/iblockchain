import { action, makeObservable, observable } from 'mobx';
import APIS from '../../services/common';

class BlockStore {
  curBlockHash = null;
  blockDetail = null;

  constructor() {
    makeObservable(this, {
      curBlockHash: observable,
      blockDetail: observable,
      setCurBlockHash: action,
      fetchBlockDetail: action,
    });
  }

  fetchBlockDetail() {
    APIS.block.getBlockDetail(this.curBlockHash).then((res) => {
      this.blockDetail = res.data;
    });
  }

  setCurBlockHash(hash) {
    this.curBlockHash = hash;
  }
}

export default new BlockStore();
