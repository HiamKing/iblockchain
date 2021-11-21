import * as WebSocket from 'ws';
import {Server} from 'ws';
import {NODE, BLOCKCHAIN} from './app';
import {Block, Blockchain, Node, isValidBlockStructure} from './models';

const SOCKETS: WebSocket[] = [];

enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2
}

class Message {
    private type: MessageType;
    private data: any;

    constructor(type: MessageType, data: any) {
        this.type = type;
        this.data = data;
    }

    public getType(): MessageType {
        return this.type;
    }

    public getData(): any {
        return this.data;
    }
}


const JSonToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data);
    } catch(e) {
        console.log(e);
        return null;
    }
}

const initP2PServer  = (p2pPort: number) => {
    const server: Server = new WebSocket.Server({port: p2pPort});

    server.on('connection', (ws: WebSocket) => {
        initConnection(ws);
    });
    console.log('Listening websocket p2p port on: ' + p2pPort);
}

const initConnection = (ws: WebSocket) => {
    SOCKETS.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
}

const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        const message: Message = JSonToObject<Message>(data);
        if(message === null) {
            console.log('Could not parse received JSON message: ' + data);
            return;
        }
        console.log('Received message' + JSON.stringify(message));

        switch(message.getType()) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseLatestMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                const receivedBlockchain: Blockchain = JSonToObject<Blockchain>(message.getData());
                if(receivedBlockchain === null) {
                    console.log('Invalid blockchain received: ');
                    console.log(message.getData());
                    break;
                }
                handleBlockchainResponse(receivedBlockchain);
                break;
            }
    });
}

const write = (ws: WebSocket, message: Message) => ws.send(JSON.stringify(message));

const broadcast = (message: Message) => SOCKETS.forEach((socket) => write(socket, message));

const queryChainLengthMsg = (): Message => new Message(MessageType.QUERY_LATEST, null);

const queryAllMsg = (): Message => new Message(MessageType.QUERY_ALL, null);

const responseChainMsg = (): Message => new Message(
    MessageType.RESPONSE_BLOCKCHAIN,
    JSON.stringify(BLOCKCHAIN)
);

const responseLatestMsg = (): Message => new Message(
    MessageType.RESPONSE_BLOCKCHAIN,
    JSON.stringify([BLOCKCHAIN.getLatestBlock()])
);

const initErrorHandler = (ws: WebSocket) => {
    const closeConnection = (myWs: WebSocket) => {
        console.log('Connection failed to peer: ' + myWs.url);
        SOCKETS.splice(SOCKETS.indexOf(myWs), 1);
    };

    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

const handleBlockchainResponse = (receivedBlockchain: Blockchain) => {
    const receivedBlocks = receivedBlockchain.getBlocks();
    if(receivedBlocks.length === 0) {
        console.log('Received block chain size of 0');
        return;
    }

    const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
    if(!isValidBlockStructure(latestBlockReceived)) {
        console.log('Block structure not valid');
        return;
    }

    const curLatestBlock = BLOCKCHAIN.getLatestBlock();
    if(latestBlockReceived.getIndex() > curLatestBlock.getIndex()) {
        console.log('Blockchain possibly behind. We got: '
            + curLatestBlock.getIndex() + ' Peer got: ' + latestBlockReceived.getIndex());
        
        if(curLatestBlock.getHash() === latestBlockReceived.getPrevHash()) {
            if(BLOCKCHAIN.addBlock(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        } else if(receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        } else {
            console.log('Received blockchain is longer than current blockchain');
            NODE.replaceChain(receivedBlockchain);
        }
    } else {
        console.log('Received blockchain is shorter than current blockchain. Do nothing!');
    }
};

const broadcastLatest = () => {
    broadcast(responseLatestMsg());
};

const connectToPeers = (newPeer: string) => {
    const ws: WebSocket = new WebSocket(newPeer);

    ws.on('open', () => {
        initConnection(ws);
    });

    ws.on('error', () => {
        console.log('Connection failed!');
    });
};

export {SOCKETS, initP2PServer, broadcastLatest, connectToPeers};
