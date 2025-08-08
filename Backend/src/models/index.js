const { User } = require('../models/User.model');
const { Wallet } = require('../models/Wallet.model');
const { TokenPrice } = require('../models/TokenPrice.model');
const { SwapTransaction } = require('../models/SwapTransaction.model');

module.exports = {
  User,
  Wallet,
  TokenPrice,
  SwapTransaction
};
