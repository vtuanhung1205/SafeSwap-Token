class openBlockAptosProvider {
  constructor(walletRef) {
    this.walletRef = walletRef;
    this.walletProvider = 'aptos';
    this.callBackList = {};
    this.isOpenBlock = true;

    this.connect = this.connect.bind(this);

    this.account = this.account.bind(this);
    this.network = this.network.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.isConnected = this.isConnected.bind(this);

    this.signTransaction = this.signTransaction.bind(this);
    this.signAndSubmitTransaction = this.signAndSubmitTransaction.bind(this);
    this.signMessage = this.signMessage.bind(this);

    this.onAccountChange = this.onAccountChange.bind(this);
    this.onNetworkChange = this.onNetworkChange.bind(this);
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

  async account() {
    const res = await this.request({ method: 'aptos_accounts' });
    return res;
  }

  async connect() {
    return this.request({ method: 'aptos_requestAccounts' });
  }

  async disconnect() {
    return true;
  }

  async isConnected() {
    const res = await this._hookRequest('aptos_accounts');
    if (res && res.address && res.publicKey) {
      return true;
    }
    return false;
  }

  async network() {
    const res = await this._hookRequest('aptos_network');
    return res;
  }

  async signAndSubmitTransaction(params) {
    const result = await this.request({
      method: 'aptos_sendTransaction',
      params,
    });
    return { hash: result };
  }

  async signTransaction(params) {
    const result = await this.request({
      method: 'aptos_signTransaction',
      params,
    });
    return result;
  }

  async signMessage(params) {
    const res = await this.request({ method: 'aptos_sign', params });
    return res;
  }

  async request(params) {
    return this._hookRequest(params);
  }

  onAccountChange(cbk) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const res = await this._hookRequest('aptos_accounts');
      cbk(res);
      resolve();
    });
  }

  onNetworkChange(cbk) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const res = await this._hookRequest('aptos_network');
      cbk(res);
      resolve();
    });
  }
}

export default openBlockAptosProvider;
