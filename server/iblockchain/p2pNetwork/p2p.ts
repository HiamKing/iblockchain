import * as WebSocket from 'ws';
import { Server } from 'ws';
import { Block } from '../blockchain/models';
import {
  addBlockToChain,
  getBlockchain,
  getLatestBlock,
  handleReceivedTransaction,
  replaceChain,
} from '../blockchain/blockchain';
import { isValidBlockStructure } from '../blockchain/validate';
import { getTransactionPool } from '../transactionPool/transactionPool';
import { JSonToObject } from './helper';
import { Transaction } from '../transaction/models';

const sockets: WebSocket[] = [];

const getSockets = (): WebSocket[] => sockets;

const write = (ws: WebSocket, message: Message): void =>
  ws.send(JSON.stringify(message));

/**
 * Function for query msg
 *
 */

const queryChainLengthMsg = (): Message => ({
  type: MessageType.QUERY_LATEST,
  data: null,
});

const queryAllMsg = (): Message => ({
  type: MessageType.QUERY_ALL,
  data: null,
});

const queryTransactionPoolMsg = (): Message => ({
  type: MessageType.QUERY_TRANSACTION_POOL,
  data: null,
});

/**
 * Function for response msg
 *
 */

const responseChainMsg = (): Message => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify(getBlockchain()),
});

const responseLatestMsg = (): Message => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify([getLatestBlock()]),
});

const responseTransactionPoolMsg = (): Message => ({
  type: MessageType.RESPONSE_TRANSACTION_POOL,
  data: JSON.stringify(getTransactionPool()),
});

/**
 * Function for broadcast msg
 *
 */

const broadcast = (message: Message): void =>
  sockets.forEach((socket) => write(socket, message));

const broadcastLatest = (): void => {
  broadcast(responseLatestMsg());
};

const broadcastTransactionPool = () => {
  broadcast(responseTransactionPoolMsg());
};

/**
 * Function for handle response
 *
 */

const handleBlockchainResponse = (receivedBlockchain: Block[]): void => {
  if (receivedBlockchain.length === 0) {
    console.log('Received block chain size of 0');
    return;
  }

  const latestBlockReceived: Block =
    receivedBlockchain[receivedBlockchain.length - 1];
  if (!isValidBlockStructure(latestBlockReceived)) {
    console.log('Block structure not valid');
    return;
  }

  const latestBlockHeld: Block = getLatestBlock();
  if (latestBlockReceived.index > latestBlockHeld.index) {
    console.log(
      'Blockchain possibly behind. We got: ' +
        latestBlockHeld.index +
        ' Peer got: ' +
        latestBlockReceived.index
    );

    if (latestBlockHeld.hash === latestBlockReceived.prevHash) {
      if (addBlockToChain(latestBlockReceived)) {
        broadcastLatest();
      }
    } else if (receivedBlockchain.length === 1) {
      console.log('We have to query the chain from our peer');
      broadcast(queryAllMsg());
    } else {
      console.log('Received blockchain is longer than current blockchain');
      replaceChain(receivedBlockchain);
    }
  } else {
    console.log(
      'Received blockchain is shorter than current blockchain. Do nothing!'
    );
  }
};

/**
 * Function for init p2p network
 *
 */

const initMessageHandler = (ws: WebSocket): void => {
  ws.on('message', (data: string) => {
    try {
      const message: Message = JSonToObject<Message>(data);
      if (message === null) {
        console.log('Could not parse received JSON message: ' + data);
        return;
      }
      console.log('Received message' + JSON.stringify(message));

      switch (message.type) {
        case MessageType.QUERY_LATEST:
          write(ws, responseLatestMsg());
          break;
        case MessageType.QUERY_ALL:
          write(ws, responseChainMsg());
          break;
        case MessageType.QUERY_TRANSACTION_POOL:
          write(ws, responseTransactionPoolMsg());
          break;
        case MessageType.RESPONSE_BLOCKCHAIN:
          const receivedBlockchain: Block[] = JSonToObject<Block[]>(
            message.data
          );
          if (receivedBlockchain === null) {
            console.log(
              'Invalid blockchain received: %s',
              JSON.stringify(message.data)
            );
            break;
          }
          handleBlockchainResponse(receivedBlockchain);
          break;
        case MessageType.RESPONSE_TRANSACTION_POOL:
          const receivedTransactions: Transaction[] = JSonToObject<
            Transaction[]
          >(message.data);
          if (receivedTransactions === null) {
            console.log(
              'Invalid transactions received: %s',
              JSON.stringify(message.data)
            );
            break;
          }

          receivedTransactions.forEach((tx: Transaction) => {
            try {
              handleReceivedTransaction(tx);

              // if no error is thrown, transaction was indeed added to pool
              // now we need broadcast transaction pool
              broadcastTransactionPool();
            } catch (e) {
              console.log(e);
            }
          });
          break;
      }
    } catch (e) {
      console.log(e);
    }
  });
};

const initErrorHandler = (ws: WebSocket): void => {
  const closeConnection = (myWs: WebSocket) => {
    console.log('Connection failed to peer: ' + myWs.url);
    sockets.splice(sockets.indexOf(myWs), 1);
  };

  ws.on('close', () => closeConnection(ws));
  ws.on('error', () => closeConnection(ws));
};

const initConnection = (ws: WebSocket): void => {
  sockets.push(ws);
  initMessageHandler(ws);
  initErrorHandler(ws);
  write(ws, queryChainLengthMsg());

  // only query transaction pool some time after chain query
  setTimeout(() => {
    broadcast(queryTransactionPoolMsg());
  }, 500);
};

const initP2PServer = (p2pPort: number): void => {
  const server: Server = new WebSocket.Server({ port: p2pPort });

  server.on('connection', (ws: WebSocket) => {
    initConnection(ws);
  });
  console.log('Listening websocket p2p port on: ' + p2pPort);
};

/**
 * Func for activities between peers
 *
 */

const connectToPeers = (newPeer: string): void => {
  const ws: WebSocket = new WebSocket(newPeer);

  ws.on('open', () => {
    initConnection(ws);
  });

  ws.on('error', () => {
    console.log('Connection failed!');
  });
};

export { getSockets, initP2PServer, broadcastLatest, connectToPeers, broadcastTransactionPool };
