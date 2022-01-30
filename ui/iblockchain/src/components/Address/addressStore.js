import { action, computed, makeObservable, observable } from 'mobx';
import _ from 'lodash';
import APIS from '../../services/common';

class AddressStore {
  curAddress = null;
  addressDetail = null;

  constructor() {
    makeObservable(this, {
      curAddress: observable,
      addressDetail: observable,
      totalAmount: computed,
      setCurAddress: action,
      fetchAddressDetail: action,
    });
  }

  fetchAddressDetail() {
    APIS.address.getAddressDetail(this.curAddress).then((res) => {
      this.addressDetail = res.data;
    });
  }

  setCurAddress(address) {
    this.curAddress = address;
  }

  get totalAmount() {
    return _(this.addressDetail.unspentTxOuts)
      .map((txOut) => txOut.amount)
      .sum();
  }
}

export default new AddressStore();
