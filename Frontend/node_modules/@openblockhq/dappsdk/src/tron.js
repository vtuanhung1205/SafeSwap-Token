import TronWeb from './tron/TronWeb';

class openBlockInpageProvider {
  constructor(walletRef) {
    this.walletRef = walletRef;
    this.walletProvider = 'tronLink';

    this.callBackList = {};
    this.eventListener = {};
    this.isOpenBlock = () => true;
    this.tronWeb = null;
    this.ready = false;

    this._bindTronWeb();
    this._bindEvents();

    this.request = this.request.bind(this);
  }

  async request(message) {
    console.log('tronProvider::request message:', message);
    const { method } = message;
    switch (method) {
      case 'tron_requestAccounts': {
        let res = await this._hookRequest('tron_accounts');
        if (!res) {
          res = await this._hookRequest('tron_requestAccounts');
        }
        if (!res) {
          return {
            code: 4001,
          };
        }
        this._setAddress({ address: res });
        window.postMessage(
          { message: { action: 'connect' } },
          window.location.origin,
        );
        return {
          code: 200,
        };
      }
      case 'tron_accounts': {
        if (this.ready) {
          return [this.tronWeb.defaultAddress.base58];
        }
        const res = await this.request({ method: 'tron_requestAccounts' });
        if (res.code !== 200) {
          return res;
        }
        return [this.tronWeb.defaultAddress.base58];
      }
      default:
        break;
    }
  }

  _setAddress({ address, name, type }) {
    if (!this.tronWeb.isAddress(address)) {
      this.tronWeb.defaultAddress = {
        hex: false,
        base58: false,
      };
      this.tronWeb.ready = false;
      this.ready = false;
    } else {
      this.tronWeb.setAddress(address);
      this.tronWeb.defaultAddress.name = name;
      this.tronWeb.defaultAddress.type = type;
      this.tronWeb.ready = true;
      this.ready = true;
    }
  }

  _sign(
    transaction,
    privateKey = false,
    useTronHeader = true,
    callback = false,
  ) {
    console.log(
      'tronProvider::_sign transaction:',
      transaction,
      'privateKey:',
      privateKey,
      'useTronHeader:',
      useTronHeader,
      'callback:',
      callback,
    );
    if (typeof privateKey === 'function') {
      callback = privateKey;
      privateKey = false;
    }

    if (typeof useTronHeader === 'function') {
      callback = useTronHeader;
      useTronHeader = true;
    }

    if (!callback) {
      return new Promise((resolve, reject) => {
        this._sign(transaction, privateKey, useTronHeader, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    }

    if (privateKey) {
      return this.tronWeb.sign(
        transaction,
        privateKey,
        useTronHeader,
        callback,
      );
    }

    if (!transaction) {
      return callback('Invalid transaction provided');
    }

    if (!this.ready) {
      return callback('User has not unlocked wallet');
    }

    if (typeof transaction === 'string') {
      this._hookRequest({
        method: 'tron_signMessage',
        params: {
          data: transaction,
          input: transaction,
        },
      })
        .then((tx) => {
          if (tx) {
            callback(null, tx);
          } else {
            console.log('tronProvider::_sign failed to sign message');
            callback('failed to sign');
          }
        })
        .catch((e) => {
          console.log('tronProvider::_sign failed to sign message. error:', e);
          callback(e);
        });
      return;
    }

    this._hookRequest({
      method: 'tron_signTransaction',
      params: {
        data: transaction,
        input:
          transaction.__payload__ ||
          transaction.raw_data.contract[0].parameter.value,
      },
    })
      .then((tx) => {
        if (tx) {
          callback(null, JSON.parse(tx));
        } else {
          console.log('tronProvider::_sign failed to sign transaction');
          callback('failed to sign');
        }
      })
      .catch((e) => {
        console.log(
          'tronProvider::_sign failed to sign transaction. error:',
          e,
        );
        callback(e);
      });
  }

  _send(transaction, options = {}, callback = false) {
    console.log('tronProvider::_send transaction:', transaction);
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (!callback) {
      return new Promise((resolve, reject) => {
        this._send(transaction, options, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    }

    if (typeof transaction !== 'object') {
      return callback('Invalid transaction provided');
    }

    if (!(transaction.signature instanceof Array)) {
      return callback('Transaction is not signed');
    }

    return this._hookRequest({
      method: 'tron_sendRawTransaction',
      params: {
        data: transaction,
      },
    })
      .then((res) => {
        if (res) {
          callback(null, { result: true, txid: res.data, transaction });
        } else {
          console.log('tronProvider::_send failed to send, res:', res);
          callback(null, res);
        }
      })
      .catch((e) => {
        callback(e);
      });
  }

  _bindTronWeb() {
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      // fullHost: "https://api.shasta.trongrid.io",
    });

    tronWeb.trx.sign = (...args) => {
      return this._sign(...args);
    };

    tronWeb.trx.sendRawTransaction = (...args) => {
      return this._send(...args);
    };

    this.tronWeb = tronWeb;
  }

  _bindEvents() {
    // this._registerEvent("setAccount", (address) => {
    //   this.setAddress(address);
    // });
    //
    // this._registerEvent("setNode", (node) => {
    //   this.setNode(node);
    // });
  }

  _hookRequest(paramsObj) {
    if (typeof paramsObj === 'string') {
      // eslint-disable-next-line no-param-reassign
      paramsObj = {
        method: paramsObj,
      };
    }
    // eslint-disable-next-line no-param-reassign
    paramsObj = {
      ...paramsObj,
      provider: this.walletProvider,
    };
    return this.walletRef.hookRequest(paramsObj);
  }

  // _registerEvent(event) {
  //   const value = {
  //     mark: {
  //       eventName: event,
  //       type: 'register_event',
  //     },
  //     eventName: event,
  //   };
  //   console.log('tronProvider::_registerEvent, event: ', event);
  //   window.postMessage({ from: DAPP_INPAGE, target: DAPP_CONTENT, value }, '*');
  // }
}

export default openBlockInpageProvider;
