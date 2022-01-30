import { action, computed, makeObservable, observable } from 'mobx';
import _ from 'lodash';
import APIS from '../../services/common';

class TransactionStore {
  curTransactionId = null;
  transactionDetail = null;

  constructor() {
    makeObservable(this, {
      curTransactionId: observable,
      transactionDetail: observable,
      totalAmount: computed,
      setCurTransactionId: action,
      fetchTransactionDetail: action,
    });
  }

  fetchTransactionDetail() {
    APIS.transaction.getTransactionDetail(this.curTransactionId).then((res) => {
      this.transactionDetail = res.data;
    });
  }

  setCurTransactionId(id) {
    this.curTransactionId = id;
  }

  get totalAmount() {
    return _(this.transactionDetail.txOuts)
      .map((txOut) => txOut.amount)
      .sum();
  }
}

export default new TransactionStore();
