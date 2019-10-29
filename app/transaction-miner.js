const Transaction = require('../wallet/transaction');

class TransactionMiner {
constructor({ blockchain, transactionPool, wallet, pubsub }) {
  this.blockchain = blockchain;
  this.transactionPool = transactionPool;
  this.wallet = wallet;
  this.pubsub = pubsub;
}

mineTransactions() {
  const validTransactions = this.transactionPool.validTransactions();
    console.log('validTransactions', validTransactions);
    console.log('validTransactions.map(vt => vt.id)', validTransactions.map(vt => vt.id));

  validTransactions.push(
      Transaction.rewardTransaction({ minerWallet: this.wallet })
    );

  this.blockchain.addBlock({ data: validTransactions });

  this.pubsub.broadcastChain();

  this.transactionPool.clear();
  }
}

module.exports = TransactionMiner;
