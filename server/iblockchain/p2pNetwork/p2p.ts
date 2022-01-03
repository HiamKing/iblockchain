import * as WebSocket from 'ws';
import { Server } from 'ws';

const sockets: WebSocket[] = [];

const JSonToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
        return null;
    }
}

const initP2PServer = (p2pPort: number): void => {
    const server: Server = new WebSocket.Server({ port: p2pPort });

    server.on('connection', (ws: WebSocket) => {
        initConnection(ws);
    });
    console.log('Listening websocket p2p port on: ' + p2pPort);
}

const getSockets = (): WebSocket[] => sockets;

const initConnection = (ws: WebSocket): void => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
}

const initMessageHandler = (ws: WebSocket): void => {
    ws.on('message', (data: string) => {
        const message: Message = JSonToObject<Message>(data);
        if (message === null) {
            console.log('Could not parse received JSON message: ' + data);
            return;
        }
        console.log('Received message' + JSON.stringify(message));

        switch (message.getType()) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                const receivedBlockchain: Block[] = JSonToObject<Block[]>(message.getData());
                if (receivedBlockchain === null) {
                    console.log('Invalid blockchain received: ');
                    console.log(message.getData());
                    break;
                }
                handleBlockchainResponse(receivedBlockchain);
                break;
        }
    });
}

const write = (ws: WebSocket, message: Message): void => ws.send(JSON.stringify(message));

const broadcast = (message: Message): void => sockets.forEach((socket) => write(socket, message));

const queryChainLengthMsg = (): Message => new Message(MessageType.QUERY_LATEST, null);

const queryAllMsg = (): Message => new Message(MessageType.QUERY_ALL, null);

const responseChainMsg = (): Message => new Message(
    MessageType.RESPONSE_BLOCKCHAIN,
    JSON.stringify(getBlockchain())
);

const responseLatestMsg = (): Message => new Message(
    MessageType.RESPONSE_BLOCKCHAIN,
    JSON.stringify([getLatestBlock()])
);

const initErrorHandler = (ws: WebSocket): void => {
    const closeConnection = (myWs: WebSocket) => {
        console.log('Connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };

    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

const handleBlockchainResponse = (receivedBlockchain: Block[]): void => {
    if (receivedBlockchain.length === 0) {
        console.log('Received block chain size of 0');
        return;
    }

    const latestBlockReceived: Block = receivedBlockchain[receivedBlockchain.length - 1];
    if (!isValidBlockStructure(latestBlockReceived)) {
        console.log('Block structure not valid');
        return;
    }

    const latestBlockHeld: Block = getLatestBlock();
    if (latestBlockReceived.getIndex() > latestBlockHeld.getIndex()) {
        console.log('Blockchain possibly behind. We got: '
            + latestBlockHeld.getIndex() + ' Peer got: ' + latestBlockReceived.getIndex());

        if (latestBlockHeld.getHash() === latestBlockReceived.getPrevHash()) {
            if (addBlockToChain(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        } else if (receivedBlockchain.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        } else {
            console.log('Received blockchain is longer than current blockchain');
            replaceChain(receivedBlockchain);
        }
    } else {
        console.log('Received blockchain is shorter than current blockchain. Do nothing!');
    }
};

const broadcastLatest = (): void => {
    broadcast(responseLatestMsg());
};

const connectToPeers = (newPeer: string): void => {
    const ws: WebSocket = new WebSocket(newPeer);

    ws.on('open', () => {
        initConnection(ws);
    });

    ws.on('error', () => {
        console.log('Connection failed!');
    });
};

export { getSockets, initP2PServer, broadcastLatest, connectToPeers };
