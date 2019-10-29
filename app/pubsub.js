const PubNub = require('pubnub');

const credentials = {
  publishKey: 'pub-c-5041f64e-8bf3-4979-9cac-150bb0b971da',
  subscribeKey: 'sub-c-6bbc159c-d30d-11e9-9e70-eeb3a5fbbe72',
  secretKey: 'sec-c-MmEyZjE5ZGQtYzUyNy00OWRlLTg2NzYtYjI4M2FhOTMxZDFk'
};

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

class PubSub {
  constructor({ blockchain, transactionPool, wallet }) {
    this.blockchain = blockchain;
    this. transactionPool = transactionPool;
    this.wallet = wallet;

    this.pubnub = new PubNub(credentials);

    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

    this.pubnub.addListener(this.listener());
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }

  subscribeToChannels() {
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)]
    });
  }

  listener() {
    return {
      message: messageObject => {
        const { channel, message } = messageObject;

        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
        const parsedMessage = JSON.parse(message);

        switch(channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMessage, true, () => {
              this.transactionPool.clearBlockchainTransactions(
                { chain: parsedMessage }
              );
            });
            break;
          case CHANNELS.TRANSACTION:
            if (parsedMessage.input.address !== this.wallet.publicKey)
            {
              this.transactionPool.setTransaction(parsedMessage);
            }else{
              console.log('TRANSACTION broadcast recieved from self, ignoring..');
            }
            break;
          default:
            return;
        }
      }
    }
  }

  publish({ channel, message }) {

    this.pubnub.publish({ message, channel });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}

module.exports = PubSub;
