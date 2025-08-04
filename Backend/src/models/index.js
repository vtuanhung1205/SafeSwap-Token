/**
 * Models Index - Export các model đã được tối ưu
 * Chỉ giữ lại các model cần thiết cho production
 */
const { Session } = require('./Session.model');
const { SwapTransaction } = require('./SwapTransaction.model');

module.exports = {
  Session,
  SwapTransaction,
};
